// ─── Helpers ──────────────────────────────────────────────────────────────

/** Dia do ano (1-366) — usado como seed para os conteúdos diários */
export function getDiaDoAno() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

const REGEX_PRESCRICAO = /(\d+)\s*x\s*(\d+)(?:\s*[–-]\s*(\d+))?/i;

/** Converte prescrições como 4x10 e 3x8-12 para dados numéricos. */
export function parsePrescricao(prescricao) {
  const match = REGEX_PRESCRICAO.exec(prescricao);

  if (!match) {
    throw new Error(`Prescrição inválida: ${prescricao}`);
  }

  const series = Number(match[1]);
  const repsMin = Number(match[2]);
  const repsMax = Number(match[3] ?? match[2]);

  return { series, repsMin, repsMax };
}

function criarExercicio(id, nome, grupo, equipamento, prescricao, rirAlvo = 2) {
  return {
    id,
    nome,
    grupo,
    equipamento,
    ...parsePrescricao(prescricao),
    rirAlvo,
  };
}

function criarSlot(principal, ...alternativas) {
  return { principal, alternativas };
}

// ─── Banco de exercícios fixo, com alternativas preservadas ──────────────
// A ficha sempre usa `principal`. As alternativas ficam disponíveis para uma
// futura troca manual, sem afetar a identidade ou o histórico do exercício.

