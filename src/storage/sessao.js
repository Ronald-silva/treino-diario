export const VERSAO_SESSAO = 2;
export const CHAVE_HISTORICO = 'treino:v2:historico';

const PREFIXO_SESSAO = 'treino:v2:sessao:';
const MENSAGEM_ERRO_SALVAR = 'Não foi possível salvar.';

function doisDigitos(valor) {
  return String(valor).padStart(2, '0');
}

function tresDigitos(valor) {
  return String(valor).padStart(3, '0');
}

export function getDataLocal(data = new Date()) {
  return [
    data.getFullYear(),
    doisDigitos(data.getMonth() + 1),
    doisDigitos(data.getDate()),
  ].join('-');
}

export function getDataHoraLocal(data = new Date()) {
  const deslocamento = -data.getTimezoneOffset();
  const sinal = deslocamento >= 0 ? '+' : '-';
  const horasOffset = doisDigitos(Math.floor(Math.abs(deslocamento) / 60));
  const minutosOffset = doisDigitos(Math.abs(deslocamento) % 60);

  return `${getDataLocal(data)}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}.${tresDigitos(data.getMilliseconds())}${sinal}${horasOffset}:${minutosOffset}`;
}

export function getChaveSessao(data) {
  return `${PREFIXO_SESSAO}${data}`;
}

function criarEntradaExercicio(exercicioId) {
  return { exercicioId, series: [] };
}

export function criarSessaoVazia({ data, treinoId = null, exercicioIds = [], agora = new Date() }) {
  return {
    v: VERSAO_SESSAO,
    data,
    treinoId,
    iniciadaEm: getDataHoraLocal(agora),
    concluidaEm: null,
    exercicios: exercicioIds.map(criarEntradaExercicio),
  };
}

function numeroValido(valor) {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0;
}

function serieValida(serie) {
  return serie
    && numeroValido(serie.kg)
    && numeroValido(serie.reps)
    && (serie.rir === null || numeroValido(serie.rir))
    && typeof serie.nota === 'string'
    && typeof serie.feitaEm === 'string';
}

function sessaoValida(sessao, dataEsperada) {
  return sessao
    && sessao.v === VERSAO_SESSAO
    && sessao.data === dataEsperada
    && (typeof sessao.treinoId === 'string' || sessao.treinoId === null)
    && typeof sessao.iniciadaEm === 'string'
    && (typeof sessao.concluidaEm === 'string' || sessao.concluidaEm === null)
    && Array.isArray(sessao.exercicios)
    && sessao.exercicios.every((entrada) => (
      entrada
      && typeof entrada.exercicioId === 'string'
      && Array.isArray(entrada.series)
      && entrada.series.every(serieValida)
    ));
}

export function carregarSessao(data) {
  try {
    const valor = localStorage.getItem(getChaveSessao(data));
    if (!valor) return criarSessaoVazia({ data });

    const sessao = JSON.parse(valor);
    return sessaoValida(sessao, data) ? sessao : criarSessaoVazia({ data });
  } catch {
    return criarSessaoVazia({ data });
  }
}

export function carregarSessaoDoTreino({ data, treinoId, exercicioIds, agora = new Date() }) {
  const carregada = carregarSessao(data);

  if (carregada.treinoId !== null && carregada.treinoId !== treinoId) {
    return criarSessaoVazia({ data, treinoId, exercicioIds, agora });
  }

  const entradasPorId = new Map(
    carregada.exercicios.map((entrada) => [entrada.exercicioId, entrada]),
  );

  return {
    ...carregada,
    treinoId,
    exercicios: exercicioIds.map((exercicioId) => (
      entradasPorId.get(exercicioId) ?? criarEntradaExercicio(exercicioId)
    )),
  };
}

function resultado(sessao, ok, erro = null) {
  return { sessao, ok, erro };
}

export function salvarSessao(sessao) {
  try {
    localStorage.setItem(getChaveSessao(sessao.data), JSON.stringify(sessao));
    return resultado(sessao, true);
  } catch {
    return resultado(sessao, false, MENSAGEM_ERRO_SALVAR);
  }
}

