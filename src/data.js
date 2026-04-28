// ─── Helpers ──────────────────────────────────────────────────────────────

/** Dia do ano (1-366) — usado como seed para rotação diária */
export function getDiaDoAno() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

// ─── Banco de exercícios com variações amplas por grupo muscular ─────────
// Cada slot tem múltiplas variantes. A rotação escolhe 1 por slot por dia.

export const exerciciosPorGrupo = {
  peito: [
    // Slot 1 — Composto principal
    [
      'Supino reto com barra – 4x10',
      'Supino reto com halteres – 4x10',
      'Supino máquina – 4x10',
      'Supino reto barra guiada (Smith) – 4x10',
    ],
    // Slot 2 — Inclinado / ângulo superior
    [
      'Supino inclinado com halteres – 3x10',
      'Supino inclinado barra – 3x10',
      'Crucifixo inclinado halteres – 3x12',
      'Crossover polia alta (peitoral sup.) – 3x12',
    ],
  ],
  ombro: [
    [
      'Desenvolvimento com halteres – 3x10',
      'Desenvolvimento Arnold – 3x10',
      'Desenvolvimento máquina – 3x10',
      'Desenvolvimento barra militar – 3x10',
    ],
    [
      'Elevação lateral halteres – 3x12',
      'Elevação lateral cabo – 3x12',
      'Elevação lateral máquina – 3x12',
      'Elevação frontal halteres – 3x12',
    ],
  ],
  triceps: [
    [
      'Tríceps corda na polia – 3x12',
      'Tríceps barra reta polia – 3x12',
      'Tríceps francês com halteres – 3x10',
      'Tríceps barra V polia – 3x12',
    ],
    [
      'Tríceps testa com barra – 3x10',
      'Mergulho em banco – 3x12',
      'Tríceps kickback – 3x12',
      'Tríceps coice no cabo – 3x12',
    ],
  ],
  costas: [
    [
      'Puxada frente polia alta – 4x10',
      'Barra fixa (assistida ou livre) – 4x8',
      'Puxada triângulo – 4x10',
      'Puxada aberta – 4x10',
    ],
    [
      'Remada baixa cabo – 3x10',
      'Remada curvada com barra – 3x10',
      'Remada cavalinho máquina – 3x10',
      'Remada sentado unilateral cabo – 3x10',
    ],
    [
      'Remada unilateral halter – 3x10',
      'Pulldown unilateral cabo – 3x10',
      'Remada serrote banco inclinado – 3x10',
      'Pullover halter – 3x12',
    ],
  ],
  biceps: [
    [
      'Rosca direta com barra – 3x10',
      'Rosca scott máquina – 3x12',
      'Rosca no cabo barra reta – 3x12',
      'Rosca direta com halteres – 3x10',
    ],
    [
      'Rosca alternada halteres – 3x12',
      'Rosca martelo – 3x12',
      'Rosca concentrada – 3x12',
      'Rosca inversa barra – 3x12',
    ],
  ],
  pernas_quad: [
    [
      'Agachamento livre – 4x10',
      'Agachamento hack – 4x10',
      'Agachamento no Smith – 4x10',
      'Agachamento frontal – 4x8',
    ],
    [
      'Leg press 45° – 3x12',
      'Leg press horizontal – 3x12',
      'Agachamento sumô halter – 3x12',
      'Passada búlgara – 3x10/perna',
    ],
    [
      'Cadeira extensora – 3x12',
      'Afundo alternado – 3x10/perna',
      'Avanço com halteres – 3x10/perna',
      'Sissy squat – 3x12',
    ],
  ],
  pernas_post: [
    [
      'Mesa flexora – 3x12',
      'Cadeira flexora – 3x12',
      'Stiff com barra – 3x10',
      'Stiff com halteres – 3x12',
    ],
    [
      'Elevação panturrilhas em pé – 3x15',
      'Panturrilha no leg press – 3x20',
      'Panturrilha sentado – 3x15',
      'Panturrilha unilateral – 3x12/lado',
    ],
  ],
  abdomen: [
    [
      'Prancha abdominal – 3x30s',
      'Prancha lateral – 3x20s/lado',
      'Prancha com toque no ombro – 3x20',
      'Roda abdominal (ab wheel) – 3x12',
    ],
    [
      'Abdominal infra – 3x15',
      'Abdominal oblíquo – 3x15',
      'Crunch na polia – 3x15',
      'Elevação de pernas pendurado – 3x12',
    ],
  ],
  funcional: [
    [
      'Face pull – 3x15',
      'Encolhimento trapézio halteres – 3x15',
      'Rotação externa ombro – 3x15',
      'Crucifixo inverso – 3x15',
    ],
  ],
};

