/**
 * Vertical Rio — recebe as respostas do terminal "Antes de voar" e grava no Google Sheets.
 *
 * COMO INSTALAR (uma vez só, ~3 minutos)
 * 1. Abra a planilha onde as respostas devem ficar.
 * 2. Extensões → Apps Script. Apague o conteúdo, cole este arquivo inteiro e salve.
 * 3. Implantar → Nova implantação → tipo "App da Web".
 *      Executar como: Eu (sua conta)
 *      Quem pode acessar: Qualquer pessoa
 *    Clique em Implantar e autorize.
 * 4. Copie o link do App da Web (termina em /exec) e coloque em site/config.js → ENDPOINT.
 *
 * Teste: abrir o link /exec no navegador deve mostrar {"ok":true,...}.
 * Ao alterar este código: Implantar → Gerenciar implantações → editar → Nova versão
 * (assim o link continua o mesmo).
 */

const ABA = 'Antes de voar';

// Ordem das colunas da planilha.
const COLUNAS = [
  ['recebido_em', 'Recebido em'],
  ['inicio', 'Início do preenchimento'],
  ['idioma', 'Idioma'],
  ['terminal', 'Terminal'],
  ['q1_codigo', '1. Código da reserva'],
  ['q2_origem', '2. De onde é'],
  ['q3_dias', '3. Dias no Rio'],
  ['q4_dia_viagem', '4. Dia da viagem do voo'],
  ['q5_bairro', '5. Bairro'],
  ['q6_hospedagem', '6. Tipo de hospedagem'],
  ['q7_com_quem', '7. Com quem viaja'],
  ['q8_clima', '8. Influência do clima'],
  ['q9_ocasiao', '9. Ocasião especial'],
  ['q10_como_conheceu', '10. Como conheceu'],
  ['q11_o_que_viu', '11. O que viu nas redes'],
  ['q12_tipo_influenciador', '12. Tipo de influenciador'],
  ['q12b_nome_influenciador', '12b. Nome/@ do influenciador'],
  ['q13_quem_indicou', '13. Quem indicou'],
  ['q14_pesquisa', '14. O que pesquisou no Google'],
  ['q15_ia', '15. Ferramenta de IA'],
  ['q16_primeira_vez', '16. Quando ouviu falar'],
  ['q17_considerou', '17. Considerou outras empresas'],
  ['q18_onde_concorrente', '18. Onde achou a outra empresa'],
  ['q18b_nome_concorrente', '18b. Nome da outra empresa'],
  ['q19_preco', '19. Preço comparado'],
  ['q20_o_que_pesou', '20. O que mais pesou'],
  ['q21_outro_passeio', '21. Outro passeio considerado'],
  ['q22_dificil', '22. Mais difícil até chegar'],
  ['q23_sentimento', '23. Como se sente'],
  ['q24_video', '24. Vídeo do voo'],
  ['id', 'ID da resposta'],
];

function doGet() {
  return json_({ ok: true, servico: 'Vertical Rio — Antes de voar', aba: ABA });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const dados = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!dados.id || typeof dados.respostas !== 'object') return json_({ ok: false, erro: 'payload inválido' });

    lock.waitLock(20000);
    const cache = CacheService.getScriptCache();
    if (cache.get('id_' + dados.id)) return json_({ ok: true, repetida: true }); // reenvio da fila

    const aba = obterAba_();
    const r = dados.respostas || {};
    const linha = COLUNAS.map(function (c) {
      const k = c[0];
      if (k === 'recebido_em') return new Date();
      if (k === 'inicio') return dados.inicio ? new Date(dados.inicio) : '';
      if (k === 'idioma' || k === 'terminal' || k === 'id') return limpar_(dados[k]);
      return limpar_(r[k]);
    });
    aba.appendRow(linha);
    cache.put('id_' + dados.id, '1', 21600);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, erro: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* não estava travado */ }
  }
}

function obterAba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName(ABA);
  if (!aba) {
    aba = ss.insertSheet(ABA);
    aba.getRange(1, 1, 1, COLUNAS.length).setValues([COLUNAS.map(function (c) { return c[1]; })])
      .setFontWeight('bold').setBackground('#f5c400');
    aba.setFrozenRows(1);
    aba.getRange('A:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return aba;
}

// Texto curto e sem fórmula (evita que "=..." digitado vire fórmula na planilha).
function limpar_(v) {
  if (v === undefined || v === null) return '';
  let s = String(v).slice(0, 200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
