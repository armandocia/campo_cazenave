async function cargarIngresos() {
  const res = await fetch('/api/dashboard/ingresos');
  const data = await res.json();

  new Chart(document.getElementById('graficoIngresos'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.mes),
      datasets: [{ data: data.map(d => d.total) }]
    }
  });
}

async function cargarMorosidad() {
  const res = await fetch('/api/dashboard/morosidad');
  const data = await res.json();

  new Chart(document.getElementById('graficoMorosidad'), {
    type: 'pie',
    data: {
      labels: data.map(d => d.estado),
      datasets: [{ data: data.map(d => d.cantidad) }]
    }
  });
}

async function cargarHistorico() {
  const res = await fetch('/api/dashboard/historico');
  const data = await res.json();

  new Chart(document.getElementById('graficoHistorico'), {
    type: 'bar',
    data: {
      labels: data.map(d => d.anio),
      datasets: [{ data: data.map(d => d.total) }]
    }
  });
}

cargarIngresos();
cargarMorosidad();
cargarHistorico();

async function cargarResumen() {
  const res = await fetch('/api/dashboard/resumen');
  const data = await res.json();

  document.getElementById('ingresos').innerText = "L. " + data.ingresos;
  document.getElementById('morosidad').innerText = data.morosidad;
  document.getElementById('historico').innerText = data.historico;
}

cargarResumen();