// ─── Estrutura dos treinos da semana ──────────────────────────────────────

export const estruturaSemana = {
  1: { titulo: '🔥 PUSH — Peito, Ombro e Tríceps', grupos: ['peito', 'ombro', 'triceps'] },
  2: { titulo: '💪 PULL — Costas e Bíceps', grupos: ['costas', 'biceps', 'funcional'] },
  3: { titulo: '🦵 LEGS — Pernas e Abdômen', grupos: ['pernas_quad', 'pernas_post', 'abdomen'] },
  4: { titulo: '🔥 PUSH (Variações)', grupos: ['peito', 'ombro', 'triceps'] },
  5: { titulo: '💪 PULL (Variações)', grupos: ['costas', 'biceps', 'funcional'] },
  6: { titulo: '🦵 LEGS + Funcional', grupos: ['pernas_quad', 'pernas_post', 'abdomen'] },
};

// ─── Gerar treino do dia com ROTAÇÃO DIÁRIA ──────────────────────────────
// Usa o dia do ano como seed — mesmo treino o dia inteiro, diferente amanhã

export function gerarTreinoDoDia(diaSemana) {
  const estrutura = estruturaSemana[diaSemana] || estruturaSemana[1];
  const seed = getDiaDoAno();
  const exercicios = [];

  estrutura.grupos.forEach((grupo, gi) => {
    const slots = exerciciosPorGrupo[grupo];
    if (!slots) return;
    slots.forEach((variantes, si) => {
      // Seed combina dia + posição do grupo/slot para distribuição uniforme
      const idx = (seed + gi * 3 + si * 7) % variantes.length;
      exercicios.push(variantes[idx]);
    });
  });

  return { titulo: estrutura.titulo, exercicios };
}

// ─── Periodização / Ciclos ──────────────────────────────────────────────

export function getSemanaDoAno() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
}

export function getInfoCiclo() {
  const semanaAtual = getSemanaDoAno();
  const semanaNo = ((semanaAtual - 1) % 6) + 1;
  if (semanaNo <= 2) return { fase: 'Adaptação', msg: 'Semana leve — foque na técnica e no movimento', cor: 'text-blue-400', emoji: '🧊', semanaNo };
  if (semanaNo <= 5) return { fase: 'Progressão', msg: 'Semana de progressão — aumente a carga! 🔥', cor: 'text-amber-400', emoji: '⚡', semanaNo };
  return { fase: 'Deload', msg: 'Semana de deload — reduza a carga e recupere', cor: 'text-emerald-400', emoji: '🌿', semanaNo };
}

// ─── PLANO ALIMENTAR — ROTAÇÃO DIÁRIA ───────────────────────────────────
// Cada refeição tem múltiplas opções. O app escolhe 1 por dia baseado na data.
// Foco: hipertrofia (alta proteína), variedade, sem enjoar.

const opcoesPosTreino = [
  { label: '4 ovos mexidos + arroz branco + banana', macros: '~35g prot' },
  { label: 'Frango grelhado + batata doce + suco natural', macros: '~40g prot' },
  { label: 'Whey com leite + pão integral + pasta de amendoim', macros: '~35g prot' },
  { label: 'Omelete de 4 ovos com queijo + tapioca', macros: '~32g prot' },
  { label: 'Atum em lata + arroz + brócolis', macros: '~38g prot' },
  { label: 'Peito de frango desfiado + macarrão integral', macros: '~42g prot' },
  { label: 'Ovos cozidos (4) + inhame + abacate', macros: '~30g prot' },
  { label: 'Carne moída magra + purê de batata', macros: '~36g prot' },
  { label: 'Panqueca de aveia com whey + frutas', macros: '~33g prot' },
  { label: 'Frango com batata inglesa + salada verde', macros: '~38g prot' },
];

