// src/index.ts (di proyek backend)

import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import { Pool } from 'pg';
import cors, { CorsOptions } from 'cors'; // <-- Impor CorsOptions

const app: Express = express();

// --- PERUBAHAN UTAMA DI SINI ---
// 1. Buat daftar domain yang diizinkan
const allowedOrigins = [
  'https://ig-clone-fe.vercel.app', // URL Produksi Utama
  // Tambahkan pola untuk URL Preview Vercel Anda.
  // Ganti 'anggas-projects' dengan nama user/tim Vercel Anda jika berbeda.
  new RegExp(`^https://ig-clone-fe-.*-anggas-projects.vercel.app$`)
];

// 2. Buat konfigurasi CORS
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (seperti dari Postman atau aplikasi mobile)
    if (!origin) return callback(null, true);

    // Periksa apakah origin request ada di dalam daftar izin
    if (allowedOrigins.some(allowedOrigin => 
        typeof allowedOrigin === 'string' 
            ? allowedOrigin === origin 
            : allowedOrigin.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// 3. Gunakan konfigurasi CORS yang sudah dibuat
app.use(cors(corsOptions));
// --- AKHIR PERUBAHAN ---

app.use(express.json());

// ... sisa kode Anda (Pool, prepareDatabase, endpoints, export) tetap sama ...
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, 
  ssl: {
    rejectUnauthorized: false
  }
});

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

prepareDatabase();

app.get('/api', (req, res) => {
    res.send('Hello from Express backend!');
});

app.post('/api/simpan-data', async (req, res) => {
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

export default app;