import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import eventosRoutes from './src/routes/events.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/api/eventos', eventosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});