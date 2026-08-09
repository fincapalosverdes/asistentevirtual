// Render + navegación + descargas

const SECTION_TITLES = {
  resumen: ["Resumen de la finca", "Estado general, alertas y pendientes de Finca Palos Verdes. Todas las cifras provienen de los documentos verificados de la finca, con su fuente."],
  brief: ["Brief de inversión", "Versión ampliada y reconciliada. Cada cifra etiquetada [Verificado] / [Modelado] con su fuente."],
  finanzas: ["Finanzas", "Ventas, precios, costos, nómina y capex — solo cifras con documento de respaldo. Lo modelado va etiquetado."],
  hato: ["Hato y desempeño", "Inventario, pesos, ganancia diaria, preñez y sanidad — según los registros de la finca. Donde el brief difiere, se muestra la cifra verificada."],
  diagnostico: ["Diagnóstico de la finca", "Qué tiene la finca, cómo ha sido su desempeño y qué información debe completarse para due diligence."],
  certificaciones: ["Certificaciones y estado", "Certificación orgánica, sanidad, método agroecológico, gremio y estado corporativo — con vigencias y fuentes."],
  pendientes: ["Documentos por solicitar", "Lo que falta para sostener el brief en una due diligence. Empezar por la prioridad alta."],
};

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function tableFromRows(headers, rows) {
  const wrap = el("div", "table-wrap");
  const table = el("table");
  const thead = el("thead");
  const trh = el("tr");
  headers.forEach((h) => trh.appendChild(el("th", null, h)));
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = el("tbody");
  rows.forEach((r) => {
    const tr = el("tr");
    r.forEach((c) => tr.appendChild(el("td", null, c)));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function tagSpan(tag) {
  const map = { verificado: "Verificado", modelado: "Modelado", pendiente: "Pendiente" };
  return `<span class="tag ${tag}">${map[tag] || tag}</span>`;
}

function renderHeader(container, key) {
  const [title, sub] = SECTION_TITLES[key];
  const header = el("div", "section-header");
  header.appendChild(el("h1", null, title));
  header.appendChild(el("p", null, sub));
  container.appendChild(header);

  const toolbar = el("div", "toolbar no-print");
  const pdfBtn = el("button", "btn ghost", "⬇ Descargar PDF");
  pdfBtn.onclick = () => window.print();
  toolbar.appendChild(pdfBtn);
  const xlsBtn = el("button", "btn ghost", "⬇ Descargar Excel");
  xlsBtn.onclick = () => exportSectionExcel(key);
  toolbar.appendChild(xlsBtn);
  container.appendChild(toolbar);
}

// ---------- RESUMEN ----------
function renderResumen(container) {
  const grid = el("div", "kpi-grid");
  DATA.resumen.kpis.forEach((k) => {
    const card = el("div", "kpi-card");
    card.appendChild(el("div", "label", k.label));
    card.appendChild(el("div", "value", k.value));
    if (k.meta) card.appendChild(el("div", "meta", k.meta));
    if (k.diff) card.appendChild(el("div", "brief-diff", "⚠ " + k.diff));
    grid.appendChild(card);
  });
  container.appendChild(grid);

  container.appendChild(el("h2", null, "Alertas del gerente"));
  DATA.resumen.alertas.forEach((a) => {
    const box = el("div", "alert " + a.nivel);
    const badge = el("div", "badge", a.nivel);
    const body = el("div", "body");
    body.appendChild(el("strong", null, a.titulo));
    body.appendChild(el("p", null, a.texto));
    body.appendChild(el("div", "src", "📎 " + a.fuente));
    box.appendChild(badge);
    box.appendChild(body);
    container.appendChild(box);
  });
}

// ---------- BRIEF ----------
function renderBrief(container) {
  const b = DATA.brief;
  const card1 = el("div", "card");
  card1.appendChild(el("h2", null, "Nota de la fundadora"));
  card1.appendChild(el("div", "quote", b.notaFundadora));
  card1.appendChild(el("p", null, "— " + b.autor));
  container.appendChild(card1);

  const card2 = el("div", "card");
  card2.appendChild(el("h2", null, "Los 4 Retornos (Commonland)"));
  card2.appendChild(
    tableFromRows(
      ["Retorno", "Hoy", "Evidencia"],
      b.retornos.map((r) => [r.nombre, r.estado, r.detalle])
    )
  );
  container.appendChild(card2);

  const card3 = el("div", "card");
  card3.appendChild(el("h2", null, "Modelo de negocio · Manejo Holístico (Savory)"));
  card3.appendChild(el("p", null, b.modeloHolistico.resumen));
  card3.appendChild(
    tableFromRows(
      ["Línea", "US$", "COP M", "Palanca", "Ingreso/ahorro a crucero", "Payback"],
      b.modeloHolistico.lineas.map((l) => [l.linea, l.usd, l.cop, l.palanca, l.ingreso, l.payback])
    )
  );
  card3.appendChild(el("p", null, `<strong>Total núcleo:</strong> US$${b.modeloHolistico.total.usd} (COP ${b.modeloHolistico.total.cop}M)`));
  card3.appendChild(el("p", null, `<strong>Fuera del núcleo:</strong> ${b.modeloHolistico.fueraDelNucleo}`));
  container.appendChild(card3);

  const card4 = el("div", "card");
  card4.appendChild(el("h2", null, "Estado de resultados del núcleo (COP M) · Modelado"));
  card4.appendChild(
    tableFromRows(
      ["Concepto", ...b.pyl.anios],
      b.pyl.filas.map((f) => [f.label, ...f.valores])
    )
  );
  container.appendChild(card4);

  const card5 = el("div", "card");
  card5.appendChild(el("h2", null, "La finca, en cifras verificadas"));
  card5.appendChild(
    tableFromRows(
      ["Dato", "Valor", "Fuente"],
      b.fincaCifras.map((f) => [f.dato, f.valor, f.fuente])
    )
  );
  container.appendChild(card5);

  const card6 = el("div", "card");
  card6.appendChild(el("h2", null, "Cierre · La propuesta"));
  card6.appendChild(el("p", null, b.cierre));
  container.appendChild(card6);
}

// ---------- FINANZAS ----------
function renderFinanzas(container) {
  const f = DATA.finanzas;

  const c1 = el("div", "card");
  c1.appendChild(el("h2", null, "Ventas registradas"));
  c1.appendChild(
    tableFromRows(
      ["Fecha", "Línea", "Detalle", "Precio", "Total", "Comprador", "Fuente"],
      f.ventas.map((v) => [v.fecha, v.linea, v.detalle, v.precio, v.total, v.comprador, v.fuente])
    )
  );
  container.appendChild(c1);

  const c2 = el("div", "card");
  c2.appendChild(el("h2", null, "Precios de referencia"));
  c2.appendChild(
    tableFromRows(
      ["Concepto", "Valor", "Etiqueta", "Fuente"],
      f.precios.map((p) => [p.concepto, p.valor, tagSpan(p.tag), p.fuente])
    )
  );
  container.appendChild(c2);

  const c3 = el("div", "card");
  c3.appendChild(el("h2", null, "Nómina"));
  c3.appendChild(
    tableFromRows(
      ["Concepto", "Valor", "Detalle", "Fuente"],
      f.nomina.map((n) => [n.concepto, n.valor, n.detalle, n.fuente])
    )
  );
  container.appendChild(c3);

  const c4 = el("div", "card");
  c4.appendChild(el("h2", null, "Costos"));
  c4.appendChild(
    tableFromRows(
      ["Categoría", "Detalle", "Valor", "Periodo", "Tipo"],
      f.costos.map((c) => [c.categoria, c.detalle, c.valor, c.periodo, c.tipo])
    )
  );
  container.appendChild(c4);

  const c5 = el("div", "card");
  c5.appendChild(el("h2", null, "Capex right-sized (modelo costeado)"));
  c5.appendChild(
    tableFromRows(
      ["Línea", "US$", "COP", "¿Cotización?", "Fase / nota"],
      f.capex.map((c) => [c.linea, c.usd, c.cop, c.cotizacion, c.nota])
    )
  );
  c5.appendChild(el("p", null, `<strong>Total recomendado:</strong> US$${f.capexTotal.usd} (${f.capexTotal.cop}) — ${f.capexTotal.nota}`));
  container.appendChild(c5);

  const c6 = el("div", "card");
  c6.appendChild(el("h2", null, "P&L del modelo costeado (COP M)"));
  c6.appendChild(
    tableFromRows(
      ["Concepto", ...f.pyl.anios],
      f.pyl.filas.map((row) => [row.label, ...row.valores])
    )
  );
  container.appendChild(c6);
}

// ---------- HATO ----------
function renderHato(container) {
  const h = DATA.hato;

  const c1 = el("div", "card");
  c1.appendChild(el("h2", null, "Indicadores del hato — brief vs. registros verificados"));
  c1.appendChild(
    tableFromRows(
      ["Indicador", "Verificado", "Brief", "Fuente"],
      h.reconciliacion.map((r) => [r.indicador, r.verificado, r.brief, r.fuente])
    )
  );
  container.appendChild(c1);

  const c2 = el("div", "card");
  c2.appendChild(el("h2", null, "Inventario por fecha"));
  c2.appendChild(
    tableFromRows(
      ["Fecha", "Total", "Vientres", "Toro", "Terneros/Levante", "Fuente"],
      h.inventarioTiempo.map((r) => [r.fecha, r.total, r.vientres, r.toro, r.crias, r.fuente])
    )
  );
  container.appendChild(c2);

  const c2b = el("div", "card");
  c2b.appendChild(el("h2", null, "Chequeo reproductivo 27-may-2026 (registro de campo)"));
  h.chequeoReproductivo27May2026.forEach((p) => c2b.appendChild(el("p", null, "• " + p)));
  container.appendChild(c2b);

  const c3 = el("div", "card");
  c3.appendChild(el("h2", null, "Sanidad — estatus oficial ICA / FEDEGAN"));
  c3.appendChild(
    tableFromRows(
      ["Ítem", "Estado", "Detalle", "Vigencia", "Fuente"],
      h.sanidad.map((s) => [s.item, s.estado, s.detalle, s.vigencia, s.fuente])
    )
  );
  container.appendChild(c3);
}

// ---------- DIAGNOSTICO ----------
function renderDiagnostico(container) {
  const d = DATA.diagnostico;

  const c1 = el("div", "card");
  c1.appendChild(el("h2", null, "I. Qué TIENE hoy (foto actual auditable)"));
  c1.appendChild(
    tableFromRows(
      ["Activo", "Estado a 2026", "Fuente"],
      d.tiene.map((t) => [t.activo, t.estado, t.fuente])
    )
  );
  container.appendChild(c1);

  const c2 = el("div", "card");
  c2.appendChild(el("h2", null, "Desempeño financiero"));
  d.financiero.forEach((p) => c2.appendChild(el("p", null, "• " + p)));
  container.appendChild(c2);

  const c3 = el("div", "card");
  c3.appendChild(el("h2", null, "IV. Información a completar para due diligence"));
  c3.appendChild(el("h3", null, "Prioridad 1 — habilita un estado de resultados auditable"));
  d.infoFaltante.p1.forEach((p) => c3.appendChild(el("p", null, "• " + p)));
  c3.appendChild(el("h3", null, "Prioridad 2 — soporta la valoración y la trazabilidad legal"));
  d.infoFaltante.p2.forEach((p) => c3.appendChild(el("p", null, "• " + p)));
  c3.appendChild(el("h3", null, "Prioridad 3 — completa la trazabilidad del hato"));
  d.infoFaltante.p3.forEach((p) => c3.appendChild(el("p", null, "• " + p)));
  container.appendChild(c3);

  const c4 = el("div", "card");
  c4.appendChild(el("h2", null, "V. Oportunidades (de dónde sale el retorno)"));
  d.oportunidades.forEach((p) => c4.appendChild(el("p", null, "• " + p)));
  container.appendChild(c4);
}

// ---------- CERTIFICACIONES ----------
function renderCertificaciones(container) {
  const c1 = el("div", "card");
  c1.appendChild(el("h2", null, "Certificaciones y credenciales"));
  c1.appendChild(
    tableFromRows(
      ["Tema", "Estado", "Detalle", "Vigencia", "Fuente"],
      DATA.certificaciones.map((c) => [c.tema, c.estado, c.detalle, c.vigencia, c.fuente])
    )
  );
  container.appendChild(c1);
}

// ---------- PENDIENTES ----------
function renderPendientes(container) {
  const p = DATA.pendientes;
  const c1 = el("div", "card");
  c1.appendChild(el("h2", null, `Prioridad alta (${p.alta.length} documentos)`));
  c1.appendChild(
    tableFromRows(
      ["Documento", "Motivo", "Estado"],
      p.alta.map((d) => [d.doc, d.motivo, tagSpan("pendiente")])
    )
  );
  container.appendChild(c1);

  const c2 = el("div", "card");
  c2.appendChild(el("h2", null, `Prioridad media (${p.media.length} documentos)`));
  c2.appendChild(
    tableFromRows(
      ["Documento", "Motivo", "Estado"],
      p.media.map((d) => [d.doc, d.motivo, tagSpan("pendiente")])
    )
  );
  container.appendChild(c2);
}

const RENDERERS = {
  resumen: renderResumen,
  brief: renderBrief,
  finanzas: renderFinanzas,
  hato: renderHato,
  diagnostico: renderDiagnostico,
  certificaciones: renderCertificaciones,
  pendientes: renderPendientes,
};

function showSection(key) {
  document.querySelectorAll(".nav-item").forEach((n) => {
    n.classList.toggle("active", n.dataset.section === key);
  });
  const main = document.getElementById("main");
  main.innerHTML = "";
  renderHeader(main, key);
  RENDERERS[key](main);
  window.location.hash = key;
  window.scrollTo(0, 0);
}

function initApp() {
  document.querySelectorAll(".nav-item").forEach((n) => {
    n.addEventListener("click", () => showSection(n.dataset.section));
  });
  const initial = (window.location.hash || "#resumen").replace("#", "");
  showSection(RENDERERS[initial] ? initial : "resumen");
}

// ---------- Export a Excel (SheetJS) ----------
function exportSectionExcel(key) {
  const wb = XLSX.utils.book_new();

  function addSheet(name, headers, rows) {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
  }

  if (key === "resumen") {
    addSheet("KPIs", ["Indicador", "Valor", "Detalle", "Brief"], DATA.resumen.kpis.map((k) => [k.label, k.value, k.meta, k.diff]));
    addSheet("Alertas", ["Nivel", "Título", "Texto", "Fuente"], DATA.resumen.alertas.map((a) => [a.nivel, a.titulo, a.texto, a.fuente]));
  } else if (key === "brief") {
    addSheet("4 Retornos", ["Retorno", "Estado", "Evidencia"], DATA.brief.retornos.map((r) => [r.nombre, r.estado, r.detalle]));
    addSheet("Modelo holístico", ["Línea", "US$", "COP M", "Palanca", "Ingreso", "Payback"], DATA.brief.modeloHolistico.lineas.map((l) => [l.linea, l.usd, l.cop, l.palanca, l.ingreso, l.payback]));
    addSheet("P&L núcleo", ["Concepto", ...DATA.brief.pyl.anios], DATA.brief.pyl.filas.map((f) => [f.label, ...f.valores]));
  } else if (key === "finanzas") {
    addSheet("Ventas", ["Fecha", "Línea", "Detalle", "Precio", "Total", "Comprador", "Fuente"], DATA.finanzas.ventas.map((v) => [v.fecha, v.linea, v.detalle, v.precio, v.total, v.comprador, v.fuente]));
    addSheet("Precios", ["Concepto", "Valor", "Etiqueta", "Fuente"], DATA.finanzas.precios.map((p) => [p.concepto, p.valor, p.tag, p.fuente]));
    addSheet("Nomina", ["Concepto", "Valor", "Detalle", "Fuente"], DATA.finanzas.nomina.map((n) => [n.concepto, n.valor, n.detalle, n.fuente]));
    addSheet("Costos", ["Categoría", "Detalle", "Valor", "Periodo", "Tipo"], DATA.finanzas.costos.map((c) => [c.categoria, c.detalle, c.valor, c.periodo, c.tipo]));
    addSheet("Capex", ["Línea", "US$", "COP", "Cotización", "Fase"], DATA.finanzas.capex.map((c) => [c.linea, c.usd, c.cop, c.cotizacion, c.nota]));
    addSheet("P&L costeado", ["Concepto", ...DATA.finanzas.pyl.anios], DATA.finanzas.pyl.filas.map((f) => [f.label, ...f.valores]));
  } else if (key === "hato") {
    addSheet("Indicadores", ["Indicador", "Verificado", "Brief", "Fuente"], DATA.hato.reconciliacion.map((r) => [r.indicador, r.verificado, r.brief, r.fuente]));
    addSheet("Inventario", ["Fecha", "Total", "Vientres", "Toro", "Crias", "Fuente"], DATA.hato.inventarioTiempo.map((r) => [r.fecha, r.total, r.vientres, r.toro, r.crias, r.fuente]));
    addSheet("Sanidad", ["Item", "Estado", "Detalle", "Vigencia", "Fuente"], DATA.hato.sanidad.map((s) => [s.item, s.estado, s.detalle, s.vigencia, s.fuente]));
    addSheet("Chequeo reprod. 27-may", ["Punto"], DATA.hato.chequeoReproductivo27May2026.map((p) => [p]));
  } else if (key === "diagnostico") {
    addSheet("Qué tiene", ["Activo", "Estado", "Fuente"], DATA.diagnostico.tiene.map((t) => [t.activo, t.estado, t.fuente]));
    addSheet("Financiero", ["Punto"], DATA.diagnostico.financiero.map((p) => [p]));
    addSheet("Oportunidades", ["Oportunidad"], DATA.diagnostico.oportunidades.map((p) => [p]));
  } else if (key === "certificaciones") {
    addSheet("Certificaciones", ["Tema", "Estado", "Detalle", "Vigencia", "Fuente"], DATA.certificaciones.map((c) => [c.tema, c.estado, c.detalle, c.vigencia, c.fuente]));
  } else if (key === "pendientes") {
    addSheet("Prioridad alta", ["Documento", "Motivo"], DATA.pendientes.alta.map((d) => [d.doc, d.motivo]));
    addSheet("Prioridad media", ["Documento", "Motivo"], DATA.pendientes.media.map((d) => [d.doc, d.motivo]));
  }

  XLSX.writeFile(wb, `finca-palos-verdes-${key}.xlsx`);
}