const opcoesAlmoco = [
  { label: 'Carne vermelha + arroz + feijão + salada', macros: '~45g prot' },
  { label: 'Frango grelhado + arroz integral + lentilha + legumes', macros: '~42g prot' },
  { label: 'Peixe assado + arroz + feijão preto + couve', macros: '~40g prot' },
  { label: 'Bife acebolado + arroz + grão-de-bico + tomate', macros: '~44g prot' },
  { label: 'Frango ao molho + macarrão integral + brócolis', macros: '~40g prot' },
  { label: 'Carne de panela + arroz + feijão + beterraba', macros: '~43g prot' },
  { label: 'Sobrecoxa assada + purê de mandioca + salada mista', macros: '~38g prot' },
  { label: 'Carne moída + arroz + feijão + abobrinha refogada', macros: '~42g prot' },
  { label: 'Tilápia grelhada + arroz + feijão branco + cenoura', macros: '~39g prot' },
  { label: 'Filé de frango + batata doce + feijão + espinafre', macros: '~41g prot' },
];

const opcoesLanche = [
  { label: 'Banana + pasta de amendoim + castanhas', macros: '~15g prot' },
  { label: '2 ovos cozidos + fruta da estação', macros: '~14g prot' },
  { label: 'Iogurte natural + granola + mel', macros: '~12g prot' },
  { label: 'Mix de castanhas + banana + canela', macros: '~10g prot' },
  { label: 'Sanduíche de pão integral + frango desfiado', macros: '~20g prot' },
  { label: 'Tapioca com queijo branco + suco', macros: '~15g prot' },
  { label: 'Batida de banana com aveia e leite', macros: '~16g prot' },
  { label: 'Torrada integral + ovo + abacate', macros: '~14g prot' },
  { label: 'Frutas vermelhas + castanha-do-pará + mel', macros: '~8g prot' },
  { label: 'Crepioca (tapioca + ovo) + fruta', macros: '~16g prot' },
];

const opcoesJantar = [
  { label: 'Omelete de legumes (4 ovos) + salada', macros: '~28g prot' },
  { label: 'Frango grelhado + legumes refogados', macros: '~35g prot' },
  { label: 'Peixe assado + abobrinha grelhada + tomate', macros: '~32g prot' },
  { label: 'Carne magra + couve refogada + cenoura', macros: '~36g prot' },
  { label: 'Sopa de legumes com frango desfiado', macros: '~30g prot' },
  { label: 'Wrap integral com atum + salada', macros: '~28g prot' },
  { label: 'Ovos mexidos com espinafre + pão integral', macros: '~26g prot' },
  { label: 'Filé de tilápia + brócolis + cenoura', macros: '~34g prot' },
  { label: 'Frango ao curry + legumes salteados', macros: '~35g prot' },
  { label: 'Hambúrguer caseiro (carne magra) + salada', macros: '~33g prot' },
];

const emojiRefeicao = {
  'pos-treino': '🍳',
  almoco: '🥩',
  lanche: '🥜',
  jantar: '🥗',
};

const nomeRefeicao = {
  'pos-treino': 'Pós-treino',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
};

const todasOpcoes = {
  'pos-treino': opcoesPosTreino,
  almoco: opcoesAlmoco,
  lanche: opcoesLanche,
  jantar: opcoesJantar,
};

/**
 * Gera o plano alimentar do dia com rotação diária.
 * Cada refeição recebe uma opção diferente a cada dia do ano.
 * Os offsets por refeição garantem que as opções não "andem juntas".
 */
export function gerarPlanoAlimentarDoDia() {
  const seed = getDiaDoAno();
  const ids = ['pos-treino', 'almoco', 'lanche', 'jantar'];
  const offsets = [0, 3, 5, 7]; // Deslocamento para cada refeição não repetir padrão

  return ids.map((id, i) => {
    const opcoes = todasOpcoes[id];
    const idx = (seed + offsets[i]) % opcoes.length;
    const escolha = opcoes[idx];
    return {
      id,
      emoji: emojiRefeicao[id],
      nome: nomeRefeicao[id],
      label: `${nomeRefeicao[id]}: ${escolha.label}`,
      macros: escolha.macros,
    };
  });
}