export const exerciciosPorGrupo = {
  peito: [
    // Slot 1 — Composto principal
    criarSlot(
      criarExercicio('supino-reto-barra', 'Supino reto com barra', 'peito', 'barra', '4x10'),
      criarExercicio('supino-reto-halteres', 'Supino reto com halteres', 'peito', 'halteres', '4x10'),
      criarExercicio('supino-maquina', 'Supino máquina', 'peito', 'máquina', '4x10'),
      criarExercicio('supino-reto-smith', 'Supino reto barra guiada (Smith)', 'peito', 'smith', '4x10'),
    ),
    // Slot 2 — Inclinado / ângulo superior
    criarSlot(
      criarExercicio('supino-inclinado-halteres', 'Supino inclinado com halteres', 'peito', 'halteres', '3x10'),
      criarExercicio('supino-inclinado-barra', 'Supino inclinado com barra', 'peito', 'barra', '3x10'),
      criarExercicio('crucifixo-inclinado-halteres', 'Crucifixo inclinado com halteres', 'peito', 'halteres', '3x12'),
      criarExercicio('crossover-polia-alta', 'Crossover na polia alta', 'peito', 'polia', '3x12'),
    ),
  ],
  ombro: [
    criarSlot(
      criarExercicio('desenvolvimento-halteres', 'Desenvolvimento com halteres', 'ombro', 'halteres', '3x10'),
      criarExercicio('desenvolvimento-arnold', 'Desenvolvimento Arnold', 'ombro', 'halteres', '3x10'),
      criarExercicio('desenvolvimento-maquina', 'Desenvolvimento máquina', 'ombro', 'máquina', '3x10'),
      criarExercicio('desenvolvimento-barra-militar', 'Desenvolvimento barra militar', 'ombro', 'barra', '3x10'),
    ),
    criarSlot(
      criarExercicio('elevacao-lateral-halteres', 'Elevação lateral com halteres', 'ombro', 'halteres', '3x12'),
      criarExercicio('elevacao-lateral-cabo', 'Elevação lateral no cabo', 'ombro', 'cabo', '3x12'),
      criarExercicio('elevacao-lateral-maquina', 'Elevação lateral máquina', 'ombro', 'máquina', '3x12'),
      criarExercicio('elevacao-frontal-halteres', 'Elevação frontal com halteres', 'ombro', 'halteres', '3x12'),
    ),
  ],
  triceps: [
    criarSlot(
      criarExercicio('triceps-corda-polia', 'Tríceps corda na polia', 'triceps', 'polia', '3x12'),
      criarExercicio('triceps-barra-reta-polia', 'Tríceps barra reta na polia', 'triceps', 'polia', '3x12'),
      criarExercicio('triceps-frances-halter', 'Tríceps francês com halter', 'triceps', 'halter', '3x10'),
      criarExercicio('triceps-barra-v-polia', 'Tríceps barra V na polia', 'triceps', 'polia', '3x12'),
    ),
    criarSlot(
      criarExercicio('triceps-testa-barra', 'Tríceps testa com barra', 'triceps', 'barra', '3x10'),
      criarExercicio('mergulho-banco', 'Mergulho em banco', 'triceps', 'banco', '3x12'),
      criarExercicio('triceps-kickback', 'Tríceps kickback', 'triceps', 'halter', '3x12'),
      criarExercicio('triceps-coice-cabo', 'Tríceps coice no cabo', 'triceps', 'cabo', '3x12'),
    ),
  ],
  costas: [
    criarSlot(
      criarExercicio('puxada-frente-polia-alta', 'Puxada frente na polia alta', 'costas', 'polia', '4x10'),
      criarExercicio('barra-fixa', 'Barra fixa assistida ou livre', 'costas', 'barra fixa', '4x8'),
      criarExercicio('puxada-triangulo', 'Puxada com triângulo', 'costas', 'polia', '4x10'),
      criarExercicio('puxada-aberta', 'Puxada aberta', 'costas', 'polia', '4x10'),
    ),
    criarSlot(
      criarExercicio('remada-baixa-cabo', 'Remada baixa no cabo', 'costas', 'cabo', '3x10'),
      criarExercicio('remada-curvada-barra', 'Remada curvada com barra', 'costas', 'barra', '3x10'),
      criarExercicio('remada-cavalinho-maquina', 'Remada cavalinho máquina', 'costas', 'máquina', '3x10'),
      criarExercicio('remada-sentado-unilateral-cabo', 'Remada sentada unilateral no cabo', 'costas', 'cabo', '3x10'),
    ),
    criarSlot(
      criarExercicio('remada-unilateral-halter', 'Remada unilateral com halter', 'costas', 'halter', '3x10'),
      criarExercicio('pulldown-unilateral-cabo', 'Pulldown unilateral no cabo', 'costas', 'cabo', '3x10'),
      criarExercicio('remada-serrote-banco-inclinado', 'Remada serrote no banco inclinado', 'costas', 'halter', '3x10'),
      criarExercicio('pullover-halter', 'Pullover com halter', 'costas', 'halter', '3x12'),
    ),
  ],
  biceps: [
    criarSlot(
      criarExercicio('rosca-direta-barra', 'Rosca direta com barra', 'biceps', 'barra', '3x10'),
      criarExercicio('rosca-scott-maquina', 'Rosca Scott máquina', 'biceps', 'máquina', '3x12'),
      criarExercicio('rosca-cabo-barra-reta', 'Rosca no cabo com barra reta', 'biceps', 'cabo', '3x12'),
      criarExercicio('rosca-direta-halteres', 'Rosca direta com halteres', 'biceps', 'halteres', '3x10'),
    ),
    criarSlot(
      criarExercicio('rosca-alternada-halteres', 'Rosca alternada com halteres', 'biceps', 'halteres', '3x12'),
      criarExercicio('rosca-martelo', 'Rosca martelo', 'biceps', 'halteres', '3x12'),
      criarExercicio('rosca-concentrada', 'Rosca concentrada', 'biceps', 'halter', '3x12'),
      criarExercicio('rosca-inversa-barra', 'Rosca inversa com barra', 'biceps', 'barra', '3x12'),
    ),
  ],
  pernas_quad: [
    criarSlot(
      criarExercicio('agachamento-livre', 'Agachamento livre', 'pernas_quad', 'barra', '4x10'),
      criarExercicio('agachamento-hack', 'Agachamento hack', 'pernas_quad', 'máquina', '4x10'),
      criarExercicio('agachamento-smith', 'Agachamento no Smith', 'pernas_quad', 'smith', '4x10'),
      criarExercicio('agachamento-frontal', 'Agachamento frontal', 'pernas_quad', 'barra', '4x8'),
    ),
    criarSlot(
      criarExercicio('leg-press-45', 'Leg press 45°', 'pernas_quad', 'máquina', '3x12'),
      criarExercicio('leg-press-horizontal', 'Leg press horizontal', 'pernas_quad', 'máquina', '3x12'),
      criarExercicio('agachamento-sumo-halter', 'Agachamento sumô com halter', 'pernas_quad', 'halter', '3x12'),
      criarExercicio('passada-bulgara', 'Passada búlgara por perna', 'pernas_quad', 'halteres', '3x10'),
    ),
    criarSlot(
      criarExercicio('cadeira-extensora', 'Cadeira extensora', 'pernas_quad', 'máquina', '3x12'),
      criarExercicio('afundo-alternado', 'Afundo alternado por perna', 'pernas_quad', 'peso corporal', '3x10'),
      criarExercicio('avanco-halteres', 'Avanço com halteres por perna', 'pernas_quad', 'halteres', '3x10'),
      criarExercicio('sissy-squat', 'Sissy squat', 'pernas_quad', 'peso corporal', '3x12'),
    ),
  ],
  pernas_post: [
    criarSlot(
      criarExercicio('mesa-flexora', 'Mesa flexora', 'pernas_post', 'máquina', '3x12'),
      criarExercicio('cadeira-flexora', 'Cadeira flexora', 'pernas_post', 'máquina', '3x12'),
      criarExercicio('stiff-barra', 'Stiff com barra', 'pernas_post', 'barra', '3x10'),
      criarExercicio('stiff-halteres', 'Stiff com halteres', 'pernas_post', 'halteres', '3x12'),
    ),
    criarSlot(
      criarExercicio('panturrilha-em-pe', 'Elevação de panturrilhas em pé', 'pernas_post', 'máquina', '3x15'),
      criarExercicio('panturrilha-leg-press', 'Panturrilha no leg press', 'pernas_post', 'máquina', '3x20'),
      criarExercicio('panturrilha-sentado', 'Panturrilha sentado', 'pernas_post', 'máquina', '3x15'),
      criarExercicio('panturrilha-unilateral', 'Panturrilha unilateral por lado', 'pernas_post', 'peso corporal', '3x12'),
    ),
  ],
  abdomen: [
    criarSlot(
      criarExercicio('prancha-abdominal', 'Prancha abdominal (segundos)', 'abdomen', 'peso corporal', '3x30s'),
      criarExercicio('prancha-lateral', 'Prancha lateral (segundos por lado)', 'abdomen', 'peso corporal', '3x20s'),
      criarExercicio('prancha-toque-ombro', 'Prancha com toque no ombro', 'abdomen', 'peso corporal', '3x20'),
      criarExercicio('roda-abdominal', 'Roda abdominal (ab wheel)', 'abdomen', 'roda abdominal', '3x12'),
    ),
    criarSlot(
      criarExercicio('abdominal-infra', 'Abdominal infra', 'abdomen', 'peso corporal', '3x15'),
      criarExercicio('abdominal-obliquo', 'Abdominal oblíquo', 'abdomen', 'peso corporal', '3x15'),
      criarExercicio('crunch-polia', 'Crunch na polia', 'abdomen', 'polia', '3x15'),
      criarExercicio('elevacao-pernas-pendurado', 'Elevação de pernas pendurado', 'abdomen', 'barra fixa', '3x12'),
    ),
  ],
  funcional: [
    criarSlot(
      criarExercicio('face-pull', 'Face pull', 'funcional', 'cabo', '3x15'),
      criarExercicio('encolhimento-trapezio-halteres', 'Encolhimento de trapézio com halteres', 'funcional', 'halteres', '3x15'),
      criarExercicio('rotacao-externa-ombro', 'Rotação externa de ombro', 'funcional', 'cabo', '3x15'),
      criarExercicio('crucifixo-inverso', 'Crucifixo inverso', 'funcional', 'máquina', '3x15'),
    ),
  ],
};

