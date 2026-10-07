import { beforeEach, describe, expect, it } from 'vitest';
import {
  gerarTreinoDoDia,
  getInfoCiclo,
  getSemanaDoAno,
  parsePrescricao,
} from '../data';
import { aplicarFase, calcularSemanaPrograma } from '../programa/fases';
import { salvarConfigPrograma } from './configPrograma';
import {
  CHAVE_HISTORICO,
  VERSAO_SESSAO,
  carregarHistorico,
  carregarSessao,
  carregarSessaoDoTreino,
  concluirSessao,
  concluirSessaoMinima,
  definirAquecimento,
  exercicioConcluido,
  getChaveSessao,
  getDataLocal,
  marcarExercicioManual,
  reabrirSessao,
  registrarSerie,
  resetarSessao,
} from './sessao';

function atingiuPrescricao(sessao, treino) {
  return treino.exercicios.every((exercicio) => {
    const entrada = sessao.exercicios.find((item) => item.exercicioId === exercicio.id);
    return exercicioConcluido(entrada, exercicio);
  });
}

class LocalStorageEmMemoria {
  constructor() {
    this.dados = new Map();
  }

  getItem(chave) {
    return this.dados.has(chave) ? this.dados.get(chave) : null;
  }

  setItem(chave, valor) {
    this.dados.set(chave, String(valor));
  }

  clear() {
    this.dados.clear();
  }
}

const TREINO_A = {
  data: '2026-10-06',
  treinoId: 'pull-a',
  exercicioIds: ['puxada-frente-polia-alta'],
};

