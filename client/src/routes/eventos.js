
import express from 'express';
import { getUltimosEventos, getEventosPorVeiculo } from '../controllers/eventosController.js';

const router = express.Router();

router.get('/ultimos', getUltimosEventos);
router.get('/veiculo/:placa', getEventosPorVeiculo);

export default router;
EOF