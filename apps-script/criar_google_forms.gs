/**
 * Vertical Rio — Formulário "Antes de voar" (terminal de chegada)
 *
 * Cria 3 formulários no Google Forms (PT, EN, ES), com seções,
 * perguntas condicionais e validação do código da reserva.
 *
 * COMO USAR
 * 1. Abra https://script.google.com logado na conta da Vertical Rio
 *    (a mesma dona da planilha de respostas atual).
 * 2. Novo projeto → apague o conteúdo → cole este arquivo inteiro → salve.
 * 3. Selecione a função "criarFormularios" e clique em Executar.
 *    Na primeira vez o Google pede autorização: aceite.
 * 4. Em "Registro de execução" aparecem os links de edição e de resposta
 *    de cada idioma. O link de resposta é o que vai no terminal.
 */

// Planilha onde as respostas serão gravadas (cada idioma vira uma aba nova).
// Deixe '' para o Google criar uma planilha separada para cada formulário.
const PLANILHA_ID = ''; // cole aqui o ID da planilha (o trecho entre /d/ e /edit no link)

// O código da reserva é obrigatório? Com false, quem não tiver o código
// consegue seguir (o formato continua sendo validado quando preenchido).
const CODIGO_OBRIGATORIO = false;

const IDIOMAS = ['pt', 'en', 'es'];

const TEXTOS = {
  titulo: {
    pt: 'Vertical Rio — Antes de voar',
    en: 'Vertical Rio — Before your flight',
    es: 'Vertical Rio — Antes de volar',
  },
  descricao: {
    pt: 'Leva cerca de 2 minutos e nos ajuda a melhorar sua experiência. Obrigado!',
    en: 'It takes about 2 minutes and helps us improve your experience. Thank you!',
    es: 'Toma unos 2 minutos y nos ayuda a mejorar su experiencia. ¡Gracias!',
  },
  confirmacao: {
    pt: 'Obrigado! Aproveite o voo 🚁',
    en: 'Thank you! Enjoy your flight 🚁',
    es: '¡Gracias! Disfrute su vuelo 🚁',
  },
  validacao: {
    pt: 'Confira o código: VR + 6 letras ou números (ex.: VRAB12CD).',
    en: 'Please check the code: VR + 6 letters or numbers (e.g. VRAB12CD).',
    es: 'Verifique el código: VR + 6 letras o números (ej.: VRAB12CD).',
  },
};

const SECOES = {
  hospedagem: { pt: 'Sua hospedagem', en: 'Your stay', es: 'Su estadía' },
  viagem: { pt: 'Sua viagem', en: 'Your trip', es: 'Su viaje' },
  redes: { pt: 'Redes sociais', en: 'Social media', es: 'Redes sociales' },
  influenciador: { pt: 'Influenciador', en: 'Influencer', es: 'Influencer' },
  indicacao: { pt: 'Indicação', en: 'Recommendation', es: 'Recomendación' },
  google: { pt: 'Google', en: 'Google', es: 'Google' },
  ia: { pt: 'Inteligência artificial', en: 'Artificial intelligence', es: 'Inteligencia artificial' },
  escolha: { pt: 'Sua escolha', en: 'Your choice', es: 'Su elección' },
  outras: { pt: 'Outras empresas', en: 'Other companies', es: 'Otras empresas' },
  hoje: { pt: 'Hoje', en: 'Today', es: 'Hoy' },
};

