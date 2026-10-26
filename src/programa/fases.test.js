import { describe, expect, it } from 'vitest';
import { gerarTreinoDoDia } from '../data';
import {
  aplicarFase,
  calcularSemanaPrograma,
  CONFIGURACAO_FASES,
  getDataLocalPrograma,
  IDS_EXERCICIOS_COMPOSTOS,
} from './fases';

describe('fases do programa', () => {
  it.each([1, 2])('aplica a fase 1 na semana %i', (semana) => {
    const push = aplicarFase(gerarTreinoDoDia(1), semana);
    const pull = aplicarFase(gerarTreinoDoDia(2), semana);
    const legs = aplicarFase(gerarTreinoDoDia(3), semana);

    expect(push.programa).toMatchObject({ fase: 1, semana, deload: false });
    expect(push.exercicios).toHaveLength(6);
    expect(pull.exercicios).toHaveLength(6);
    expect(legs.exercicios).toHaveLength(7);

    [...push.exercicios, ...pull.exercicios, ...legs.exercicios].forEach((exercicio) => {
      expect(exercicio).toMatchObject({ series: 3, rirAlvo: 2, rirAlvoMax: 2 });
    });
  });

  it.each([3, 6])('aplica a fase 2 na semana %i', (semana) => {
    const treinoBase = gerarTreinoDoDia(1);
    const treino = aplicarFase(treinoBase, semana);

    expect(treino.programa).toMatchObject({ fase: 2, semana, deload: false });
    expect(treino.exercicios).toHaveLength(treinoBase.exercicios.length);
    treino.exercicios.forEach((exercicio) => {
      expect(exercicio).toMatchObject({ series: 4, rirAlvo: 1, rirAlvoMax: 1 });
    });
  });

  it('aplica a fase 3 sem deload na semana 9', () => {
    const treinoBase = gerarTreinoDoDia(1);
    const treino = aplicarFase(treinoBase, 9);

    expect(treino.programa).toMatchObject({ fase: 3, semana: 9, deload: false });
    expect(treino.exercicios.map(({ series }) => series)).toEqual(
      treinoBase.exercicios.map(({ series }) => series),
    );
    expect(treino.exercicios[0]).toMatchObject({ rirAlvo: 0, rirAlvoMax: 1 });
    expect(treino.exercicios[3]).toMatchObject({ rirAlvo: 1, rirAlvoMax: 1 });
  });

  it('aplica metade das séries e RIR 4 no deload da semana 13', () => {
    const treinoBase = gerarTreinoDoDia(1);
    const treino = aplicarFase(treinoBase, 13);

    expect(treino.programa).toMatchObject({ fase: 3, semana: 13, deload: true });
    expect(treino.exercicios.map(({ series }) => series)).toEqual(
      treinoBase.exercicios.map(({ series }) => Math.max(1, Math.ceil(series / 2))),
    );
    treino.exercicios.forEach((exercicio) => {
      expect(exercicio).toMatchObject({ rirAlvo: 4, rirAlvoMax: 4 });
    });
  });

  it('calcula a semana com a data local sem antecipar o dia às 23h em UTC-3', () => {
    const agora = new Date('2026-10-06T23:30:00-03:00');

    expect(getDataLocalPrograma(agora)).toBe('2026-10-06');
    expect(calcularSemanaPrograma('2026-09-30', agora)).toBe(1);
    expect(calcularSemanaPrograma('2026-09-29', agora)).toBe(2);
  });

  it('mantém a semana 1 quando a data de início está no futuro', () => {
    expect(calcularSemanaPrograma('2026-10-13', '2026-10-06')).toBe(1);
  });

  describe('LEGS A', () => {
    it('contém stiff-halteres e não contém cadeira extensora', () => {
      const legsA = gerarTreinoDoDia(3);
      const idsExercicios = legsA.exercicios.map((ex) => ex.id);

      expect(idsExercicios).toContain('stiff-halteres');
      expect(idsExercicios).not.toContain('cadeira-extensora');
    });

    it('mantém 7 exercícios na fase 1', () => {
      const legsA = aplicarFase(gerarTreinoDoDia(3), 1);
      expect(legsA.exercicios).toHaveLength(7);
      expect(legsA.exercicios.map((ex) => ex.id)).toContain('stiff-halteres');
    });

    it('stiff-halteres aparece após o leg press', () => {
      const legsA = gerarTreinoDoDia(3);
      const idsExercicios = legsA.exercicios.map((ex) => ex.id);
      const idxLegPress = idsExercicios.indexOf('leg-press-45');
      const idxStiff = idsExercicios.indexOf('stiff-halteres');

      expect(idxLegPress).toBeGreaterThanOrEqual(0);
      expect(idxStiff).toBeGreaterThan(idxLegPress);
    });
  });

  describe('LEGS B', () => {
    it('não muda em relação à estrutura original', () => {
      const legsB = gerarTreinoDoDia(6);
      const idsExercicios = legsB.exercicios.map((ex) => ex.id);

      // LEGS B usa grupos, então deve ter o principal de cada slot
      expect(idsExercicios).toContain('agachamento-livre');
      expect(idsExercicios).toContain('leg-press-45');
      expect(idsExercicios).toContain('mesa-flexora'); // Principal do slot pernas_post
    });
  });

  describe('stiff-halteres como composto', () => {
    it('está registrado na lista de compostos', () => {
      expect(IDS_EXERCICIOS_COMPOSTOS).toContain('stiff-halteres');
    });

    it('recebe RIR 0-1 na fase 3', () => {
      const legsA = aplicarFase(gerarTreinoDoDia(3), 9);
      const stiff = legsA.exercicios.find((ex) => ex.id === 'stiff-halteres');

      expect(stiff).toBeDefined();
      expect(stiff?.rirAlvo).toBe(0);
      expect(stiff?.rirAlvoMax).toBe(1);
    });
  });

  describe('agachamento livre fase 3', () => {
    it('usa 4 séries na semana 9', () => {
      const treino = aplicarFase(gerarTreinoDoDia(3), 9);
      const agachamento = treino.exercicios.find((ex) => ex.id === 'agachamento-livre');

      expect(agachamento?.series).toBe(4);
    });

    it('usa 2 séries na semana 13 (deload)', () => {
      const treino = aplicarFase(gerarTreinoDoDia(3), 13);
      const agachamento = treino.exercicios.find((ex) => ex.id === 'agachamento-livre');

      // Semana 13 é deload, então 4 séries / 2 = 2 séries
      expect(agachamento?.series).toBe(2);
    });

    it('volta para 4 séries na semana 15', () => {
      const treino = aplicarFase(gerarTreinoDoDia(3), 15);
      const agachamento = treino.exercicios.find((ex) => ex.id === 'agachamento-livre');

      expect(agachamento?.series).toBe(4); // Valor original do data.js
    });

    it('usa constante configurável para séries semanas 9-14', () => {
      expect(CONFIGURACAO_FASES.SERIES_AGACHAMENTO_FASE3_SEMANA_9_14).toBe(4);
    });
  });
});
