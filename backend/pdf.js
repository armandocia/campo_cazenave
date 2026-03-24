const PDFDocument = require('pdfkit');
const fs = require('fs');
const pool = require('./db');

async function generarPDF(pago_id) {

  const pago = await pool.query(
    `SELECT p.*, h.nombre, h.casa
     FROM pagos p
     JOIN habitantes h ON h.id = p.habitante_id
     WHERE p.id = $1`,
    [pago_id]
  );

  const detalles = await pool.query(
    `SELECT * FROM detalle_pagos WHERE pago_id = $1`,
    [pago_id]
  );

  const data = pago.rows[0];

  const path = `F:/CAMPO_CAZENAVE/recibos_pdf/recibo_${pago_id}.pdf`;

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(path));

  // Encabezado
  doc.fontSize(16).text('PATRONATO CAMPO CAZENAVE', { align: 'center' });

  doc.moveDown();
  doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });

  doc.moveDown();
  doc.text(`Casa: ${data.casa}`);
  doc.text(`Habitante: ${data.nombre}`);

  doc.moveDown();
  doc.text('Detalle del pago');

  detalles.rows.forEach(d => {
    if (d.tipo === 'factura') {
      doc.text(`Factura ID ${d.referencia_id} .......... ${d.monto}`);
    } else {
      doc.text(`Saldo histórico ID ${d.referencia_id} .. ${d.monto}`);
    }
  });

  doc.moveDown();
  doc.text(`Total pagado: ${data.monto}`);

  doc.end();

  return path;
}

module.exports = generarPDF;