describe('sessão de treino v2', () => {
  beforeEach(() => {
    globalThis.localStorage = new LocalStorageEmMemoria();
  });

  it('mantém a data local às 23h em UTC-3', () => {
    const data = new Date('2026-10-06T23:30:00-03:00');

    expect(data.toISOString().slice(0, 10)).toBe('2026-10-07');
    expect(getDataLocal(data)).toBe('2026-10-06');
  });

  it('registra uma série e a recupera em um novo carregamento', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    const resultado = registrarSerie(sessao, 'puxada-frente-polia-alta', {
      kg: 50,
      reps: 10,
      rir: 2,
      nota: 'execução controlada',
    });

    expect(resultado.ok).toBe(true);

    const recarregada = carregarSessao(TREINO_A.data);
    expect(recarregada.exercicios[0].series).toHaveLength(1);
    expect(recarregada.exercicios[0].series[0]).toMatchObject({
      kg: 50,
      reps: 10,
      rir: 2,
      nota: 'execução controlada',
    });
  });

  it('não duplica a data no histórico ao concluir duas vezes', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    const primeira = concluirSessao(sessao);
    const segunda = concluirSessao(primeira.sessao);

    expect(primeira.ok).toBe(true);
    expect(segunda.ok).toBe(true);
    expect(segunda.sessao.concluidaEm).toBe(primeira.sessao.concluidaEm);
    expect(carregarHistorico()).toEqual([TREINO_A.data]);
    expect(JSON.parse(localStorage.getItem(CHAVE_HISTORICO))).toEqual([TREINO_A.data]);
  });

  it('retorna aviso sem lançar quando a gravação falha', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    localStorage.setItem = () => {
      throw new Error('storage indisponível');
    };

    const resultado = registrarSerie(sessao, 'puxada-frente-polia-alta', {
      kg: 50,
      reps: 10,
      rir: 2,
      nota: '',
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.erro).toBe('Não foi possível salvar.');
  });

  it('usa fallback seguro quando o JSON está corrompido', () => {
    localStorage.setItem(getChaveSessao(TREINO_A.data), '{json-invalido');

    expect(() => carregarSessao(TREINO_A.data)).not.toThrow();
    expect(carregarSessao(TREINO_A.data)).toMatchObject({
      v: VERSAO_SESSAO,
      data: TREINO_A.data,
      treinoId: null,
      concluidaEm: null,
      exercicios: [],
    });
    expect(localStorage.getItem(getChaveSessao(TREINO_A.data))).toBe('{json-invalido');
  });

  it('ignora versão desconhecida sem apagar o dado original', () => {
    const desconhecida = JSON.stringify({ v: 99, data: TREINO_A.data });
    localStorage.setItem(getChaveSessao(TREINO_A.data), desconhecida);

    const sessao = carregarSessao(TREINO_A.data);

    expect(sessao.v).toBe(VERSAO_SESSAO);
    expect(sessao.exercicios).toEqual([]);
    expect(localStorage.getItem(getChaveSessao(TREINO_A.data))).toBe(desconhecida);
  });

  it('carrega uma sessão nova na virada de data sem misturar exercícios', () => {
    const sessaoDoDia = carregarSessaoDoTreino(TREINO_A);
    registrarSerie(sessaoDoDia, 'puxada-frente-polia-alta', {
      kg: 50,
      reps: 10,
      rir: 2,
      nota: '',
    });

    const sessaoDoNovoDia = carregarSessaoDoTreino({
      data: '2026-10-07',
      treinoId: 'legs-a',
      exercicioIds: ['agachamento-livre'],
    });

    expect(sessaoDoNovoDia.data).toBe('2026-10-07');
    expect(sessaoDoNovoDia.treinoId).toBe('legs-a');
    expect(sessaoDoNovoDia.exercicios).toEqual([
      { exercicioId: 'agachamento-livre', series: [] },
    ]);
  });

  it('remove do histórico somente a sessão resetada', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    concluirSessao(sessao);

    const resultado = resetarSessao(TREINO_A);

    expect(resultado.ok).toBe(true);
    expect(resultado.sessao.exercicios[0].series).toEqual([]);
    expect(carregarHistorico()).toEqual([]);
  });

  it('mantém o snapshot da semana 1 depois de alterar a data de início', () => {
    salvarConfigPrograma('2026-10-06');
    const treinoBase = gerarTreinoDoDia(1);
    const semanaInicial = calcularSemanaPrograma('2026-10-06', TREINO_A.data);
    const treinoInicial = aplicarFase(treinoBase, semanaInicial);
    const sessaoInicial = carregarSessaoDoTreino({
      data: TREINO_A.data,
      treinoId: treinoInicial.id,
      exercicios: treinoInicial.exercicios,
      programa: treinoInicial.programa,
    });

    registrarSerie(sessaoInicial, treinoInicial.exercicios[0].id, {
      kg: 20,
      reps: 10,
      rir: 3,
      nota: '',
    });

    salvarConfigPrograma('2026-09-01');
    const novaSemana = calcularSemanaPrograma('2026-09-01', TREINO_A.data);
    const treinoRecalculado = aplicarFase(treinoBase, novaSemana);
    const recarregada = carregarSessaoDoTreino({
      data: TREINO_A.data,
      treinoId: treinoRecalculado.id,
      exercicios: treinoRecalculado.exercicios,
      programa: treinoRecalculado.programa,
    });

    expect(treinoRecalculado.programa.semana).toBeGreaterThan(1);
    expect(recarregada.programa).toMatchObject({ fase: 1, semana: 1, deload: false });
    expect(recarregada.exercicios).toHaveLength(4);
    recarregada.exercicios.forEach((entrada) => {
      expect(entrada.prescricao).toMatchObject({ series: 2, rirAlvo: 3 });
    });
  });

  it('carrega uma sessão v2 antiga sem snapshot', () => {
    const antiga = {
      v: 2,
      data: TREINO_A.data,
      treinoId: TREINO_A.treinoId,
      iniciadaEm: '2026-10-06T07:00:00.000-03:00',
      concluidaEm: null,
      exercicios: [{ exercicioId: 'puxada-frente-polia-alta', series: [] }],
    };
    localStorage.setItem(getChaveSessao(TREINO_A.data), JSON.stringify(antiga));

    expect(() => carregarSessao(TREINO_A.data)).not.toThrow();
    expect(carregarSessao(TREINO_A.data)).toEqual(antiga);
  });

  it('marca exercício como concluído manualmente sem séries e persiste', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    const entrada = sessao.exercicios[0];
    expect(entrada.series).toHaveLength(0);
    expect(exercicioConcluido(entrada)).toBe(false);

    const marcado = marcarExercicioManual(sessao, TREINO_A.exercicioIds[0], true);
    expect(marcado.ok).toBe(true);
    const entradaMarcada = marcado.sessao.exercicios[0];
    expect(entradaMarcada.concluidoManual).toBe(true);
    expect(exercicioConcluido(entradaMarcada)).toBe(true);

    const recarregada = carregarSessao(TREINO_A.data);
    const entradaRecarregada = recarregada.exercicios.find((e) => e.exercicioId === TREINO_A.exercicioIds[0]);
    expect(entradaRecarregada.concluidoManual).toBe(true);
    expect(entradaRecarregada.series).toHaveLength(0);
  });

  it('desmarca exercício concluído manualmente', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    const marcado = marcarExercicioManual(sessao, TREINO_A.exercicioIds[0], true);
    expect(marcado.ok).toBe(true);

    const desmarcado = marcarExercicioManual(marcado.sessao, TREINO_A.exercicioIds[0], false);
    expect(desmarcado.ok).toBe(true);
    expect(desmarcado.sessao.exercicios[0].concluidoManual).toBeUndefined();
    expect(exercicioConcluido(desmarcado.sessao.exercicios[0])).toBe(false);
  });

  it('versão mínima registra minima: true e conta como dia concluído', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    expect(sessao.minima).toBeUndefined();

    const resultado = concluirSessaoMinima(sessao);
    expect(resultado.ok).toBe(true);
    expect(resultado.sessao.minima).toBe(true);
    expect(resultado.sessao.concluidaEm).toBeTruthy();
    expect(carregarHistorico()).toEqual([TREINO_A.data]);
  });

  it('versão mínima concluída 2x não duplica no histórico', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    const primeira = concluirSessaoMinima(sessao);
    const segunda = concluirSessaoMinima(primeira.sessao);

    expect(primeira.ok).toBe(true);
    expect(segunda.ok).toBe(true);
    expect(segunda.sessao.concluidaEm).toBe(primeira.sessao.concluidaEm);
    expect(carregarHistorico()).toEqual([TREINO_A.data]);
  });

  it('sessão antiga sem campos novos continua carregando', () => {
    const antiga = {
      v: 2,
      data: TREINO_A.data,
      treinoId: TREINO_A.treinoId,
      iniciadaEm: '2026-10-06T07:00:00.000-03:00',
      concluidaEm: '2026-10-06T08:00:00.000-03:00',
      exercicios: [{ exercicioId: 'puxada-frente-polia-alta', series: [] }],
    };
    localStorage.setItem(getChaveSessao(TREINO_A.data), JSON.stringify(antiga));

    const carregada = carregarSessao(TREINO_A.data);
    expect(carregada).toEqual(antiga);
    expect(carregada.minima).toBeUndefined();
  });

  it.each([
    ['4x10', { series: 4, repsMin: 10, repsMax: 10 }],
    ['3x12', { series: 3, repsMin: 12, repsMax: 12 }],
  ])('parseia %s corretamente', (prescricao, esperado) => {
    expect(parsePrescricao(prescricao)).toEqual(esperado);
  });

  it('inicia o ciclo na semana 1 em primeiro de janeiro', () => {
    const primeiroDeJaneiro = new Date(2027, 0, 1, 12, 0, 0);

    expect(getSemanaDoAno(primeiroDeJaneiro)).toBe(1);
    expect(getInfoCiclo(primeiroDeJaneiro).semanaNo).toBe(1);
  });

  it('marcar último exercício manualmente dispara conclusão automática (sem depender do aquecimento)', () => {
    salvarConfigPrograma('2026-10-05');
    const treinoBase = gerarTreinoDoDia(1);
    const semana = calcularSemanaPrograma('2026-10-05', TREINO_A.data);
    const treino = aplicarFase(treinoBase, semana);
    expect(treino.exercicios.length).toBeGreaterThanOrEqual(2);

    let sessao = carregarSessaoDoTreino({
      data: TREINO_A.data,
      treinoId: treino.id,
      exercicios: treino.exercicios,
      programa: treino.programa,
    });
    expect(sessao.concluidaEm).toBeNull();

    treino.exercicios.slice(0, -1).forEach((ex) => {
      const r = marcarExercicioManual(sessao, ex.id, true);
      sessao = r.sessao;
      expect(sessao.concluidaEm).toBeNull();
    });

    expect(atingiuPrescricao(sessao, treino)).toBe(false);

    const ultimoId = treino.exercicios.at(-1).id;
    let resultado = marcarExercicioManual(sessao, ultimoId, true);
    sessao = resultado.sessao;

    let concluiuAgora = false;
    if (
      resultado.ok
      && !sessao.concluidaEm
      && atingiuPrescricao(sessao, treino)
    ) {
      resultado = concluirSessao(resultado.sessao);
      concluiuAgora = Boolean(resultado.sessao.concluidaEm);
    }

    expect(concluiuAgora).toBe(true);
    expect(resultado.sessao.concluidaEm).toBeTruthy();
    expect(carregarHistorico()).toEqual([TREINO_A.data]);
  });

  it('aquecimento não bloqueia a conclusão automática nem dispara sozinho', () => {
    salvarConfigPrograma('2026-10-05');
    const treinoBase = gerarTreinoDoDia(1);
    const semana = calcularSemanaPrograma('2026-10-05', TREINO_A.data);
    const treino = aplicarFase(treinoBase, semana);
    let sessao = carregarSessaoDoTreino({
      data: TREINO_A.data,
      treinoId: treino.id,
      exercicios: treino.exercicios,
      programa: treino.programa,
    });

    const aquecido = definirAquecimento(sessao, true);
    sessao = aquecido.sessao;
    expect(sessao.aquecimentoFeito).toBe(true);
    expect(sessao.concluidaEm).toBeNull();

    let resultado;
    treino.exercicios.forEach((ex) => {
      resultado = marcarExercicioManual(sessao, ex.id, true);
      sessao = resultado.sessao;
    });

    if (resultado.ok && !sessao.concluidaEm && atingiuPrescricao(sessao, treino)) {
      resultado = concluirSessao(resultado.sessao);
    }
    expect(resultado.sessao.concluidaEm).toBeTruthy();

    const historico = carregarHistorico();
    expect(historico).toEqual([TREINO_A.data]);

    const duasVezes = concluirSessao(resultado.sessao);
    expect(duasVezes.sessao.concluidaEm).toBe(resultado.sessao.concluidaEm);
    expect(carregarHistorico()).toEqual([TREINO_A.data]);
  });

  it('concluir 2x não duplica no histórico e reabrir + concluir mantém 1 data', () => {
    const sessao = carregarSessaoDoTreino(TREINO_A);
    const primeira = concluirSessao(sessao);
    expect(primeira.ok).toBe(true);
    expect(carregarHistorico()).toEqual([TREINO_A.data]);

    const segunda = concluirSessao(primeira.sessao);
    expect(segunda.sessao.concluidaEm).toBe(primeira.sessao.concluidaEm);
    expect(carregarHistorico()).toEqual([TREINO_A.data]);

    const reaberta = reabrirSessao(segunda.sessao);
    expect(reaberta.ok).toBe(true);
    expect(reaberta.sessao.concluidaEm).toBeNull();
    expect(carregarHistorico()).toEqual([]);

    const deNova = concluirSessao(reaberta.sessao);
    expect(deNova.ok).toBe(true);
    expect(deNova.sessao.concluidaEm).toBeTruthy();
    expect(carregarHistorico()).toEqual([TREINO_A.data]);
  });
});
