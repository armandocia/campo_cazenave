const pool = require('./db');

async function registrarPago(habitante_id, monto) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Registrar pago
    const pagoRes = await client.query(
      `INSERT INTO pagos (habitante_id, monto, fecha)
       VALUES ($1, $2, NOW())
       RETURNING id`,
      [habitante_id, monto]
    );

    const pago_id = pagoRes.rows[0].id;
    let restante = monto;

    // 2. Facturas pendientes (más antiguas primero)
    const facturas = await client.query(
      `SELECT * FROM facturas
       WHERE habitante_id = $1 AND estado != 'PAGADO'
       ORDER BY anio, mes`,
      [habitante_id]
    );

    for (let f of facturas.rows) {
      if (restante <= 0) break;

      let deuda = f.monto - f.pagado;
      let aplicar = Math.min(restante, deuda);

      await client.query(
        `UPDATE facturas
         SET pagado = pagado + $1,
             estado = CASE 
               WHEN pagado + $1 >= monto THEN 'PAGADO'
               ELSE 'PARCIAL'
             END
         WHERE id = $2`,
        [aplicar, f.id]
      );

      await client.query(
        `INSERT INTO detalle_pagos (pago_id, tipo, referencia_id, monto)
         VALUES ($1, 'factura', $2, $3)`,
        [pago_id, f.id, aplicar]
      );

      restante -= aplicar;
    }

    // 3. Saldo histórico
    const historico = await client.query(
      `SELECT * FROM saldos_historicos
       WHERE habitante_id = $1 AND saldo > 0
       ORDER BY anio`,
      [habitante_id]
    );

    for (let h of historico.rows) {
      if (restante <= 0) break;

      let aplicar = Math.min(restante, h.saldo);

      await client.query(
        `UPDATE saldos_historicos
         SET saldo = saldo - $1
         WHERE id = $2`,
        [aplicar, h.id]
      );

      await client.query(
        `INSERT INTO detalle_pagos (pago_id, tipo, referencia_id, monto)
         VALUES ($1, 'historico', $2, $3)`,
        [pago_id, h.id, aplicar]
      );

      restante -= aplicar;
    }

    // 4. Saldo a favor
    if (restante > 0) {
      await client.query(
        `UPDATE habitantes
         SET saldo_favor = saldo_favor + $1
         WHERE id = $2`,
        [restante, habitante_id]
      );
    }

    await client.query('COMMIT');

    return { ok: true, pago_id };

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return { ok: false, error: err.message };
  } finally {
    client.release();
  }
}

module.exports = { registrarPago };

async function pagar() {
  const habitante_id = document.getElementById('habitante').value;
  const monto = document.getElementById('monto').value;

  const res = await fetch('/api/pagos/pagar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ habitante_id, monto })
  });

  const data = await res.json();

  if (data.ok) {
    alert('Pago registrado correctamente');

    // abrir PDF automáticamente
    window.open(data.pdf, '_blank');
  } else {
    alert('Error: ' + data.error);
  }
}