function normalizarSerie(serie, serieAtual = null) {
  const kg = Number(serie.kg);
  const reps = Number(serie.reps);
  const rir = serie.rir === null || serie.rir === '' ? null : Number(serie.rir);

  if (!numeroValido(kg) || !numeroValido(reps) || reps < 1 || (rir !== null && !numeroValido(rir))) {
    return null;
  }

  return {
    kg,
    reps,
    rir,
    nota: typeof serie.nota === 'string' ? serie.nota.trim() : '',
    feitaEm: serieAtual?.feitaEm ?? serie.feitaEm ?? getDataHoraLocal(),
  };
}

function atualizarExercicio(sessao, exercicioId, atualizar) {
  const existe = sessao.exercicios.some((entrada) => entrada.exercicioId === exercicioId);
  const exercicios = existe
    ? sessao.exercicios.map((entrada) => (
      entrada.exercicioId === exercicioId ? atualizar(entrada) : entrada
    ))
    : [...sessao.exercicios, atualizar(criarEntradaExercicio(exercicioId))];

  return { ...sessao, exercicios };
}

export function registrarSerie(sessao, exercicioId, dadosSerie) {
  const serie = normalizarSerie(dadosSerie);
  if (!serie) return resultado(sessao, false, 'Preencha valores válidos para a série.');

  const atualizada = atualizarExercicio(sessao, exercicioId, (entrada) => ({
    ...entrada,
    series: [...entrada.series, serie],
  }));

  return salvarSessao(atualizada);
}

export function editarSerie(sessao, exercicioId, serieIndex, dadosSerie) {
  const entrada = sessao.exercicios.find((item) => item.exercicioId === exercicioId);
  const serieAtual = entrada?.series[serieIndex];
  if (!serieAtual) return resultado(sessao, false, 'Série não encontrada.');

  const serie = normalizarSerie(dadosSerie, serieAtual);
  if (!serie) return resultado(sessao, false, 'Preencha valores válidos para a série.');

  const atualizada = atualizarExercicio(sessao, exercicioId, (item) => ({
    ...item,
    series: item.series.map((existente, index) => (index === serieIndex ? serie : existente)),
  }));

  return salvarSessao(atualizada);
}

export function removerSerie(sessao, exercicioId, serieIndex) {
  const entrada = sessao.exercicios.find((item) => item.exercicioId === exercicioId);
  if (!entrada?.series[serieIndex]) return resultado(sessao, false, 'Série não encontrada.');

  const atualizada = atualizarExercicio(sessao, exercicioId, (item) => ({
    ...item,
    series: item.series.filter((_, index) => index !== serieIndex),
  }));

  return salvarSessao(atualizada);
}

export function carregarHistorico() {
  try {
    const valor = localStorage.getItem(CHAVE_HISTORICO);
    if (!valor) return [];

    const historico = JSON.parse(valor);
    return Array.isArray(historico)
      ? historico.filter((data) => typeof data === 'string')
      : [];
  } catch {
    return [];
  }
}

function salvarHistorico(datas) {
  try {
    localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(datas));
    return { ok: true, erro: null };
  } catch {
    return { ok: false, erro: MENSAGEM_ERRO_SALVAR };
  }
}

export function concluirSessao(sessao) {
  const concluida = sessao.concluidaEm
    ? sessao
    : { ...sessao, concluidaEm: getDataHoraLocal() };
  const salvamento = salvarSessao(concluida);
  if (!salvamento.ok) return salvamento;

  const historico = [...new Set([...carregarHistorico(), sessao.data])];
  const resultadoHistorico = salvarHistorico(historico);

  return resultado(
    concluida,
    resultadoHistorico.ok,
    resultadoHistorico.erro,
  );
}

export function reabrirSessao(sessao) {
  const reaberta = { ...sessao, concluidaEm: null };
  const salvamento = salvarSessao(reaberta);
  if (!salvamento.ok) return salvamento;

  const historico = carregarHistorico().filter((data) => data !== sessao.data);
  const resultadoHistorico = salvarHistorico(historico);

  return resultado(
    reaberta,
    resultadoHistorico.ok,
    resultadoHistorico.erro,
  );
}

export function resetarSessao({ data, treinoId, exercicioIds }) {
  const vazia = criarSessaoVazia({ data, treinoId, exercicioIds });
  const salvamento = salvarSessao(vazia);
  if (!salvamento.ok) return salvamento;

  const historico = carregarHistorico().filter((dataHistorico) => dataHistorico !== data);
  const resultadoHistorico = salvarHistorico(historico);

  return resultado(
    vazia,
    resultadoHistorico.ok,
    resultadoHistorico.erro,
  );
}
