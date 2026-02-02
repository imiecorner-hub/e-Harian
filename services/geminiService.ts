import { GoogleGenAI } from "@google/genai";
import { PunchRecord } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey });

export const analyzeAttendance = async (records: PunchRecord[], monthName: string): Promise<string> => {
  if (!apiKey) {
    return "API Key tidak ditemui. Sila pastikan API key telah dikonfigurasi.";
  }

  try {
    // Prepare data for the prompt
    const dataSummary = JSON.stringify(records.filter(r => r.inTime || r.outTime));

    const prompt = `
      Anda adalah pembantu HR yang bijak. Sila sediakan "Laporan Keseluruhan Bulanan" untuk rekod kehadiran pekerja ini bagi bulan ${monthName}.
      
      Data Kehadiran (JSON):
      ${dataSummary}

      Sila berikan laporan dalam Bahasa Melayu yang profesional dengan format berikut:
      
      # Laporan Keseluruhan Bulanan: ${monthName}

      ## 1. Ringkasan Eksekutif
      (Berikan rumusan padat tentang jumlah hari bekerja, purata jam, dan disiplin masa).

      ## 2. Analisis Kehadiran
      - **Jumlah Hari Hadir:** [Jumlah] hari
      - **Kerap Lewat:** [Jumlah] kali (Lewat dikira selepas 9:00 AM)
      - **Corak Waktu Masuk/Keluar:** (Ulasan mengenai konsistensi waktu).

      ## 3. Cadangan & Penambahbaikan
      (Berikan nasihat profesional atau kata-kata semangat untuk pekerja).
      
      Gunakan format Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster simple text response
      }
    });

    return response.text || "Tiada analisis dapat dijana.";

  } catch (error) {
    console.error("Error analyzing attendance:", error);
    return "Maaf, berlaku ralat semasa menjana analisis AI. Sila cuba lagi.";
  }
};