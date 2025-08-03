// -----------------------------------------------------------------------------
// FILE: src/index.ts
// DESKRIPSI: Server backend lengkap untuk menerima data login.
// -----------------------------------------------------------------------------

// Panggil dotenv.config() paling pertama untuk memastikan variabel .env siap digunakan.
// Ini penting agar koneksi database bisa membaca kredensial yang benar.
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
const port = 3001; // Port tempat backend akan berjalan

// Gunakan middleware yang penting
app.use(cors());           // Mengizinkan request dari frontend (beda port)
app.use(express.json());   // Mem-parsing body request yang datang sebagai JSON

// Konfigurasi koneksi ke database Neon menggunakan variabel dari file .env
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT || 5432),
  ssl: true, // Wajib untuk koneksi ke database cloud seperti Neon
});


// =============================================================================
//  2. FUNGSI UNTUK PERSIAPAN DATABASE
// =============================================================================

/**
 * Fungsi ini memastikan tabel `user_logins` ada di database.
 * Jika tabel belum ada, ia akan membuatnya.
 * Jika sudah ada, ia tidak akan melakukan apa-apa.
 * Ini dijalankan sekali saat server pertama kali dimulai.
 */
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
    // Hentikan aplikasi jika database tidak bisa disiapkan
    process.exit(1);
  }
};


// =============================================================================
//  3. DEFINISI ENDPOINT API
// =============================================================================

/**
 * Endpoint untuk menerima data dari formulir frontend.
 * Hanya merespons request dengan metode POST ke alamat /api/simpan-data.
 */
app.post('/api/simpan-data', async (req: Request, res: Response) => {
  try {
    // Ambil data dari body request
    const { username, password } = req.body;

    // Validasi sederhana
    if (!username || !password) {
      return res.status(400).json({ message: 'Input tidak valid: Username dan password wajib diisi.' });
    }

    // Siapkan dan jalankan query untuk memasukkan data
    const queryText = 'INSERT INTO user_logins (username, password) VALUES ($1, $2)';
    await pool.query(queryText, [username, password]);

    // Kirim respons sukses kembali ke frontend
    return res.status(200).json({
      status: 'success',
      message: `Data untuk pengguna '${username}' berhasil disimpan!`,
    });

  } catch (error) {
    // Tangani error jika terjadi masalah saat query
    console.error("❌ ERROR saat memproses request /api/simpan-data:", error);
    return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server.' });
  }
});


// =============================================================================
//  4. FUNGSI UTAMA UNTUK MENJALANKAN SERVER
// =============================================================================

/**
 * Fungsi utama untuk memulai aplikasi.
 * Pertama, ia akan mempersiapkan database, lalu menjalankan server Express.
 */
const startApp = async () => {
  // Pastikan variabel lingkungan terbaca sebelum melakukan apapun
  if (!process.env.POSTGRES_HOST) {
    console.error("🚨 FATAL ERROR: Variabel .env tidak terbaca. Pastikan file .env ada di root proyek dan isinya benar.");
    process.exit(1);
  }

  // 1. Siapkan database (buat tabel jika belum ada)
  await prepareDatabase();
  
  // 2. Setelah database siap, jalankan server untuk mulai menerima request
  app.listen(port, () => {
    console.log(`🚀 Backend server berjalan dan siap menerima request di http://localhost:${port}`);
  });
};

// Panggil fungsi utama untuk memulai segalanya
startApp();