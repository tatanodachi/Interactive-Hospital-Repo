import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Check if API token is configured
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets."
        });
      }

      // Lazy GoogleGenAI Client initialization
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Call Gemini 3.5-flash as recommended
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a helpful assistant.",
        },
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      // Check for project access denied or permission denied issues
      if (err.message && err.message.includes("denied access")) {
        return res.status(403).json({
          error: "API Key Permission Denied: Your API key or associated project does not have permission to access Gemini. Please verify your billing/terms or use the secret key manager in the upper-right menu to connect a new key."
        });
      }
      res.status(500).json({ error: err.message || "Failed to generate content" });
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
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static assets, but do not automatically serve index.html
    app.use(express.static(distPath, { index: false }));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        try {
          let html = fs.readFileSync(indexPath, 'utf8');
          
          // Construct config using any available Firebase env variables
          const runtimeConfig = {
            apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
            authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
            projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
            messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
            appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
            measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || "",
            firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID || ""
          };

          const scriptTag = `<script>window.__FIREBASE_CONFIG__ = ${JSON.stringify(runtimeConfig)};</script>`;
          html = html.replace('</head>', `${scriptTag}</head>`);
          
          res.send(html);
        } catch (err) {
          console.error("Failed to inject runtime config into index.html:", err);
          res.sendFile(indexPath);
        }
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
