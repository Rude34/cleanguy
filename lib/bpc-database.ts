import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import WebSocket from "ws";
import { BpcError } from "./bpc-types";

neonConfig.webSocketConstructor = WebSocket;

export type Query = <T = Record<string, unknown>>(text: string, values?: unknown[]) => Promise<T[]>;
export type BpcDatabase = {
  query: Query;
  transaction: <T>(work: (query: Query) => Promise<T>) => Promise<T>;
};

function connectionString() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new BpcError("Neon bağlantısı eksik. Vercel ayarlarına DATABASE_URL ekleyip yeniden deploy edin.", 503);
  return value;
}

// Dates have the same JSON representation through HTTP and WebSocket queries.
export function jsonRows<T>(rows: unknown): T[] { return JSON.parse(JSON.stringify(rows)) as T[]; }

export const database: BpcDatabase = {
  async query<T>(text: string, values: unknown[] = []) {
    const sql = neon(connectionString());
    return jsonRows<T>(await sql.query(text, values));
  },
  async transaction<T>(work: (query: Query) => Promise<T>) {
    // Neon WebSocket sessions must be closed within the serverless request.
    const pool = new Pool({ connectionString: connectionString(), max: 1, connectionTimeoutMillis: 15000 });
    let client;
    try {
      client = await pool.connect();
      const query: Query = async <R>(text: string, values: unknown[] = []) => jsonRows<R>((await client!.query(text, values)).rows);
      await query("BEGIN");
      try {
        await query("SET LOCAL statement_timeout = '15s'");
        await query("SET LOCAL lock_timeout = '5s'");
        const result = await work(query);
        await query("COMMIT");
        return result;
      } catch (error) {
        await query("ROLLBACK");
        throw error;
      }
    } finally {
      client?.release();
      await pool.end();
    }
  },
};
