import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve os arquivos estáticos do frontend (build do React)
// Ajuste o caminho conforme a localização da sua build
const staticPath = path.resolve(__dirname, "..", "client", "dist"); // ou "build", dependendo do seu setup

app.use(express.static(staticPath));

// Para qualquer rota, serve o index.html (SPA)
app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

createServer(app).listen(PORT, () => {
  console.log(`✅ Frontend disponível em http://localhost:${PORT}`);
});