// ─── DIAS DA SEMANA HEBRAICA (Bereshit / Gênesis) ────────────────────────
// Cada dia da semana conforme a criação descrita na Torá

export const diasHebraicos = {
  0: { // Domingo
    diaPt: 'Domingo',
    hebraico: 'יוֹם רִאשׁוֹן',
    transliterado: 'Yom Rishon',
    nome: '1º Dia — Dia Primeiro',
    criacao: 'YHWH separou a luz das trevas. "Haja luz" — e houve luz.',
    referencia: 'Bereshit (Gênesis) 1:3-5',
    emoji: '☀️',
  },
  1: { // Segunda
    diaPt: 'Segunda-feira',
    hebraico: 'יוֹם שֵׁנִי',
    transliterado: 'Yom Sheni',
    nome: '2º Dia — Dia Segundo',
    criacao: 'YHWH fez o firmamento e separou as águas de cima das de baixo.',
    referencia: 'Bereshit (Gênesis) 1:6-8',
    emoji: '🌊',
  },
  2: { // Terça
    diaPt: 'Terça-feira',
    hebraico: 'יוֹם שְׁלִישִׁי',
    transliterado: 'Yom Shlishi',
    nome: '3º Dia — Dia Terceiro',
    criacao: 'A terra seca apareceu e brotou erva, plantas e árvores frutíferas.',
    referencia: 'Bereshit (Gênesis) 1:9-13',
    emoji: '🌱',
  },
  3: { // Quarta
    diaPt: 'Quarta-feira',
    hebraico: 'יוֹם רְבִיעִי',
    transliterado: 'Yom Revi\'i',
    nome: '4º Dia — Dia Quarto',
    criacao: 'YHWH fez o sol, a lua e as estrelas para governar o dia e a noite.',
    referencia: 'Bereshit (Gênesis) 1:14-19',
    emoji: '🌙',
  },
  4: { // Quinta
    diaPt: 'Quinta-feira',
    hebraico: 'יוֹם חֲמִישִׁי',
    transliterado: 'Yom Chamishi',
    nome: '5º Dia — Dia Quinto',
    criacao: 'YHWH criou os seres das águas e as aves dos céus.',
    referencia: 'Bereshit (Gênesis) 1:20-23',
    emoji: '🐟',
  },
  5: { // Sexta
    diaPt: 'Sexta-feira',
    hebraico: 'יוֹם שִׁשִּׁי',
    transliterado: 'Yom Shishi',
    nome: '6º Dia — Dia Sexto',
    criacao: 'YHWH criou os animais da terra e o homem à Sua imagem e semelhança.',
    referencia: 'Bereshit (Gênesis) 1:24-31',
    emoji: '🧬',
  },
  6: { // Sábado
    diaPt: 'Sábado (Shabbat)',
    hebraico: 'יוֹם הַשַּׁבָּת',
    transliterado: 'Yom HaShabbat',
    nome: '7º Dia — Shabbat',
    criacao: 'YHWH descansou de toda a obra que fizera. Abençoou e santificou este dia.',
    referencia: 'Bereshit (Gênesis) 2:1-3',
    emoji: '🕊️',
  },
};

/** Retorna info do dia hebraico baseado no dia da semana (0=dom ... 6=sáb) */
export function getDiaHebraico() {
  const d = new Date().getDay(); // 0=dom, 6=sáb
  return diasHebraicos[d];
}

// ─── PALAVRA DO DIA — Exclusivamente Bíblia Hebraica (Tanakh) ───────────
// Rotação diária automática. Cada dia do ano = 1 versículo diferente.

