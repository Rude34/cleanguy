import { randomUUID } from "node:crypto";
import { database, type BpcDatabase, type Query } from "./bpc-database";
import { BpcError, type BpcProfile, type BpcQueueEntry, type BpcRecord, type BpcShift } from "./bpc-types";

type State = { active_shift_id: string | null };
type PublicProfile = Omit<BpcProfile, "password_hash">;
type Dashboard = {
  records: (BpcRecord & { profiles: PublicProfile | null })[];
  profiles: PublicProfile[];
  audit: Record<string, unknown>[];
  shifts: BpcShift[];
  active_shift_id: string | null;
  waiting_tables: (BpcQueueEntry & { profile: PublicProfile | null })[];
};

export function createBpcRepository(db: BpcDatabase) {
  const audit = (q: Query, actor: string, action: string, record: string | null, detail: string) =>
    q("INSERT INTO bpc_audit (id, actor_id, action, record_id, detail) VALUES ($1,$2,$3,$4,$5)", [randomUUID(), actor, action, record, detail]);

  async function write<T>(actorId: string | null, adminOnly: boolean, work: (q: Query, state: State) => Promise<T>) {
    return db.transaction(async (q) => {
      const [state] = await q<State>("SELECT active_shift_id FROM bpc_state WHERE singleton = true FOR UPDATE");
      if (!state) throw new BpcError("Veritabanı kurulumu eksik. db/bpc-schema.sql dosyasını Neon SQL Editor'de çalıştırın.", 503);
      if (actorId) {
        const [actor] = await q<BpcProfile>("SELECT * FROM bpc_profiles WHERE id = $1 AND is_active = true", [actorId]);
        if (!actor) throw new BpcError("Oturum açmanız gerekiyor.", 401);
        if (adminOnly && actor.role !== "admin") throw new BpcError("Bu işlem için yönetici yetkisi gerekiyor.", 403);
      }
      const result = await work(q, state);
      // Advance the singleton's PostgreSQL row version atomically with every write.
      // No schema migration is needed for existing installations.
      await q("UPDATE bpc_state SET active_shift_id = active_shift_id WHERE singleton = true");
      return result;
    });
  }

  async function startShift(q: Query, actorId: string, startedAt = new Date().toISOString()) {
    const [shift] = await q<BpcShift>(
      "INSERT INTO bpc_shifts (id, started_at, started_by) VALUES ($1,$2,$3) RETURNING *", [randomUUID(), startedAt, actorId]);
    await q("UPDATE bpc_state SET active_shift_id = $1 WHERE singleton = true", [shift.id]);
    return { ...shift, table_staff: {} };
  }

  return {
    async revision() {
      const [row] = await db.query<{ revision: string }>("SELECT xmin::text AS revision FROM bpc_state WHERE singleton = true");
      if (!row) throw new BpcError("Veritabanı kurulumu eksik.", 503);
      return row.revision;
    },
    async findProfile(field: "id" | "username", value: string) {
      // field is an internal allowlist, and user values are always parameters.
      const [profile] = await db.query<BpcProfile>(`SELECT * FROM bpc_profiles WHERE ${field} = $1 AND is_active = true`, [value]);
      return profile ?? null;
    },

    async needsSetup() {
      const [row] = await db.query<{ exists: boolean }>("SELECT EXISTS (SELECT 1 FROM bpc_profiles WHERE role = 'admin') AS exists");
      return !row.exists;
    },

    async dashboard(isAdmin: boolean) {
      // One statement gives a consistent snapshot. Password hashes never enter this result.
      const [row] = await db.query<{ data: Dashboard }>(`
        WITH people AS (
          SELECT id, username, display_name, role, is_active, created_at FROM bpc_profiles
        )
        SELECT jsonb_build_object(
          'records', COALESCE((SELECT jsonb_agg(to_jsonb(r) || jsonb_build_object('profiles', to_jsonb(p)) ORDER BY r.created_at DESC, r.id)
            FROM bpc_records r LEFT JOIN people p ON p.id = r.operator_id), '[]'::jsonb),
          'profiles', CASE WHEN $1::boolean THEN COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.created_at) FROM people p), '[]'::jsonb) ELSE '[]'::jsonb END,
          'audit', CASE WHEN $1::boolean THEN COALESCE((SELECT jsonb_agg(to_jsonb(a) || jsonb_build_object('profiles', to_jsonb(p)) ORDER BY a.created_at DESC)
            FROM (SELECT * FROM bpc_audit ORDER BY created_at DESC, id LIMIT 300) a LEFT JOIN people p ON p.id = a.actor_id), '[]'::jsonb) ELSE '[]'::jsonb END,
          'shifts', COALESCE((SELECT jsonb_agg(to_jsonb(s) || jsonb_build_object('table_staff',
            COALESCE((SELECT jsonb_object_agg(t.table_number::text, t.staff_name) FROM bpc_table_staff t WHERE t.shift_id = s.id), '{}'::jsonb)) ORDER BY s.started_at)
            FROM bpc_shifts s), '[]'::jsonb),
          'active_shift_id', (SELECT active_shift_id FROM bpc_state WHERE singleton = true),
          'waiting_tables', COALESCE((SELECT jsonb_agg(to_jsonb(w) || jsonb_build_object('profile', to_jsonb(p)) ORDER BY w.added_at, w.id)
            FROM bpc_waiting_tables w LEFT JOIN people p ON p.id = w.added_by), '[]'::jsonb)
        ) AS data`, [isAdmin]);
      return row.data;
    },

    createInitialAdmin(profile: BpcProfile) {
      return write(null, false, async (q, state) => {
        if ((await q("SELECT id FROM bpc_profiles WHERE role = 'admin' LIMIT 1")).length) throw new BpcError("Yönetici hesabı zaten oluşturulmuş.", 409);
        await q("INSERT INTO bpc_profiles (id, username, display_name, role, is_active, password_hash, created_at) VALUES ($1,$2,$3,'admin',true,$4,$5)",
          [profile.id, profile.username, profile.display_name, profile.password_hash, profile.created_at]);
        if (!state.active_shift_id) await startShift(q, profile.id);
        await audit(q, profile.id, "admin.initialized", null, "İlk yönetici hesabı oluşturuldu.");
        return profile;
      });
    },

    createRecord(actorId: string, table: number, category: string, quantity: number, key: string) {
      return write(actorId, false, async (q, state) => {
        const [previous] = await q<BpcRecord>("SELECT * FROM bpc_records WHERE operator_id = $1 AND idempotency_key = $2", [actorId, key]);
        if (previous) {
          if (previous.table_number !== table || previous.bpc_category !== category || previous.quantity !== quantity) throw new BpcError("Bu istek anahtarı farklı bir BPC kaydı için kullanılmış.", 409);
          return { record: previous, duplicate: true };
        }
        if (!state.active_shift_id) throw new BpcError("Aktif vardiya bulunamadı.", 409);
        const [record] = await q<BpcRecord>(`INSERT INTO bpc_records
          (id, shift_id, idempotency_key, table_number, bpc_category, quantity, operator_id, status)
          VALUES ($1,$2,$3,$4,$5,$6,$7,'delivered') RETURNING *`,
          [randomUUID(), state.active_shift_id, key, table, category, quantity, actorId]);
        await audit(q, actorId, "bpc.created", record.id, `Masa ${table} · ${category} · ${quantity} adet`);
        return { record, duplicate: false };
      });
    },

    addQueueTable(actorId: string, table: number) {
      return write(actorId, false, async (q) => {
        const entries = await q<BpcQueueEntry>("SELECT * FROM bpc_waiting_tables");
        if (entries.length >= 34) throw new BpcError("Sıra dolu; en fazla 34 masa eklenebilir.", 409);
        if (entries.some((entry) => entry.table_number === table)) throw new BpcError(`Masa ${table} zaten sırada.`, 409);
        const [entry] = await q<BpcQueueEntry>("INSERT INTO bpc_waiting_tables (id, table_number, added_by) VALUES ($1,$2,$3) RETURNING *", [randomUUID(), table, actorId]);
        await audit(q, actorId, "queue.table-added", null, `Masa ${table} sıraya eklendi (${entries.length + 1}. sıra).`);
        return entry;
      });
    },

    completeQueueTable(actorId: string, entryId: string) {
      return write(actorId, false, async (q) => {
        const [entry] = await q<BpcQueueEntry>("DELETE FROM bpc_waiting_tables WHERE id = $1 RETURNING *", [entryId]);
        if (!entry) throw new BpcError("Bekleyen masa bulunamadı.", 404);
        await audit(q, actorId, "queue.table-completed", null, `Masa ${entry.table_number} sıradan tamamlandı.`);
        return entry;
      });
    },

    endShift(actorId: string) {
      return write(actorId, true, async (q, state) => {
        const endedAt = new Date().toISOString();
        const [current] = await q<BpcShift>("UPDATE bpc_shifts SET ended_at = $1, ended_by = $2 WHERE id = $3 AND ended_at IS NULL RETURNING *", [endedAt, actorId, state.active_shift_id]);
        if (!current) throw new BpcError("Kapatılacak aktif vardiya bulunamadı.", 409);
        const [count] = await q<{ total: number }>("SELECT count(*)::int AS total FROM bpc_records WHERE shift_id = $1", [current.id]);
        const shift = await startShift(q, actorId, endedAt);
        await audit(q, actorId, "shift.ended", null, `Vardiya kapatıldı. ${count.total} kayıt arşivlendi.`);
        await audit(q, actorId, "shift.started", null, "Yeni vardiya başlatıldı.");
        return shift;
      });
    },

    assignStaff(actorId: string, table: number, name: string) {
      return write(actorId, true, async (q, state) => {
        if (!state.active_shift_id) throw new BpcError("Aktif vardiya bulunamadı.", 409);
        if (name) await q(`INSERT INTO bpc_table_staff (shift_id, table_number, staff_name) VALUES ($1,$2,$3)
          ON CONFLICT (shift_id, table_number) DO UPDATE SET staff_name = EXCLUDED.staff_name`, [state.active_shift_id, table, name]);
        else await q("DELETE FROM bpc_table_staff WHERE shift_id = $1 AND table_number = $2", [state.active_shift_id, table]);
        await audit(q, actorId, "shift.staff-assigned", null, name ? `Masa ${table} · ${name}` : `Masa ${table} personel ataması kaldırıldı.`);
        const [shift] = await q<BpcShift>(`SELECT s.*, COALESCE((SELECT jsonb_object_agg(table_number::text, staff_name)
          FROM bpc_table_staff WHERE shift_id = s.id), '{}'::jsonb) AS table_staff FROM bpc_shifts s WHERE id = $1`, [state.active_shift_id]);
        return shift;
      });
    },

    cancelRecord(actorId: string, recordId: string, reason: string) {
      return write(actorId, true, async (q) => {
        const [record] = await q<BpcRecord>(`UPDATE bpc_records SET status = 'cancelled', cancelled_at = now(), cancelled_by = $1, cancellation_reason = $2
          WHERE id = $3 AND status = 'delivered' RETURNING *`, [actorId, reason, recordId]);
        if (!record) throw new BpcError("Kayıt bulunamadı veya daha önce iptal edildi.", 404);
        await audit(q, actorId, "bpc.cancelled", recordId, reason);
      });
    },

    createOperator(actorId: string, profile: BpcProfile) {
      return write(actorId, true, async (q) => {
        if ((await q("SELECT id FROM bpc_profiles WHERE username = $1", [profile.username])).length) throw new BpcError("Bu kullanıcı adı zaten kullanılıyor.", 409);
        await q("INSERT INTO bpc_profiles (id, username, display_name, role, is_active, password_hash, created_at) VALUES ($1,$2,$3,'operator',true,$4,$5)",
          [profile.id, profile.username, profile.display_name, profile.password_hash, profile.created_at]);
        await audit(q, actorId, "operator.created", null, profile.username);
      });
    },

    setOperatorActive(actorId: string, userId: string, enabled: boolean) {
      return write(actorId, true, async (q) => {
        const [target] = await q<BpcProfile>("UPDATE bpc_profiles SET is_active = $1 WHERE id = $2 AND role = 'operator' RETURNING *", [enabled, userId]);
        if (!target) throw new BpcError("Operatör bulunamadı.", 404);
        await audit(q, actorId, enabled ? "operator.enabled" : "operator.disabled", null, target.username);
      });
    },

    resetPassword(actorId: string, userId: string, passwordHash: string) {
      return write(actorId, true, async (q) => {
        const [target] = await q<BpcProfile>(`UPDATE bpc_profiles SET password_hash = $1, password_changed_at = now()
          WHERE id = $2 AND role = 'operator' RETURNING *`, [passwordHash, userId]);
        if (!target) throw new BpcError("Operatör bulunamadı.", 404);
        await audit(q, actorId, "operator.password-reset", null, target.username);
      });
    },
  };
}

export const bpc = createBpcRepository(database);
