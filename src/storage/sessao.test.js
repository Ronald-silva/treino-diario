import { beforeEach, describe, expect, it } from 'vitest';
import { getInfoCiclo, getSemanaDoAno, parsePrescricao } from '../data';
import {
  CHAVE_HISTORICO,
  VERSAO_SESSAO,
  carregarHistorico,
  carregarSessao,
  carregarSessaoDoTreino,
  concluirSessao,
  getChaveSessao,
  getDataLocal,
  registrarSerie,
  resetarSessao,
} from './sessao';

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
});
