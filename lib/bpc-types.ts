export type BpcProfile = { id: string; username: string; display_name: string; role: "admin" | "operator"; is_active: boolean; password_hash: string; password_changed_at?: string | null; created_at: string };
export type BpcRecord = { id: string; shift_id: string; idempotency_key?: string | null; table_number: number; bpc_category: string; quantity: number | null; operator_id: string; status: "delivered" | "cancelled"; created_at: string; cancelled_at: string | null; cancelled_by: string | null; cancellation_reason: string | null };
export type BpcShift = { id: string; started_at: string; ended_at: string | null; started_by: string | null; ended_by: string | null; table_staff: Record<string, string> };
export type BpcQueueEntry = { id: string; table_number: number; added_by: string; added_at: string };

export const allowedTables = Array.from({ length: 35 }, (_, index) => index + 7);
export const allowedCategories = ["Kat0 (XL)", "Kat0 (Normal)", "Kat0 (Sağlık Güzellik)", "Zemin (Karışık)", "Zemin (Elektronik)", "Kat0-Zemin (Karışık)", "Kat0 (Seri Ürün)", "Zemin(Su-Redbull)", "Zemin (Peçete)"];

export class BpcError extends Error {
  constructor(message: string, public status = 400) { super(message); this.name = "BpcError"; }
}