const palavrasTanakh = [
  // ── Torá (Pentateuco) ──
  { texto: 'No princípio, Elohim criou os céus e a terra.', ref: 'Bereshit (Gn) 1:1' },
  { texto: 'E disse Elohim: Façamos o homem à nossa imagem, conforme a nossa semelhança.', ref: 'Bereshit (Gn) 1:26' },
  { texto: 'Não é bom que o homem esteja só; far-lhe-ei uma auxiliar que lhe seja idônea.', ref: 'Bereshit (Gn) 2:18' },
  { texto: 'Shemá Israel, YHWH Eloheinu, YHWH Echad — Ouve, Israel, YHWH nosso Deus, YHWH é Um.', ref: 'Devarim (Dt) 6:4' },
  { texto: 'Amarás a YHWH teu Deus de todo o teu coração, de toda a tua alma e de toda a tua força.', ref: 'Devarim (Dt) 6:5' },
  { texto: 'Fortalece-te e sê corajoso, pois YHWH teu Deus é contigo por onde quer que andares.', ref: 'Yehoshua (Js) 1:9' },
  { texto: 'Não temas nem te espantes, porque YHWH teu Deus é contigo.', ref: 'Devarim (Dt) 31:6' },
  { texto: 'Ensina-as diligentemente a teus filhos, e fala delas sentado em tua casa e andando pelo caminho.', ref: 'Devarim (Dt) 6:7' },
  { texto: 'YHWH te abençoe e te guarde; YHWH faça resplandecer o Seu rosto sobre ti e tenha misericórdia de ti.', ref: 'Bamidbar (Nm) 6:24-25' },
  { texto: 'Não te vingarás nem guardarás rancor. Amarás o teu próximo como a ti mesmo.', ref: 'Vayikra (Lv) 19:18' },

  // ── Tehilim (Salmos) ──
  { texto: 'YHWH é meu pastor e nada me faltará.', ref: 'Tehilim (Sl) 23:1' },
  { texto: 'Ainda que eu ande pelo vale da sombra da morte, não temerei mal algum, pois Tu estás comigo.', ref: 'Tehilim (Sl) 23:4' },
  { texto: 'Com meu Deus salto muralhas.', ref: 'Tehilim (Sl) 18:29' },
  { texto: 'YHWH adestra minhas mãos para a batalha e meus braços para o combate.', ref: 'Tehilim (Sl) 18:34' },
  { texto: 'Espera em YHWH, sê forte, e Ele fortalecerá o teu coração.', ref: 'Tehilim (Sl) 27:14' },
  { texto: 'Entrega o teu caminho a YHWH, confia Nele, e Ele tudo fará.', ref: 'Tehilim (Sl) 37:5' },
  { texto: 'Aquietai-vos e sabei que Eu sou Deus.', ref: 'Tehilim (Sl) 46:10' },
  { texto: 'Cria em mim, ó Deus, um coração puro, e renova em mim um espírito inabalável.', ref: 'Tehilim (Sl) 51:10' },
  { texto: 'Como a corça anseia pelas correntes das águas, assim minha alma anseia por Ti, ó Deus.', ref: 'Tehilim (Sl) 42:1' },
  { texto: 'De YHWH é a terra e a sua plenitude, o mundo e aqueles que nele habitam.', ref: 'Tehilim (Sl) 24:1' },
  { texto: 'Os céus declaram a glória de El, e o firmamento anuncia a obra das Suas mãos.', ref: 'Tehilim (Sl) 19:1' },
  { texto: 'YHWH está perto dos quebrantados de coração e salva os contritos de espírito.', ref: 'Tehilim (Sl) 34:18' },
  { texto: 'Ensina-nos a contar os nossos dias, para que alcancemos coração sábio.', ref: 'Tehilim (Sl) 90:12' },
  { texto: 'A pedra que os construtores rejeitaram tornou-se a pedra angular.', ref: 'Tehilim (Sl) 118:22' },
  { texto: 'Lâmpada para os meus pés é a Tua palavra, e luz para o meu caminho.', ref: 'Tehilim (Sl) 119:105' },

  // ── Mishlei (Provérbios) ──
  { texto: 'O temor de YHWH é o princípio da sabedoria — e o princípio da verdadeira força.', ref: 'Mishlei (Pv) 1:7' },
  { texto: 'Confia em YHWH de todo o teu coração, e não te estribes no teu próprio entendimento.', ref: 'Mishlei (Pv) 3:5' },
  { texto: 'Em todos os teus caminhos reconhece-O, e Ele endireitará as tuas veredas.', ref: 'Mishlei (Pv) 3:6' },
  { texto: 'O justo é firme como o leão.', ref: 'Mishlei (Pv) 28:1' },
  { texto: 'Melhor é o que domina o seu espírito do que aquele que conquista uma cidade.', ref: 'Mishlei (Pv) 16:32' },
  { texto: 'Sete vezes cairá o justo, e se levantará; mas os perversos tropeçarão no mal.', ref: 'Mishlei (Pv) 24:16' },
  { texto: 'Educa a criança no caminho em que deve andar; e até quando envelhecer não se desviará dele.', ref: 'Mishlei (Pv) 22:6' },
  { texto: 'A resposta branda desvia o furor, mas a palavra dura suscita a ira.', ref: 'Mishlei (Pv) 15:1' },
  { texto: 'Ferro com ferro se afia, assim o homem afia o rosto de seu companheiro.', ref: 'Mishlei (Pv) 27:17' },
  { texto: 'Sobre tudo o que se deve guardar, guarda o teu coração, pois dele procedem as fontes da vida.', ref: 'Mishlei (Pv) 4:23' },

  // ── Kohelet (Eclesiastes) ──
  { texto: 'A sabedoria fortalece mais ao sábio do que dez poderosos numa cidade.', ref: 'Kohelet (Ec) 7:19' },
  { texto: 'Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu.', ref: 'Kohelet (Ec) 3:1' },
  { texto: 'Melhor é o fim das coisas do que o seu princípio; melhor é o paciente do que o arrogante.', ref: 'Kohelet (Ec) 7:8' },
  { texto: 'É melhor serem dois do que um, porque têm melhor paga do seu trabalho.', ref: 'Kohelet (Ec) 4:9' },
  { texto: 'Cordel de três dobras não se rebenta tão depressa.', ref: 'Kohelet (Ec) 4:12' },

  // ── Yeshayahu (Isaías) ──
  { texto: 'Os que esperam em YHWH renovarão as suas forças; subirão com asas como águias.', ref: 'Yeshayahu (Is) 40:31' },
  { texto: 'Não temas, porque Eu sou contigo; não te assombres, porque Eu sou o teu Deus.', ref: 'Yeshayahu (Is) 41:10' },
  { texto: 'Eu te fortaleço, e te ajudo, e te sustento com a destra da Minha justiça.', ref: 'Yeshayahu (Is) 41:10b' },
  { texto: 'Como são formosos sobre os montes os pés do que anuncia a paz, do que anuncia boas novas.', ref: 'Yeshayahu (Is) 52:7' },

  // ── Yirmeyahu (Jeremias) ──
  { texto: 'Eu sei os planos que tenho para vós, diz YHWH — planos de paz e não de mal, para vos dar futuro e esperança.', ref: 'Yirmeyahu (Jr) 29:11' },
  { texto: 'Clama a Mim e te responderei, e te mostrarei coisas grandes e ocultas que não sabes.', ref: 'Yirmeyahu (Jr) 33:3' },

  // ── Mikhah (Miqueias) ──
  { texto: 'O que YHWH pede de ti? Que pratiques justiça, ames a misericórdia e andes humildemente com teu Deus.', ref: 'Mikhah (Mq) 6:8' },

  // ── Chabaquque (Habacuque) ──
  { texto: 'O justo viverá pela sua fé.', ref: 'Chabaquque (Hc) 2:4' },

  // ── Yehoshua (Josué) ──
  { texto: 'Não se aparte da tua boca o livro desta Torá; medita nele dia e noite.', ref: 'Yehoshua (Js) 1:8' },

  // ── Shmuel (Samuel) ──
  { texto: 'O homem vê o exterior, porém YHWH vê o coração.', ref: 'Shmuel Alef (1Sm) 16:7' },

  // ── Daniel ──
  { texto: 'Os que são sábios resplandecerão como o fulgor do firmamento.', ref: 'Daniel (Dn) 12:3' },
];

/**
 * Retorna a palavra do dia (rotação diária automática).
 * Determinística: mesmo versículo o dia inteiro, muda amanhã.
 */
export function getPalavraDoDia() {
  const seed = getDiaDoAno();
  const idx = seed % palavrasTanakh.length;
  return palavrasTanakh[idx];
}

/**
 * Retorna uma palavra aleatória diferente da atual.
 */
export function getPalavraAleatoria(idxAtual) {
  let idx;
  do { idx = Math.floor(Math.random() * palavrasTanakh.length); } while (idx === idxAtual && palavrasTanakh.length > 1);
  return { ...palavrasTanakh[idx], idx };
}

export const totalPalavras = palavrasTanakh.length;
