import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

// Routes
import authRoutes from "./server/routes/auth";
import adminRoutes from "./server/routes/admin";
import signatureRoutes from "./server/routes/signatures";
import profileRoutes from "./server/routes/profile";
import verifyRoutes from "./server/routes/verify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API ROUTES ---
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/signatures", signatureRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/verify", verifyRoutes);

  // Proxy for QR Download
  app.get("/api/proxy-qr", async (req, res) => {
    const { url, filename } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).send("URL required");
    
    const downloadName = filename ? `${filename}.png` : 'qr-code.png';
    
    try {
      let response;
      const axiosConfig = { 
        responseType: 'arraybuffer' as const,
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      try {
        const u = new URL(url);
        response = await axios.get(u.origin + u.pathname, {
          ...axiosConfig,
          params: Object.fromEntries(u.searchParams)
        });
      } catch (innerError: any) {
        const u = new URL(url);
        const text = u.searchParams.get('text') || '';
        const secondaryUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=300x300`;
        response = await axios.get(secondaryUrl, axiosConfig);
      }
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
      res.send(Buffer.from(response.data));
    } catch (e: any) {
      res.status(500).send("Failed to fetch QR");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
