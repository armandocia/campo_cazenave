async function registrarPago() {
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
    alert('Pago guardado');

    cargarPagos();
  } else {
    alert('Error: ' + data.error);
  }
}

async function cargarPagos() {
  const res = await fetch('/api/pagos');
  const data = await res.json();

  const tbody = document.querySelector('#tablaPagos tbody');
  tbody.innerHTML = '';

  data.forEach(p => {
    const fila = `
      <tr>
        <td>${p.id}</td>
        <td>${p.habitante_id}</td>
        <td>${p.monto}</td>
        <td>${p.fecha}</td>
        <td>
	<button onclick="verPDF('${p.pdf}')">ver PDF</button>
        <td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}
	
cargarPagos();

function verPDF(nombre) {
  window.open('/recibos/' + nombre, '_blank');
}