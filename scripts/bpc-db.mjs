import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { Client, neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";
import { BpcImportError, importBpcData } from "./bpc-import-data.mjs";

nextEnv.loadEnvConfig(process.cwd(), true);
neonConfig.webSocketConstructor = WebSocket;

const action = process.argv[2];
if (!["setup", "import"].includes(action) || (action === "import" && !process.argv[3])) {
  console.error("Kullanım: npm run db:setup veya npm run db:import -- .data/bpc.json");
  process.exit(1);
}
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL eksik. Proje kökündeki .env.local dosyasına Neon bağlantı adresini ekleyin.");
  process.exit(1);
}

const client = new Client({ connectionString, connectionTimeoutMillis: 15000 });
try {
  await client.connect();
  if (action === "setup") {
    await client.query(await readFile(new URL("../db/bpc-schema.sql", import.meta.url), "utf8"));
    console.log("BPC PostgreSQL tabloları hazır. Mevcut veriler korundu.");
  } else if (action === "import") {
    const filename = process.argv[3];
    const input = JSON.parse(await readFile(filename, "utf8"));
    await client.query("BEGIN");
    try {
      await importBpcData(async (text, values = []) => (await client.query(text, values)).rows, input);
      await client.query("COMMIT");
      console.log("JSON yedeği PostgreSQL'e aktarıldı. Hesapların parola özetleri korundu.");
    } catch (error) { await client.query("ROLLBACK"); throw error; }
  }
} catch (error) {
  // Do not print connection strings or driver messages containing sensitive data.
  console.error("Veritabanı işlemi tamamlanamadı.", { code: error.code, message: error instanceof BpcImportError ? error.message : "Bağlantı, şema, yedek dosyası ve veri kısıtlarını kontrol edin; hiçbir kısmi aktarım kaydedilmedi." });
  process.exitCode = 1;
} finally {
  await client.end();
}
