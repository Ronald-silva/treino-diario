export const CONFIGURACAO_FASES = Object.freeze({
  FIM_FASE_ADAPTACAO: 4,
  FIM_FASE_CONSOLIDACAO: 8,
  PRIMEIRA_SEMANA_DELOAD: 14,
  INTERVALO_DELOAD: 6,
  SERIES_ADAPTACAO: 2,
  SERIES_CONSOLIDACAO: 3,
  RIR_ADAPTACAO: 3,
  RIR_CONSOLIDACAO: 2,
  RIR_COMPOSTO_PROGRESSAO_MIN: 1,
  RIR_COMPOSTO_PROGRESSAO_MAX: 2,
  RIR_ISOLADOR_PROGRESSAO: 2,
  RIR_DELOAD: 4,
  SERIES_AGACHAMENTO_FASE3_SEMANA_9_14: 3,
  LIMITES_ADAPTACAO: Object.freeze({
    push: 4,
    pull: 5,
    legs: 5,
  }),
});

export const NOMES_FASES = Object.freeze({
  1: 'Adaptação',
  2: 'Consolidação',
  3: 'Progressão',
});

export const IDS_EXERCICIOS_COMPOSTOS = Object.freeze([
  'supino-reto-barra',
  'supino-inclinado-halteres',
  'desenvolvimento-halteres',
  'puxada-frente-polia-alta',
  'remada-baixa-cabo',
  'remada-unilateral-halter',
  'agachamento-livre',
  'leg-press-45',
  'stiff-halteres',
]);

const EXERCICIOS_COMPOSTOS = new Set(IDS_EXERCICIOS_COMPOSTOS);
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
const REGEX_DATA_LOCAL = /^(\d{4})-(\d{2})-(\d{2})$/;

function doisDigitos(valor) {
  return String(valor).padStart(2, '0');
}

export function getDataLocalPrograma(data = new Date()) {
  return [
    data.getFullYear(),
    doisDigitos(data.getMonth() + 1),
    doisDigitos(data.getDate()),
  ].join('-');
}

export function dataLocalValida(valor) {
  if (typeof valor !== 'string') return false;

  const match = REGEX_DATA_LOCAL.exec(valor);
  if (!match) return false;

  const ano = Number(match[1]);
  const mes = Number(match[2]);
  const dia = Number(match[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return data.getUTCFullYear() === ano
    && data.getUTCMonth() === mes - 1
    && data.getUTCDate() === dia;
}

function dataParaUtc(valor) {
  const [ano, mes, dia] = valor.split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

export function calcularSemanaPrograma(inicio, hoje = new Date()) {
  const dataAtual = hoje instanceof Date ? getDataLocalPrograma(hoje) : hoje;
  if (!dataLocalValida(inicio) || !dataLocalValida(dataAtual)) return 1;

  const diasDesdeInicio = Math.floor(
    (dataParaUtc(dataAtual) - dataParaUtc(inicio)) / UM_DIA_EM_MS,
  );

  return Math.max(1, Math.floor(diasDesdeInicio / 7) + 1);
}

function getTipoTreino(treinoId = '') {
  return ['push', 'pull', 'legs'].find((tipo) => treinoId.startsWith(tipo)) ?? null;
}

export function getFasePrograma(semana) {
  const semanaNormalizada = Math.max(1, Math.floor(Number(semana)) || 1);

  if (semanaNormalizada <= CONFIGURACAO_FASES.FIM_FASE_ADAPTACAO) {
    return {
      fase: 1,
      faseNome: NOMES_FASES[1],
      semana: semanaNormalizada,
      deload: false,
    };
  }

  if (semanaNormalizada <= CONFIGURACAO_FASES.FIM_FASE_CONSOLIDACAO) {
    return {
      fase: 2,
      faseNome: NOMES_FASES[2],
      semana: semanaNormalizada,
      deload: false,
    };
  }

  const deload = semanaNormalizada >= CONFIGURACAO_FASES.PRIMEIRA_SEMANA_DELOAD
    && (semanaNormalizada - CONFIGURACAO_FASES.PRIMEIRA_SEMANA_DELOAD)
      % CONFIGURACAO_FASES.INTERVALO_DELOAD === 0;

  return {
    fase: 3,
    faseNome: NOMES_FASES[3],
    semana: semanaNormalizada,
    deload,
  };
}

function aplicarAlvo(exercicio, programa) {
  if (programa.deload) {
    return {
      ...exercicio,
      series: Math.max(1, Math.ceil(exercicio.series / 2)),
      rirAlvo: CONFIGURACAO_FASES.RIR_DELOAD,
      rirAlvoMax: CONFIGURACAO_FASES.RIR_DELOAD,
    };
  }

  if (programa.fase === 1) {
    return {
      ...exercicio,
      series: CONFIGURACAO_FASES.SERIES_ADAPTACAO,
      rirAlvo: CONFIGURACAO_FASES.RIR_ADAPTACAO,
      rirAlvoMax: CONFIGURACAO_FASES.RIR_ADAPTACAO,
    };
  }

  if (programa.fase === 2) {
    return {
      ...exercicio,
      series: CONFIGURACAO_FASES.SERIES_CONSOLIDACAO,
      rirAlvo: CONFIGURACAO_FASES.RIR_CONSOLIDACAO,
      rirAlvoMax: CONFIGURACAO_FASES.RIR_CONSOLIDACAO,
    };
  }

  const composto = EXERCICIOS_COMPOSTOS.has(exercicio.id);
  const rirAlvo = composto
    ? CONFIGURACAO_FASES.RIR_COMPOSTO_PROGRESSAO_MIN
    : CONFIGURACAO_FASES.RIR_ISOLADOR_PROGRESSAO;

  // Fase 3: agachamento livre usa 3 séries nas semanas 9 a 14
  let series = exercicio.series;
  if (
    exercicio.id === 'agachamento-livre' &&
    programa.semana >= 9 &&
    programa.semana <= 14
  ) {
    series = CONFIGURACAO_FASES.SERIES_AGACHAMENTO_FASE3_SEMANA_9_14;
  }

  return {
    ...exercicio,
    series,
    rirAlvo,
    rirAlvoMax: composto
      ? CONFIGURACAO_FASES.RIR_COMPOSTO_PROGRESSAO_MAX
      : rirAlvo,
  };
}

export function aplicarFase(treinoDoDia, semana) {
  const programa = getFasePrograma(semana);
  const tipoTreino = getTipoTreino(treinoDoDia?.id);
  const limite = programa.fase === 1 && tipoTreino
    ? CONFIGURACAO_FASES.LIMITES_ADAPTACAO[tipoTreino]
    : undefined;
  const exercicios = Array.isArray(treinoDoDia?.exercicios)
    ? treinoDoDia.exercicios.slice(0, limite)
    : [];

  return {
    ...treinoDoDia,
    programa,
    exercicios: exercicios.map((exercicio) => aplicarAlvo(exercicio, programa)),
  };
}
