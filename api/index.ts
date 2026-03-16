import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import signatureRoutes from "./routes/signatures.js";
import profileRoutes from "./routes/profile.js";
import verifyRoutes from "./routes/verify.js";
import sealRoutes from "./routes/seal.js"; // ✅ BARU

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/signatures", signatureRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/seal", sealRoutes); // ✅ BARU

// Proxy for QR Download
app.get("/api/proxy-qr", async (req, res) => {
  const { url, filename } = req.query;
  if (!url || typeof url !== 'string') return res.status(400).send("URL required");
  
  const downloadName = filename ? `${filename}.png` : 'qr-code.png';
  
  try {
    const axiosConfig = { 
      responseType: 'arraybuffer' as const,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    let response;
    try {
      const u = new URL(url);
      response = await axios.get(u.origin + u.pathname, {
        ...axiosConfig,
        params: Object.fromEntries(u.searchParams)
      });
    } catch (innerError) {
      const u = new URL(url);
      const text = u.searchParams.get('text') || '';
      const secondaryUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=300x300`;
      response = await axios.get(secondaryUrl, axiosConfig);
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.send(Buffer.from(response.data));
  } catch (e) {
    res.status(500).send("Failed to fetch QR");
  }
});

// EKSPORT UNTUK VERCEL
export default app;

// Jalankan listen hanya jika di lingkungan lokal
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
  });
}
