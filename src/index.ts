// Panggil dotenv.config() paling pertama
import dotenv from 'dotenv';
dotenv.config();

// Impor semua library yang dibutuhkan
import express, { Express, Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';

// =============================================================================
//  1. INISIALISASI DAN KONFIGURASI
// =============================================================================

const app: Express = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Gunakan connection string dari Vercel
  ssl: {
    rejectUnauthorized: false
  }
});

// =============================================================================
//  2. FUNGSI UNTUK PERSIAPAN DATABASE
// =============================================================================

const prepareDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_logins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password TEXT NOT NULL,
      waktu_submit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ Database siap: Tabel 'user_logins' sudah ada atau berhasil dibuat.");
  } catch (error) {
    console.error("🚨 FATAL ERROR: Gagal mempersiapkan tabel di database.", error);
    process.exit(1);
  }
};

// Panggil fungsi ini sekali saat server dimulai
prepareDatabase();

// =============================================================================
//  3. DEFINISI ENDPOINT API
// =============================================================================

app.get('/api', (req: Request, res: Response) => {
    res.send('Hello from Express backend!');
});

app.post('/api/simpan-data', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Input tidak valid: Username dan password wajib diisi.' });
    }
    const queryText = 'INSERT INTO user_logins (username, password) VALUES ($1, $2)';
    await pool.query(queryText, [username, password]);
    return res.status(200).json({
      status: 'success',
      message: `Data untuk pengguna '${username}' berhasil disimpan!`,
    });
  } catch (error) {
    console.error("❌ ERROR saat memproses request /api/simpan-data:", error);
    return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
  }
});

// =============================================================================
//  4. EKSPOR APLIKASI UNTUK VERCEL
// =============================================================================

// Hapus seluruh blok app.listen() dan startApp()
// Cukup ekspor aplikasi Express Anda. Vercel akan menanganinya dari sini.
export default app;