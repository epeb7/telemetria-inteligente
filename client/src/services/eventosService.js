import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function buscarUltimosEventos(limit = 10) {
  const query = `
    SELECT 
      v.placa,
      e.type AS evento,
      e.eventtime,
      e.attributes
    FROM tc_janiz.tc_events e
    JOIN tc_janiz.tc_devices d ON e.deviced = d.id
    JOIN borr.veiculos v ON d.unique_id = v.imei
    ORDER BY e.eventtime DESC
    LIMIT $1
  `;
  const eventos = await prisma.$queryRawUnsafe(query, limit);
  return eventos;
}

export async function buscarEventosPorVeiculo(placa) {
  const query = `
    SELECT 
      e.type AS evento,
      e.eventtime,
      e.attributes
    FROM tc_janiz.tc_events e
    JOIN tc_janiz.tc_devices d ON e.deviced = d.id
    JOIN borr.veiculos v ON d.unique_id = v.imei
    WHERE v.placa = $1
    ORDER BY e.eventtime DESC
    LIMIT 50
  `;
  const eventos = await prisma.$queryRawUnsafe(query, placa);
  return eventos;
}