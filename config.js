// Configuração do terminal "Antes de voar".
window.CONFIG = {
  // Link do App da Web do Google Apps Script (apps-script/receber_respostas.gs).
  // Vazio = MODO DE TESTE: as respostas ficam só no aparelho e não vão para a planilha.
  ENDPOINT: '',

  // Nome do aparelho, gravado em cada resposta. Também dá para usar ?terminal=Balcão no link.
  TERMINAL: 'Terminal 1',

  // Segundos sem toque até voltar à tela inicial (descarta o que estava pela metade).
  INATIVIDADE_S: 90,

  // Segundos na tela de agradecimento antes de voltar ao início.
  OBRIGADO_S: 8,
};
