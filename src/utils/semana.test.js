import { beforeEach, describe, expect, it } from 'vitest';
import {
  criarDataLocal,
  formatarDataLocal,
  obterSegundaDaSemana,
  obterDiasSemanaSegASab,
  getDiaSemanaLocal,
  calcularConsistenciaSemana,
  contarConcluidos,
} from '../utils/semana';

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

describe('cálculo de semana (seg a sáb) em data local', () => {
  beforeEach(() => {
    globalThis.localStorage = new LocalStorageEmMemoria();
  });

  it('formata e cria data local corretamente', () => {
    const data = new Date(2026, 9, 6, 23, 30, 0);
    expect(formatarDataLocal(data)).toBe('2026-10-06');
    const criada = criarDataLocal('2026-10-06');
    expect(criada.getFullYear()).toBe(2026);
    expect(criada.getMonth()).toBe(9);
    expect(criada.getDate()).toBe(6);
  });

  it('às 23h em UTC-3 não adianta o dia (dia da semana local)', () => {
    const data = new Date('2026-10-06T23:30:00-03:00');
    expect(data.toISOString().slice(0, 10)).toBe('2026-10-07');
    expect(getDiaSemanaLocal(data)).toBe(2);
    expect(formatarDataLocal(data)).toBe('2026-10-06');
  });

  it('segunda-feira é obtida corretamente a partir de quarta', () => {
    const quarta = criarDataLocal('2026-10-07');
    const segunda = obterSegundaDaSemana(quarta);
    expect(formatarDataLocal(segunda)).toBe('2026-10-05');
    expect(segunda.getDay()).toBe(1);
  });

  it('segunda-feira é obtida corretamente a partir de sábado', () => {
    const sabado = criarDataLocal('2026-10-10');
    const segunda = obterSegundaDaSemana(sabado);
    expect(formatarDataLocal(segunda)).toBe('2026-10-05');
  });

  it('domingo retorna para a semana que começou na segunda anterior', () => {
    const domingo = criarDataLocal('2026-10-11');
    expect(domingo.getDay()).toBe(0);
    const segunda = obterSegundaDaSemana(domingo);
    expect(formatarDataLocal(segunda)).toBe('2026-10-05');
  });

  it('dias da semana seg a sáb retornam 6 datas em ordem', () => {
    const quarta = criarDataLocal('2026-10-07');
    const dias = obterDiasSemanaSegASab(quarta);
    expect(dias).toHaveLength(6);
    expect(dias[0].data).toBe('2026-10-05');
    expect(dias[0].diaSemana).toBe(1);
    expect(dias[5].data).toBe('2026-10-10');
    expect(dias[5].diaSemana).toBe(6);
  });

  it('consistência da semana marca concluídos, mínimos e hoje', () => {
    const quarta = criarDataLocal('2026-10-07');
    const dias = obterDiasSemanaSegASab(quarta);
    const historico = ['2026-10-05', '2026-10-06'];
    const minimas = new Set(['2026-10-06']);

    const consistencia = calcularConsistenciaSemana(dias, historico, minimas, quarta);

    expect(consistencia[0].concluido).toBe(true);
    expect(consistencia[0].minima).toBe(false);
    expect(consistencia[0].ehHoje).toBe(false);

    expect(consistencia[1].concluido).toBe(true);
    expect(consistencia[1].minima).toBe(true);

    expect(consistencia[2].ehHoje).toBe(true);
    expect(consistencia[2].concluido).toBe(false);

    expect(contarConcluidos(consistencia)).toBe(2);
  });

  it('1º de janeiro de 2027 (sexta) semana correta', () => {
    const sexta = new Date(2027, 0, 1, 12, 0, 0);
    const dias = obterDiasSemanaSegASab(sexta);
    expect(formatarDataLocal(dias[0].dataObj)).toBe('2026-12-28');
    expect(dias[4].data).toBe('2027-01-01');
    expect(dias[4].diaSemana).toBe(5);
  });
});