const P = {
  q1_codigo: {
    t: { pt: 'Qual é o código da sua reserva?', en: 'What is your booking number?', es: '¿Cuál es su número de reserva?' },
    h: {
      pt: 'Começa com VR e tem 8 caracteres (ex.: VRAB12CD). Está no e-mail de confirmação.',
      en: 'It starts with VR and has 8 characters (e.g. VRAB12CD). You can find it in your confirmation e-mail.',
      es: 'Empieza con VR y tiene 8 caracteres (ej.: VRAB12CD). Está en el correo de confirmación.',
    },
  },
  q2_origem: {
    t: { pt: 'De onde você é?', en: 'Where are you from?', es: '¿De dónde es usted?' },
    o: {
      pt: ['Brasil', 'América do Sul (exceto Brasil)', 'América do Norte', 'Europa', 'Outro'],
      en: ['Brazil', 'South America (other than Brazil)', 'North America', 'Europe', 'Other'],
      es: ['Brasil', 'Sudamérica (excepto Brasil)', 'Norteamérica', 'Europa', 'Otro'],
    },
  },
  q3_dias: {
    t: { pt: 'Quantos dias você fica no Rio de Janeiro?', en: 'How many days are you staying in Rio de Janeiro?', es: '¿Cuántos días se queda en Río de Janeiro?' },
    o: {
      pt: ['Moro no Rio', '1 a 2 dias', '3 a 4 dias', '5 a 7 dias', 'Mais de 7 dias'],
      en: ['I live in Rio', '1 to 2 days', '3 to 4 days', '5 to 7 days', 'More than 7 days'],
      es: ['Vivo en Río', '1 a 2 días', '3 a 4 días', '5 a 7 días', 'Más de 7 días'],
    },
  },
  q4_dia_viagem: {
    t: { pt: 'Em que dia da sua viagem você está voando hoje?', en: "Which day of your trip is today's flight?", es: '¿En qué día de su viaje vuela hoy?' },
    o: {
      pt: ['No primeiro dia', 'No segundo dia', 'No terceiro dia', 'No quarto dia ou depois', 'No dia de ir embora'],
      en: ['First day', 'Second day', 'Third day', 'Fourth day or later', 'Day of departure'],
      es: ['Primer día', 'Segundo día', 'Tercer día', 'Cuarto día o después', 'Día de salida'],
    },
  },
  q5_bairro: {
    t: { pt: 'Em que bairro você está hospedado?', en: 'Which neighborhood are you staying in?', es: '¿En qué barrio se hospeda?' },
    o: {
      pt: ['Copacabana', 'Ipanema', 'Leblon', 'Botafogo ou Flamengo', 'Barra, Recreio ou Joá', 'Centro, Lapa ou Santa Teresa', 'Outro'],
      en: ['Copacabana', 'Ipanema', 'Leblon', 'Botafogo or Flamengo', 'Barra, Recreio or Joá', 'Downtown, Lapa or Santa Teresa', 'Other'],
      es: ['Copacabana', 'Ipanema', 'Leblon', 'Botafogo o Flamengo', 'Barra, Recreio o Joá', 'Centro, Lapa o Santa Teresa', 'Otro'],
    },
  },
  q6_hospedagem: {
    t: { pt: 'Onde você está hospedado?', en: 'Where are you staying?', es: '¿Dónde se hospeda?' },
    o: {
      pt: ['Hotel', 'Airbnb ou apartamento alugado', 'Pousada ou hostel', 'Casa de amigos ou família'],
      en: ['Hotel', 'Airbnb or rented apartment', 'Guesthouse or hostel', "Friends' or family's home"],
      es: ['Hotel', 'Airbnb o apartamento alquilado', 'Posada u hostal', 'Casa de amigos o familia'],
    },
  },
  q7_com_quem: {
    t: { pt: 'Com quem você está viajando?', en: 'Who are you traveling with?', es: '¿Con quién viaja?' },
    h: { pt: 'Pode marcar mais de uma.', en: 'You can select more than one.', es: 'Puede marcar más de una.' },
    o: {
      pt: ['Sozinho(a)', 'Em casal', 'Com a família e crianças', 'Com amigos', 'A trabalho'],
      en: ['Alone', 'As a couple', 'With family and children', 'With friends', 'For work'],
      es: ['Solo/a', 'En pareja', 'Con la familia y niños', 'Con amigos', 'Por trabajo'],
    },
  },
  q8_clima: {
    t: { pt: 'O clima influenciou a escolha da data do voo?', en: 'Did the weather influence your choice of flight date?', es: '¿Influyó el clima en la elección de la fecha de su vuelo?' },
    o: {
      pt: ['Sim, escolhi o dia pela previsão do tempo', 'Sim, remarquei por causa do clima', 'Não, o clima não foi decisivo'],
      en: ['Yes, I chose the day based on the forecast', 'Yes, I rescheduled because of the weather', 'No, the weather was not a deciding factor'],
      es: ['Sí, elegí el día según el pronóstico', 'Sí, reprogramé por el clima', 'No, el clima no fue un factor decisivo'],
    },
  },
  q9_ocasiao: {
    t: { pt: 'O voo de hoje é por uma ocasião especial?', en: "Is today's flight for a special occasion?", es: '¿El vuelo de hoy es por una ocasión especial?' },
    o: {
      pt: ['Não', 'Aniversário', 'Lua de mel ou pedido de casamento', 'Outra comemoração'],
      en: ['No', 'Birthday', 'Honeymoon or marriage proposal', 'Another celebration'],
      es: ['No', 'Cumpleaños', 'Luna de miel o pedida de mano', 'Otra celebración'],
    },
  },
  q10_como_conheceu: {
    t: { pt: 'Como você conheceu a Vertical Rio?', en: 'How did you hear about Vertical Rio?', es: '¿Cómo conoció Vertical Rio?' },
    o: {
      pt: ['Instagram ou Facebook', 'TikTok ou YouTube', 'Google ou outro buscador', 'ChatGPT ou outra inteligência artificial', 'Indicação de amigos ou família', 'Hotel ou concierge', 'GetYourGuide, Viator ou outra plataforma', 'Influenciador', 'Passei em frente'],
      en: ['Instagram or Facebook', 'TikTok or YouTube', 'Google or another search engine', 'ChatGPT or another AI tool', 'Recommendation from friends or family', 'Hotel or concierge', 'GetYourGuide, Viator or another platform', 'Influencer', 'I walked by'],
      es: ['Instagram o Facebook', 'TikTok o YouTube', 'Google u otro buscador', 'ChatGPT u otra inteligencia artificial', 'Recomendación de amigos o familiares', 'Hotel o conserje', 'GetYourGuide, Viator u otra plataforma', 'Influencer', 'Pasé por aquí'],
    },
  },
  q11_o_que_viu: {
    t: { pt: 'O que você viu sobre a Vertical Rio?', en: 'What did you see about Vertical Rio?', es: '¿Qué vio sobre Vertical Rio?' },
    o: {
      pt: ['Um post da Vertical Rio', 'Um anúncio patrocinado', 'Um vídeo de influenciador', 'Um post de amigo ou conhecido', 'Não lembro'],
      en: ['A Vertical Rio post', 'A sponsored ad', 'An influencer video', 'A post from a friend', "I don't remember"],
      es: ['Una publicación de Vertical Rio', 'Un anuncio patrocinado', 'Un video de un influencer', 'Una publicación de un amigo', 'No recuerdo'],
    },
  },
  q12_tipo_influenciador: {
    t: { pt: 'Que tipo de influenciador?', en: 'What kind of influencer?', es: '¿Qué tipo de influencer?' },
    o: {
      pt: ['Influenciador de viagem', 'Influenciador do Rio de Janeiro', 'Celebridade ou pessoa famosa', 'Não lembro'],
      en: ['Travel influencer', 'Rio de Janeiro influencer', 'Celebrity', "I don't remember"],
      es: ['Influencer de viajes', 'Influencer de Río de Janeiro', 'Celebridad', 'No recuerdo'],
    },
  },
  q12b_nome_influenciador: {
    t: {
      pt: 'Se lembrar, qual é o @ ou o nome do influenciador? (opcional)',
      en: "If you remember, what is the influencer's @ or name? (optional)",
      es: 'Si lo recuerda, ¿cuál es el @ o el nombre del influencer? (opcional)',
    },
  },
  q13_quem_indicou: {
    t: { pt: 'Quem indicou a Vertical Rio?', en: 'Who recommended Vertical Rio?', es: '¿Quién le recomendó Vertical Rio?' },
    o: {
      pt: ['Amigo ou familiar que já voou com a gente', 'Hotel ou concierge', 'Guia de turismo', 'Agência ou operadora de turismo', 'Motorista de táxi ou aplicativo'],
      en: ['A friend or relative who has flown with us', 'Hotel or concierge', 'Tour guide', 'Travel agency or tour operator', 'Taxi or ride-app driver'],
      es: ['Un amigo o familiar que ya voló con nosotros', 'Hotel o conserje', 'Guía de turismo', 'Agencia u operador de turismo', 'Conductor de taxi o aplicación'],
    },
  },
  q14_pesquisa: {
    t: { pt: 'O que você pesquisou no Google?', en: 'What did you search for on Google?', es: '¿Qué buscó en Google?' },
    o: {
      pt: ['O nome "Vertical Rio"', 'Passeio de helicóptero no Rio', 'O que fazer no Rio de Janeiro', 'Helicóptero de portas abertas', 'Não lembro'],
      en: ['The name "Vertical Rio"', 'Helicopter tour in Rio', 'Things to do in Rio de Janeiro', 'Doors-off helicopter', "I don't remember"],
      es: ['El nombre "Vertical Rio"', 'Paseo en helicóptero en Río', 'Qué hacer en Río de Janeiro', 'Helicóptero con puertas abiertas', 'No recuerdo'],
    },
  },
  q15_ia: {
    t: { pt: 'Qual ferramenta de inteligência artificial?', en: 'Which AI tool?', es: '¿Qué herramienta de inteligencia artificial?' },
    o: {
      pt: ['ChatGPT', 'Google Gemini', 'Perplexity', 'Claude', 'Outra'],
      en: ['ChatGPT', 'Google Gemini', 'Perplexity', 'Claude', 'Other'],
      es: ['ChatGPT', 'Google Gemini', 'Perplexity', 'Claude', 'Otra'],
    },
  },
  q16_primeira_vez: {
    t: { pt: 'Quando você ouviu falar da Vertical Rio pela primeira vez?', en: 'When did you first hear about Vertical Rio?', es: '¿Cuándo oyó hablar de Vertical Rio por primera vez?' },
    o: {
      pt: ['Antes de planejar a viagem', 'Enquanto planejava a viagem', 'Já aqui no Rio', 'Hoje'],
      en: ['Before planning my trip', 'While planning my trip', 'Once I was in Rio', 'Today'],
      es: ['Antes de planear el viaje', 'Mientras planeaba el viaje', 'Ya estando en Río', 'Hoy'],
    },
  },
  q17_considerou: {
    t: { pt: 'Você considerou outras empresas de passeio de helicóptero?', en: 'Did you consider other helicopter tour companies?', es: '¿Consideró otras empresas de paseos en helicóptero?' },
    o: {
      pt: ['Não, só a Vertical Rio', 'Sim, uma empresa', 'Sim, mais de uma'],
      en: ['No, only Vertical Rio', 'Yes, one company', 'Yes, more than one'],
      es: ['No, solo Vertical Rio', 'Sí, una empresa', 'Sí, más de una'],
    },
  },
  q18_onde_concorrente: {
    t: { pt: 'Onde você encontrou a outra empresa?', en: 'Where did you find the other company?', es: '¿Dónde encontró la otra empresa?' },
    o: {
      pt: ['No Google', 'No Instagram ou TikTok', 'No GetYourGuide, Viator ou outra plataforma', 'Indicação do hotel ou agência', 'Não lembro'],
      en: ['On Google', 'On Instagram or TikTok', 'On GetYourGuide, Viator or another platform', 'Recommended by my hotel or agency', "I don't remember"],
      es: ['En Google', 'En Instagram o TikTok', 'En GetYourGuide, Viator u otra plataforma', 'Recomendación del hotel o agencia', 'No recuerdo'],
    },
  },
  q18b_nome_concorrente: {
    t: {
      pt: 'Se lembrar, qual era o nome da empresa? (opcional)',
      en: "If you remember, what was the company's name? (optional)",
      es: 'Si lo recuerda, ¿cuál era el nombre de la empresa? (opcional)',
    },
  },
  q19_preco: {
    t: { pt: 'Comparando com a outra empresa, o nosso preço pareceu…', en: 'Compared to the other company, our price seemed…', es: 'Comparado con la otra empresa, nuestro precio le pareció…' },
    o: {
      pt: ['Mais barato', 'Parecido', 'Mais caro, mas vale a pena', 'Mais caro'],
      en: ['Lower', 'About the same', 'Higher, but worth it', 'Higher'],
      es: ['Más barato', 'Parecido', 'Más caro, pero vale la pena', 'Más caro'],
    },
  },
  q20_o_que_pesou: {
    t: { pt: 'O que mais pesou na escolha da Vertical Rio?', en: 'What mattered most in choosing Vertical Rio?', es: '¿Qué fue lo más importante al elegir Vertical Rio?' },
    o: {
      pt: ['Voar de portas abertas', 'Preço', 'Avaliações de outros clientes', 'Fotos e vídeos nas redes sociais', 'Horário disponível', 'Indicação de alguém'],
      en: ['Flying with the doors off', 'Price', 'Reviews from other customers', 'Photos and videos on social media', 'Available time slot', "Someone's recommendation"],
      es: ['Volar con las puertas abiertas', 'Precio', 'Reseñas de otros clientes', 'Fotos y videos en redes sociales', 'Horario disponible', 'Recomendación de alguien'],
    },
  },
  q21_outro_passeio: {
    t: { pt: 'Você pensou em fazer outro passeio no lugar do helicóptero?', en: 'Did you consider another tour instead of the helicopter?', es: '¿Pensó en hacer otro paseo en lugar del helicóptero?' },
    o: {
      pt: ['Bondinho do Pão de Açúcar', 'Cristo Redentor', 'Voo de asa-delta ou parapente', 'Passeio de barco', 'Não, eu queria voar de helicóptero'],
      en: ['Sugarloaf cable car', 'Christ the Redeemer', 'Hang gliding or paragliding', 'Boat tour', 'No, I wanted a helicopter flight'],
      es: ['Teleférico del Pan de Azúcar', 'Cristo Redentor', 'Vuelo en ala delta o parapente', 'Paseo en barco', 'No, quería volar en helicóptero'],
    },
  },
  q22_dificil: {
    t: { pt: 'O que foi mais difícil até chegar aqui?', en: 'What was the hardest part of getting here?', es: '¿Qué fue lo más difícil hasta llegar aquí?' },
    o: {
      pt: ['Nada, foi tudo fácil', 'Escolher data, horário e tipo de voo', 'Entender as condições para o voo', 'Encontrar o local de saída', 'Informações de horário e chegada'],
      en: ['Nothing, it was all easy', 'Choosing the date, time and type of flight', 'Understanding the flight requirements', 'Finding the departure location', 'Information about time and arrival'],
      es: ['Nada, todo fue fácil', 'Elegir la fecha, hora y tipo de vuelo', 'Entender las condiciones para el vuelo', 'Encontrar el lugar de salida', 'La información sobre horario y llegada'],
    },
  },
  q23_sentimento: {
    t: { pt: 'Como você está se sentindo para o voo?', en: 'How are you feeling about the flight?', es: '¿Cómo se siente para el vuelo?' },
    o: {
      pt: ['Muito animado(a)', 'Animado(a), mas um pouco nervoso(a)', 'Tenho medo de altura', 'Tranquilo(a)'],
      en: ['Very excited', 'Excited but a little nervous', "I'm afraid of heights", 'Calm'],
      es: ['Muy entusiasmado/a', 'Entusiasmado/a, pero un poco nervioso/a', 'Tengo miedo a las alturas', 'Tranquilo/a'],
    },
  },
  q24_video: {
    t: { pt: 'Quer levar o voo em vídeo?', en: 'Would you like a video of your flight?', es: '¿Quiere llevarse el video de su vuelo?' },
    o: {
      pt: ['Já incluí na minha reserva', 'Quero saber mais sobre a GoPro e o Vídeo 360°', 'Não, obrigado(a)'],
      en: ["It's already in my booking", "I'd like to know more about the GoPro and 360° Video", 'No, thank you'],
      es: ['Ya lo incluí en mi reserva', 'Quiero saber más sobre la GoPro y el Video 360°', 'No, gracias'],
    },
  },
};

