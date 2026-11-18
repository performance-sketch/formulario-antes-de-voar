/* Vertical Rio — terminal "Antes de voar". Sem dependências. */
(function () {
  'use strict';
  const CFG = window.CONFIG || {};
  const P = window.PERGUNTAS;
  const T = window.TEXTOS_FORM;
  const params = new URLSearchParams(location.search);
  const TERMINAL = params.get('terminal') || CFG.TERMINAL || 'Terminal';
  const ENDPOINT = (CFG.ENDPOINT || '').trim();
  const MODO_TESTE = !ENDPOINT;
  const CHAVE_FILA = 'vr_antes_de_voar_fila';
  const CHAVE_SIMULADAS = 'vr_antes_de_voar_simuladas';

  const UI = {
    comecar: { pt: 'Antes de voar', en: 'Before your flight', es: 'Antes de volar' },
    sub: { pt: 'Leva cerca de 2 minutos', en: 'It takes about 2 minutes', es: 'Toma unos 2 minutos' },
    continuar: { pt: 'Continuar', en: 'Continue', es: 'Continuar' },
    voltar: { pt: '‹ Voltar', en: '‹ Back', es: '‹ Atrás' },
    pular: { pt: 'Pular', en: 'Skip', es: 'Omitir' },
    semCodigo: { pt: 'Não tenho o código', en: "I don't have it", es: 'No tengo el código' },
    enviar: { pt: 'Enviar', en: 'Submit', es: 'Enviar' },
    cancelar: { pt: 'Cancelar', en: 'Cancel', es: 'Cancelar' },
  };
  const BLOCOS = {
    reserva: { pt: 'Sua reserva', en: 'Your booking', es: 'Su reserva' },
    hospedagem: { pt: 'Sua hospedagem', en: 'Your stay', es: 'Su estadía' },
    viagem: { pt: 'Sua viagem', en: 'Your trip', es: 'Su viaje' },
    conheceu: { pt: 'Como nos conheceu', en: 'How you found us', es: 'Cómo nos conoció' },
    escolha: { pt: 'Sua escolha', en: 'Your choice', es: 'Su elección' },
    hoje: { pt: 'Hoje', en: 'Today', es: 'Hoy' },
  };

  // Ordem das perguntas e regras de exibição (a = respostas das perguntas já visíveis).
  const ETAPAS = [
    { k: 'q1_codigo', b: 'reserva', tipo: 'codigo' },
    { k: 'q2_origem', b: 'reserva' },
    { k: 'q3_dias', b: 'reserva' },
    { k: 'q4_dia_viagem', b: 'hospedagem', se: a => a.q3_dias !== 0 },
    { k: 'q5_bairro', b: 'hospedagem', se: a => a.q3_dias !== 0 },
    { k: 'q6_hospedagem', b: 'hospedagem', se: a => a.q3_dias !== 0 },
    { k: 'q7_com_quem', b: 'viagem', tipo: 'multi' },
    { k: 'q8_clima', b: 'viagem' },
    { k: 'q9_ocasiao', b: 'viagem' },
    { k: 'q10_como_conheceu', b: 'conheceu' },
    { k: 'q11_o_que_viu', b: 'conheceu', se: a => a.q10_como_conheceu === 0 || a.q10_como_conheceu === 1 },
    { k: 'q12_tipo_influenciador', b: 'conheceu', se: a => a.q10_como_conheceu === 7 || a.q11_o_que_viu === 2 },
    { k: 'q12b_nome_influenciador', b: 'conheceu', tipo: 'texto', se: a => a.q10_como_conheceu === 7 || a.q11_o_que_viu === 2 },
    { k: 'q13_quem_indicou', b: 'conheceu', se: a => a.q10_como_conheceu === 4 || a.q10_como_conheceu === 5 },
    { k: 'q14_pesquisa', b: 'conheceu', se: a => a.q10_como_conheceu === 2 },
    { k: 'q15_ia', b: 'conheceu', se: a => a.q10_como_conheceu === 3 },
    { k: 'q16_primeira_vez', b: 'escolha' },
    { k: 'q17_considerou', b: 'escolha' },
    { k: 'q18_onde_concorrente', b: 'escolha', se: a => a.q17_considerou === 1 || a.q17_considerou === 2 },
    { k: 'q18b_nome_concorrente', b: 'escolha', tipo: 'texto', se: a => a.q17_considerou === 1 || a.q17_considerou === 2 },
    { k: 'q19_preco', b: 'escolha', se: a => a.q17_considerou === 1 || a.q17_considerou === 2 },
    { k: 'q20_o_que_pesou', b: 'hoje' },
    { k: 'q21_outro_passeio', b: 'hoje' },
    { k: 'q22_dificil', b: 'hoje' },
    { k: 'q23_sentimento', b: 'hoje' },
    { k: 'q24_video', b: 'hoje' },
  ];
  const RE_CODIGO = /^VR[A-Z0-9]{6}$/;

  let lang = 'pt';
  let resp = {};
  let atual = null; // chave da etapa na tela; null = tela inicial
  let inicioEm = null;
  let timerInativo = null;
  let timerObrigado = null;
  const app = document.getElementById('app');

  // ── utilidades ──
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tr = o => (o && (o[lang] || o.pt)) || '';
  const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem storage */ } };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

  function visiveis() {
    const ativos = {};
    const lista = [];
    for (const e of ETAPAS) {
      if (e.se && !e.se(ativos)) continue;
      lista.push(e);
      if (e.k in resp) ativos[e.k] = resp[e.k];
    }
    return lista;
  }

  // ── telas ──
  function telaInicial() {
    atual = null; resp = {}; inicioEm = null; app.onclick = null;
    clearTimeout(timerObrigado); clearTimeout(timerInativo);
    app.innerHTML = `
      <div class="tela inicio">
        <img src="assets/logo.svg" alt="Vertical Rio" style="height:64px;margin-bottom:36px">
        <h1>Antes de voar</h1>
        <p class="sub">Before your flight · Antes de volar</p>
        <div class="idiomas">
          <button class="op" data-l="pt">Português</button>
          <button class="op" data-l="en">English</button>
          <button class="op" data-l="es">Español</button>
        </div>
        <p class="sub" style="margin-top:22px;font-size:17px">≈ 2 min</p>
      </div>${rodapeTeste()}`;
    app.querySelectorAll('[data-l]').forEach(b => b.onclick = () => {
      lang = b.dataset.l;
      document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
      inicioEm = new Date().toISOString();
      irPara(ETAPAS[0].k);
    });
  }

  function irPara(k) {
    atual = k;
    armarInatividade();
    const lista = visiveis();
    const i = lista.findIndex(e => e.k === k);
    const e = lista[i];
    const q = P[k];
    const pct = Math.round((i / lista.length) * 100);
    let corpo = '';
    if (e.tipo === 'codigo' || e.tipo === 'texto') {
      const codigo = e.tipo === 'codigo';
      corpo = `
        <input class="campo ${codigo ? '' : 'livre'}" id="campo" maxlength="${codigo ? 10 : 80}"
          autocomplete="off" autocorrect="off" autocapitalize="${codigo ? 'characters' : 'none'}" spellcheck="false"
          placeholder="${codigo ? 'VR______' : ''}" value="${esc(resp[k] || '')}">
        <p class="erro" id="erro"></p>
        <div class="acoes">
          <button class="btn" id="ok">${tr(UI.continuar)}</button>
          <button class="btn sec" id="pular">${tr(codigo ? UI.semCodigo : UI.pular)}</button>
        </div>`;
    } else {
      const multi = e.tipo === 'multi';
      const sel = multi ? (resp[k] || []) : [resp[k]];
      const ops = q.o[lang];
      corpo = `<div class="opcoes ${ops.length > 5 ? 'duas' : ''}">` + ops.map((txt, n) =>
        `<button class="op ${multi ? 'multi' : ''} ${sel.includes(n) ? 'sel' : ''}" data-n="${n}">
           <span class="marca">✓</span><span>${esc(txt)}</span></button>`).join('') + '</div>' +
        (multi ? `<div class="acoes"><button class="btn" id="ok" ${sel.length ? '' : 'disabled'}>${tr(UI.continuar)}</button></div>` : '');
    }
    app.innerHTML = `
      <div class="topo"><img src="assets/logo.svg" alt="Vertical Rio"><div class="barra"><i style="width:${pct}%"></i></div></div>
      <div class="tela">
        <p class="bloco">${esc(tr(BLOCOS[e.b]))}</p>
        <h1>${esc(tr(q.t))}</h1>
        ${q.h ? `<p class="ajuda">${esc(tr(q.h))}</p>` : ''}
        ${corpo}
      </div>
      <div class="rodape">
        <button class="voltar" id="voltar">${i === 0 ? tr(UI.cancelar) : tr(UI.voltar)}</button>
      </div>${rodapeTeste()}`;

    app.querySelector('#voltar').onclick = () => (i === 0 ? telaInicial() : irPara(lista[i - 1].k));

    if (e.tipo === 'codigo' || e.tipo === 'texto') {
      const campo = app.querySelector('#campo');
      const erro = app.querySelector('#erro');
      const confirmar = () => {
        const v = campo.value.trim();
        if (e.tipo === 'codigo') {
          const c = v.toUpperCase().replace(/\s+/g, '');
          if (!RE_CODIGO.test(c)) { erro.textContent = tr(T.validacao); return; }
          resp[k] = c;
        } else if (v) resp[k] = v; else delete resp[k];
        avancar(k);
      };
      campo.oninput = () => { erro.textContent = ''; armarInatividade(); };
      campo.onkeydown = ev => { if (ev.key === 'Enter') confirmar(); };
      app.querySelector('#ok').onclick = confirmar;
      app.querySelector('#pular').onclick = () => { delete resp[k]; avancar(k); };
      if (e.tipo === 'codigo') setTimeout(() => campo.focus(), 50);
    } else if (e.tipo === 'multi') {
      const ok = app.querySelector('#ok');
      app.querySelectorAll('.op').forEach(b => b.onclick = () => {
        const n = +b.dataset.n;
        const atualSel = new Set(resp[k] || []);
        atualSel.has(n) ? atualSel.delete(n) : atualSel.add(n);
        resp[k] = [...atualSel].sort((x, y) => x - y);
        b.classList.toggle('sel');
        ok.disabled = !resp[k].length;
      });
      ok.onclick = () => avancar(k);
    } else {
      app.querySelectorAll('.op').forEach(b => b.onclick = () => {
        resp[k] = +b.dataset.n;
        app.querySelectorAll('.op').forEach(x => x.classList.toggle('sel', x === b));
        setTimeout(() => avancar(k), 180);
      });
    }
  }

  function avancar(k) {
    const lista = visiveis(); // recalcula: a resposta pode abrir ou fechar perguntas
    const i = lista.findIndex(e => e.k === k);
    if (i + 1 < lista.length) irPara(lista[i + 1].k);
    else concluir();
  }

  function concluir() {
    clearTimeout(timerInativo);
    const lista = visiveis();
    const respostas = {};
    for (const e of lista) {
      if (!(e.k in resp)) continue;
      const v = resp[e.k];
      if (e.tipo === 'codigo' || e.tipo === 'texto') respostas[e.k] = v;
      else if (e.tipo === 'multi') respostas[e.k] = v.map(n => P[e.k].o.pt[n]).join(', ');
      else respostas[e.k] = P[e.k].o.pt[v]; // planilha sempre em português
    }
    enfileirar({
      id: uid(),
      inicio: inicioEm,
      enviado_em: new Date().toISOString(),
      idioma: lang.toUpperCase(),
      terminal: TERMINAL,
      respostas,
    });
    app.innerHTML = `
      <div class="tela obrigado">
        <div class="ok">✓</div>
        <h1>${esc(tr(T.confirmacao))}</h1>
      </div>${rodapeTeste()}`;
    timerObrigado = setTimeout(telaInicial, (CFG.OBRIGADO_S || 8) * 1000);
    atual = '__fim';
    // tocar na tela de agradecimento volta ao início (adiado para não pegar o próprio toque de envio)
    setTimeout(() => { app.onclick = () => { if (atual === '__fim') telaInicial(); }; }, 400);
  }

  function armarInatividade() {
    clearTimeout(timerInativo);
    timerInativo = setTimeout(telaInicial, (CFG.INATIVIDADE_S || 90) * 1000);
  }
  document.addEventListener('pointerdown', () => { if (atual && atual !== '__fim') armarInatividade(); }, { passive: true });

  // ── fila de envio (sobrevive a queda de internet e a recarregar a página) ──
  function enfileirar(item) {
    if (MODO_TESTE) {
      const s = ler(CHAVE_SIMULADAS, []);
      s.push(item);
      gravar(CHAVE_SIMULADAS, s.slice(-200));
      console.log('[modo de teste] resposta guardada no aparelho:', item);
      return;
    }
    const fila = ler(CHAVE_FILA, []);
    fila.push(item);
    gravar(CHAVE_FILA, fila);
    enviarFila();
  }

  let enviando = false;
  async function enviarFila() {
    if (MODO_TESTE || enviando) return;
    enviando = true;
    try {
      let fila = ler(CHAVE_FILA, []);
      while (fila.length) {
        const item = fila[0];
        const r = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evita preflight CORS no Apps Script
          body: JSON.stringify(item),
        });
        const j = await r.json().catch(() => ({}));
        if (!j.ok) throw new Error(j.erro || 'falha ' + r.status);
        fila = ler(CHAVE_FILA, []).filter(x => x.id !== item.id);
        gravar(CHAVE_FILA, fila);
      }
    } catch (err) {
      console.warn('Envio pendente; nova tentativa em breve.', err);
    } finally {
      enviando = false;
      mostrarFila();
    }
  }
  function mostrarFila() {
    if (MODO_TESTE) return;
    let el = document.querySelector('.fila');
    const n = ler(CHAVE_FILA, []).length;
    if (!el) { el = document.createElement('div'); el.className = 'fila'; document.body.appendChild(el); }
    el.textContent = n ? `⏳ ${n}` : '';
  }
  window.addEventListener('online', enviarFila);
  setInterval(enviarFila, 60 * 1000);

  function rodapeTeste() {
    if (!MODO_TESTE) return '';
    const n = ler(CHAVE_SIMULADAS, []).length;
    return `<div class="teste">MODO DE TESTE — as respostas ficam só neste aparelho (${n}) e não vão para a planilha</div>`;
  }

  // Para conferência: no console, VR_FORM.simuladas() / VR_FORM.fila()
  window.VR_FORM = { simuladas: () => ler(CHAVE_SIMULADAS, []), fila: () => ler(CHAVE_FILA, []), etapas: ETAPAS };

  telaInicial();
  enviarFila();
  mostrarFila();
})();
