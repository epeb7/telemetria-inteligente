
import * as eventosService from '../services/eventosService.js';

export async function getUltimosEventos(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const eventos = await eventosService.buscarUltimosEventos(limit);
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}

export async function getEventosPorVeiculo(req, res) {
  try {
    const { placa } = req.params;
    const eventos = await eventosService.buscarEventosPorVeiculo(placa);
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
}
EOF