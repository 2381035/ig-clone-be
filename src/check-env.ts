import dotenv from 'dotenv';

// Panggil fungsi config untuk memuat file .env
dotenv.config();

console.log("--- MEMULAI TES DIAGNOSTIK FILE .ENV ---");
console.log("Mencoba membaca variabel dari file .env...");
console.log(`HOST yang terbaca: ${process.env.POSTGRES_HOST}`);
console.log("--- TES SELESAI ---");