function criarFormularios() {
  IDIOMAS.forEach(function (l) { criarFormulario(l); });
}

function criarFormulario(l) {
  const form = FormApp.create(TEXTOS.titulo[l]);
  form.setDescription(TEXTOS.descricao[l])
    .setConfirmationMessage(TEXTOS.confirmacao[l])
    .setCollectEmail(false)
    .setProgressBar(true)
    .setShowLinkToRespondAgain(true) // terminal: botão para o próximo cliente
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setPublishingSummary(false);
  try { form.setRequireLogin(false); } catch (e) { /* só existe em contas Workspace */ }

  // Helpers
  const unica = function (k, obrigatoria) {
    const it = form.addMultipleChoiceItem().setTitle(P[k].t[l]).setRequired(obrigatoria !== false);
    if (P[k].h) it.setHelpText(P[k].h[l]);
    return it;
  };
  const simples = function (it, k) { it.setChoiceValues(P[k].o[l]); return it; };
  const secao = function (k) { return form.addPageBreakItem().setTitle(SECOES[k][l]); };
  const CONT = FormApp.PageNavigationType.CONTINUE;
  // Monta as opções: destinos = { índiceDaOpção: PageBreakItem }; as demais seguem em frente (ou vão para "padrao").
  const navegar = function (it, k, destinos, padrao) {
    it.setChoices(P[k].o[l].map(function (txt, i) {
      const d = destinos[i] || padrao;
      return d ? it.createChoice(txt, d) : it.createChoice(txt, CONT);
    }));
  };

  // ── Seção 1: reserva ──
  const v = FormApp.createTextValidation()
    .setHelpText(TEXTOS.validacao[l])
    .requireTextMatchesPattern('^\\s*[Vv][Rr][A-Za-z0-9]{6}\\s*$')
    .build();
  form.addTextItem().setTitle(P.q1_codigo.t[l]).setHelpText(P.q1_codigo.h[l])
    .setRequired(CODIGO_OBRIGATORIO).setValidation(v);
  simples(unica('q2_origem'), 'q2_origem');
  const q3 = unica('q3_dias');

  // ── Seção 2: hospedagem (só turistas) ──
  secao('hospedagem');
  simples(unica('q4_dia_viagem'), 'q4_dia_viagem');
  simples(unica('q5_bairro'), 'q5_bairro');
  simples(unica('q6_hospedagem'), 'q6_hospedagem');

  // ── Seção 3: viagem + como conheceu ──
  const sViagem = secao('viagem');
  const q7 = form.addCheckboxItem().setTitle(P.q7_com_quem.t[l]).setHelpText(P.q7_com_quem.h[l]).setRequired(true);
  q7.setChoiceValues(P.q7_com_quem.o[l]);
  simples(unica('q8_clima'), 'q8_clima');
  simples(unica('q9_ocasiao'), 'q9_ocasiao');
  const q10 = unica('q10_como_conheceu');

  // ── Seções condicionais ──
  const sRedes = secao('redes');
  const q11 = unica('q11_o_que_viu');

  const sInfluenciador = secao('influenciador');
  simples(unica('q12_tipo_influenciador'), 'q12_tipo_influenciador');
  form.addTextItem().setTitle(P.q12b_nome_influenciador.t[l]).setRequired(false);

  const sIndicacao = secao('indicacao');
  simples(unica('q13_quem_indicou'), 'q13_quem_indicou');

  const sGoogle = secao('google');
  simples(unica('q14_pesquisa'), 'q14_pesquisa');

  const sIa = secao('ia');
  simples(unica('q15_ia'), 'q15_ia');

  // ── Seção: escolha / concorrência ──
  const sEscolha = secao('escolha');
  simples(unica('q16_primeira_vez'), 'q16_primeira_vez');
  const q17 = unica('q17_considerou');

  form.addPageBreakItem().setTitle(SECOES.outras[l]);
  simples(unica('q18_onde_concorrente'), 'q18_onde_concorrente');
  form.addTextItem().setTitle(P.q18b_nome_concorrente.t[l]).setRequired(false);
  simples(unica('q19_preco'), 'q19_preco');

  // ── Seção final: hoje ──
  const sHoje = secao('hoje');
  simples(unica('q20_o_que_pesou'), 'q20_o_que_pesou');
  simples(unica('q21_outro_passeio'), 'q21_outro_passeio');
  simples(unica('q22_dificil'), 'q22_dificil');
  simples(unica('q23_sentimento'), 'q23_sentimento');
  simples(unica('q24_video'), 'q24_video');

  // ── Saltos ──
  // Q3: "Moro no Rio" pula a hospedagem.
  navegar(q3, 'q3_dias', { 0: sViagem });
  // Q10: cada origem abre a sua pergunta; as demais vão direto para "Sua escolha".
  navegar(q10, 'q10_como_conheceu', {
    0: sRedes, 1: sRedes,          // Instagram/Facebook, TikTok/YouTube
    2: sGoogle,                    // Google
    3: sIa,                        // IA
    4: sIndicacao, 5: sIndicacao,  // Indicação, Hotel
    6: sEscolha,                   // GetYourGuide/Viator
    7: sInfluenciador,             // Influenciador
    8: sEscolha,                   // Passei em frente
  });
  // Q11: "vídeo de influenciador" abre a Q12; o resto vai para "Sua escolha".
  navegar(q11, 'q11_o_que_viu', { 2: sInfluenciador }, sEscolha);
  // Ao terminar Influenciador, Indicação e Google, pular para "Sua escolha".
  // (setGoToPage na quebra SEGUINTE define o destino da seção anterior.)
  sIndicacao.setGoToPage(sEscolha);
  sGoogle.setGoToPage(sEscolha);
  sIa.setGoToPage(sEscolha);
  // Q17: "Não" pula as perguntas sobre a outra empresa.
  navegar(q17, 'q17_considerou', { 0: sHoje });

  if (PLANILHA_ID) {
    try {
      form.setDestination(FormApp.DestinationType.SPREADSHEET, PLANILHA_ID);
    } catch (e) {
      Logger.log('[' + l + '] Não consegui ligar à planilha (' + e.message + '). As respostas ficam no próprio formulário.');
    }
  }
  try { if (typeof form.setPublished === 'function') form.setPublished(true); } catch (e) { /* versões antigas */ }

  Logger.log('[' + l.toUpperCase() + '] Editar: ' + form.getEditUrl());
  Logger.log('[' + l.toUpperCase() + '] Responder (terminal): ' + form.getPublishedUrl());
}
