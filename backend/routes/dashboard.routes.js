const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ingresos por mes
router.get('/ingresos', async (req, res) => {
  const result = await pool.query(`
    SELECT EXTRACT(MONTH FROM fecha) as mes, SUM(monto) as total
    FROM pagos
    GROUP BY mes
    ORDER BY mes
  `);

  res.json(result.rows);
});

// Morosidad
router.get('/morosidad', async (req, res) => {
  const result = await pool.query(`
    SELECT estado, COUNT(*) as cantidad
    FROM facturas
    GROUP BY estado
  `);

  res.json(result.rows);
});

// Histórico
router.get('/historico', async (req, res) => {
  const result = await pool.query(`
    SELECT anio, SUM(saldo) as total
    FROM saldos_historicos
    GROUP BY anio
    ORDER BY anio
  `);

  res.json(result.rows);
});

// RESUMEN
router.get('/resumen', async (req, res) => {
  try {

    const ingresos = await pool.query(`
      SELECT COALESCE(SUM(monto),0) as total FROM pagos
    `);

    const morosos = await pool.query(`
      SELECT COUNT(*) as total 
      FROM facturas 
      WHERE estado != 'PAGADO'
    `);

    const historico = await pool.query(`
      SELECT COALESCE(SUM(saldo),0) as total 
      FROM saldos_historicos
    `);

    res.json({
      ingresos: ingresos.rows[0].total,
      morosidad: morosos.rows[0].total,
      historico: historico.rows[0].total
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en resumen' });
  }
});

// 👇 SIEMPRE AL FINAL
module.exports = router;