// ─── Estrutura dos treinos da semana ──────────────────────────────────────

export const estruturaSemana = {
  1: { id: 'push-a', titulo: '🔥 PUSH A — Peito, Ombro e Tríceps', grupos: ['peito', 'ombro', 'triceps'] },
  2: { id: 'pull-a', titulo: '💪 PULL A — Costas e Bíceps', grupos: ['costas', 'biceps', 'funcional'] },
  3: { id: 'legs-a', titulo: '🦵 LEGS A — Pernas e Abdômen', grupos: ['pernas_quad', 'pernas_post', 'abdomen'] },
  4: { id: 'push-b', titulo: '🔥 PUSH B — Peito, Ombro e Tríceps', grupos: ['peito', 'ombro', 'triceps'] },
  5: { id: 'pull-b', titulo: '💪 PULL B — Costas e Bíceps', grupos: ['costas', 'biceps', 'funcional'] },
  6: { id: 'legs-b', titulo: '🦵 LEGS B — Pernas e Abdômen', grupos: ['pernas_quad', 'pernas_post', 'abdomen'] },
};

// ─── Gerar treino fixo do dia ─────────────────────────────────────────────

export function gerarTreinoDoDia(diaSemana) {
  const estrutura = estruturaSemana[diaSemana] || estruturaSemana[1];
  const exercicios = [];

  estrutura.grupos.forEach((grupo) => {
    const slots = exerciciosPorGrupo[grupo];
    if (!slots) return;
    slots.forEach((slot) => {
      exercicios.push(slot.principal);
    });
  });

  return { id: estrutura.id, titulo: estrutura.titulo, exercicios };
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
// Alinhado com:
//   • Vayikra (Lv) 11 + Devarim (Dt) 14 — animais puros: boi, frango, peixe
//     com escamas. Inclui miúdos (fígado, coração, moela) e ossada com tutano.
//   • Fortaleza-CE: cuscuz, macaxeira, tapioca, feijão verde, queijo coalho
//   • Orçamento enxuto: sobrecoxa, carne moída, miúdos, atum/sardinha em lata
//   • Praticidade: máx. 20 min de preparo para quem mora sozinho

const opcoesPosTreino = [
  { label: '4 ovos mexidos + cuscuz nordestino + banana-prata', macros: '~34g prot' },
  { label: 'Frango desfiado (sobrecoxa) + arroz + mamão formoso', macros: '~38g prot' },
  { label: 'Tapioca grossa com ovo mexido + queijo coalho grelhado', macros: '~30g prot' },
  { label: 'Omelete de 4 ovos com queijo coalho + cuscuz simples', macros: '~33g prot' },
  { label: 'Atum em lata (escorrido) + arroz branco + banana', macros: '~36g prot' },
  { label: '4 ovos cozidos + macaxeira cozida + suco de laranja', macros: '~28g prot' },
  { label: 'Frango grelhado (peito) + batata doce cozida + água c/ limão', macros: '~40g prot' },
  { label: 'Sardinha assada em lata + arroz + tomate picado', macros: '~35g prot' },
  { label: 'Carne moída bovina refogada + cuscuz + fruta da época', macros: '~37g prot' },
  { label: 'Panqueca de aveia com 2 ovos + mel de abelha + banana', macros: '~28g prot' },
  { label: 'Fígado bovino frito c/ cebola + cuscuz + laranja (VitC ↑ absorção de ferro)', macros: '~38g prot · B12·Fe·VitA' },
  { label: 'Coração bovino fatiado e grelhado + arroz + banana-prata', macros: '~36g prot · CoQ10·B12' },
  { label: 'Omelete de 3 ovos com fígado bovino moído + tomate + cuscuz', macros: '~34g prot · B12·Fe' },
  { label: 'Moela de frango refogada com alho e cebola + arroz + fruta', macros: '~32g prot · Fe·Zn' },
  { label: 'Caldo de osso bovino com tutano + 2 ovos mexidos + cuscuz', macros: '~30g prot · colágeno·minerais' },
  { label: 'Arroz + feijão + ovo estrelado + banana (clássico nordestino nutritivo)', macros: '~26g prot' },
  { label: 'Coração bovino cozido desfiado + macaxeira + cenoura', macros: '~35g prot · CoQ10' },
  { label: 'Tilápia grelhada + arroz + mamão formoso + limão', macros: '~38g prot · ômega3' },
  { label: 'Sardinha fresca grelhada + cuscuz + tomate', macros: '~36g prot · ômega3' },
  { label: 'Frango cozido + batata doce amassada + suco de caju natural', macros: '~37g prot · VitC' },
];

const opcoesAlmoco = [
  { label: 'Sobrecoxa de frango cozida + arroz + feijão verde cearense + jerimum refogado', macros: '~42g prot' },
  { label: 'Carne bovina (acém moído) + arroz + feijão carioca + salada de alface e tomate', macros: '~44g prot' },
  { label: 'Tilápia grelhada na frigideira + arroz + feijão fradinho + coentro e limão', macros: '~40g prot' },
  { label: 'Frango cozido desfiado + macaxeira cozida + feijão verde + maxixe refogado', macros: '~41g prot' },
  { label: 'Carne moída bovina + arroz + feijão preto + chuchu cozido', macros: '~43g prot' },
  { label: 'Sardinha assada (lata) + arroz + feijão fradinho + salada simples', macros: '~36g prot' },
  { label: 'Frango (sobrecoxa) ao molho de tomate + arroz + feijão verde', macros: '~42g prot' },
  { label: 'Bife bovino magro acebolado + macaxeira + feijão + cenoura cozida', macros: '~45g prot' },
  { label: 'Atum em lata + arroz + feijão carioca + beterraba crua ralada', macros: '~38g prot' },
  { label: 'Frango grelhado + arroz integral + feijão verde + abóbora assada', macros: '~41g prot' },
  { label: 'Fígado bovino acebolado + arroz + feijão + salada de tomate e coentro', macros: '~46g prot · B12·Fe·VitA' },
  { label: 'Coração bovino cozido na pressão + macaxeira + feijão verde + jerimum', macros: '~44g prot · CoQ10·B12' },
  { label: 'Moela de frango refogada c/ tomate e pimentão + arroz + feijão verde', macros: '~40g prot · Fe·Zn' },
  { label: 'Língua bovina cozida fatiada + macaxeira + feijão + salada simples', macros: '~43g prot · B12·Zn' },
  { label: 'Ossada bovina na pressão (tutano incluso) + arroz + feijão + farinha de mandioca', macros: '~38g prot · colágeno·Ca·P' },
  { label: 'Mocotó (pé bovino cozido) com legumes + arroz + farinha', macros: '~35g prot · colágeno·gelatina' },
  { label: 'Sopa de osso bovino com tutano + legumes + cuscuz nordestino', macros: '~36g prot · colágeno·minerais' },
  { label: 'Pescada amarela assada + arroz + feijão fradinho + pirão de peixe', macros: '~42g prot · ômega3' },
  { label: 'Carne de sol bovina + arroz + feijão verde + jerimum + farinha', macros: '~46g prot · Fe·Zn' },
  { label: 'Frango inteiro cozido na pressão + legumes cozidos + caldo como sopa', macros: '~44g prot · colágeno' },
];

const opcoesLanche = [
  { label: 'Banana-prata + punhado de amendoim torrado sem sal', macros: '~12g prot' },
  { label: '2 ovos cozidos + caju ou manga da época', macros: '~13g prot' },
  { label: 'Tapioca fina com queijo coalho derretido', macros: '~14g prot' },
  { label: 'Batida de banana com aveia e leite integral', macros: '~16g prot' },
  { label: 'Cuscuz frio (sobra do almoço) + ovo cozido', macros: '~16g prot' },
  { label: 'Iogurte natural + banana amassada + canela', macros: '~11g prot' },
  { label: 'Crepioca (1 ovo + 2 col. tapioca) + mel de abelha', macros: '~15g prot' },
  { label: 'Pão francês + ovo mexido + tomate fatiado', macros: '~14g prot' },
  { label: 'Amendoim cozido (típico CE) + banana-prata', macros: '~10g prot' },
  { label: 'Macaxeira cozida + queijo coalho grelhado', macros: '~12g prot' },
  { label: 'Fígado bovino em tiras grelhadas — snack de alto valor nutricional', macros: '~22g prot · B12·Fe·VitA' },
  { label: 'Coração bovino cozido fatiado frio + limão e sal', macros: '~20g prot · CoQ10·B12' },
  { label: 'Caldo de osso bovino quente com sal grosso e limão', macros: '~10g prot · colágeno·Ca' },
  { label: 'Sopa de osso + legumes (tuper do almoço requentado)', macros: '~15g prot · colágeno' },
  { label: 'Coalhada caseira (leite + limão fermentado) + banana + mel', macros: '~12g prot · probióticos' },
  { label: 'Paçoca de amendoim caseira + banana-prata', macros: '~10g prot · energia' },
  { label: 'Ovo cozido + farinha de mandioca torrada + limão (típico nordestino)', macros: '~13g prot' },
  { label: 'Cuscuz com leite quente (café tardio típico CE)', macros: '~14g prot' },
  { label: 'Rapadura + punhado de amendoim (energia rápida nordestina)', macros: '~8g prot · energia' },
  { label: 'Tapioca com sardinha amassada + limão', macros: '~18g prot · ômega3' },
];

const opcoesJantar = [
  { label: 'Omelete de 3 ovos com cebola e tomate + cuscuz simples', macros: '~26g prot' },
  { label: 'Frango desfiado refogado + chuchu e cenoura + arroz', macros: '~34g prot' },
  { label: 'Sardinha na lata com tomate, cebola e coentro + cuscuz', macros: '~32g prot' },
  { label: 'Ovos mexidos com couve refogada + macaxeira cozida', macros: '~24g prot' },
  { label: 'Sopa rápida de legumes com frango desfiado (panela única)', macros: '~30g prot' },
  { label: 'Tapioca com ovo + queijo coalho + salada de alface simples', macros: '~25g prot' },
  { label: 'Carne moída bovina + abobrinha refogada + arroz', macros: '~35g prot' },
  { label: 'Tilápia assada com limão e alho + legumes simples', macros: '~33g prot' },
  { label: 'Omelete com atum em lata + tomate e cebola + cuscuz', macros: '~30g prot' },
  { label: 'Frango grelhado (alho, sal, limão — tempero nordestino) + legumes salteados', macros: '~36g prot' },
  { label: 'Fígado bovino refogado com alho + cuscuz + salada simples', macros: '~38g prot · B12·Fe·VitA' },
  { label: 'Coração bovino em tiras grelhadas + omelete de 2 ovos + salada', macros: '~36g prot · CoQ10·B12' },
  { label: 'Moela de frango cozida + chuchu + cenoura + caldo (leve)', macros: '~30g prot · Fe·Zn' },
  { label: 'Sopa de ossada bovina com tutano + legumes + macarrão de arroz', macros: '~32g prot · colágeno·minerais' },
  { label: 'Caldo verde nordestino (frango + couve + macaxeira) — leve e nutritivo', macros: '~28g prot · colágeno' },
  { label: 'Sopa de feijão com osso bovino + legumes (pressão rápida)', macros: '~30g prot · Fe·colágeno' },
  { label: 'Tilápia na frigideira com azeite, alho e limão + salada crua', macros: '~34g prot · ômega3' },
  { label: 'Ovo mexido com sardinha amassada + cuscuz + limão', macros: '~28g prot · ômega3' },
  { label: 'Pescada amarela assada + legumes + suco de limão', macros: '~36g prot · ômega3' },
  { label: 'Coalhada caseira com banana amassada (jantar leve pré-sono)', macros: '~12g prot · probióticos·Ca' },
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
