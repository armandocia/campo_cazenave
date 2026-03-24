const express = require('express');
const router = express.Router();
const { registrarPago } = require('../pagos');
const generarPDF = require('../pdf');
const pool = require('../db');

// REGISTRAR PAGO
router.post('/pagar', async (req, res) => {
  try {
    const { habitante_id, monto } = req.body;

    const resultado = await registrarPago(habitante_id, monto);

    if (!resultado.ok) {
      return res.status(500).json(resultado);
    }

    // Generar PDF automáticamente
    const pdfPath = await generarPDF(resultado.pago_id);

    res.json({
      ok: true,
      pago_id: resultado.pago_id,
      pdf: pdfPath
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// LISTAR PAGOS
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, 'recibo_' || id || '.pdf' as pdf
      FROM pagos
      ORDER BY id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// EXPORTAR (SIEMPRE AL FINAL)
module.exports = router;