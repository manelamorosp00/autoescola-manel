import { Pool } from "pg";

// App d'una sola usuària (Ares "Suricata"), per això la fila és fixa.
const USER_ID = "ares";

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  // No aturem l'arrencada de l'app perquè el build de Vercel no falli
  // sense la variable; l'error apareixerà clarament a l'hora de fer servir l'API.
  console.warn(
    "Falta la variable d'entorn POSTGRES_URL / DATABASE_URL. Connecta una base de dades Postgres al projecte a Vercel (pestanya Storage)."
  );
}

// Reutilitzem el pool entre invocacions "calentes" de la funció serverless.
let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString && connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
      max: 1,
    });
  }
  return pool;
}

let tableReady = false;
async function ensureTable(client) {
  if (tableReady) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  tableReady = true;
}

export async function loadProgress() {
  const client = await getPool().connect();
  try {
    await ensureTable(client);
    const { rows } = await client.query("SELECT data FROM progress WHERE id = $1", [USER_ID]);
    if (rows.length === 0) return null;
    return rows[0].data;
  } finally {
    client.release();
  }
}

export async function saveProgress(data) {
  const client = await getPool().connect();
  try {
    await ensureTable(client);
    await client.query(
      `INSERT INTO progress (id, data, updated_at)
       VALUES ($1, $2::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET data = $2::jsonb, updated_at = now()`,
      [USER_ID, JSON.stringify(data)]
    );
  } finally {
    client.release();
  }
}
