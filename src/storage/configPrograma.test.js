import { beforeEach, describe, expect, it } from 'vitest';
import {
  CHAVE_CONFIG_PROGRAMA,
  carregarConfigPrograma,
  salvarConfigPrograma,
} from './configPrograma';

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
}

describe('configuração do programa', () => {
  beforeEach(() => {
    globalThis.localStorage = new LocalStorageEmMemoria();
  });

  it('salva e carrega uma data de início válida', () => {
    const resultado = salvarConfigPrograma('2026-10-06');

    expect(resultado).toMatchObject({
      ok: true,
      config: { v: 1, inicio: '2026-10-06' },
    });
    expect(carregarConfigPrograma()).toEqual(resultado.config);
  });

  it('não lança nem apaga uma configuração corrompida', () => {
    localStorage.setItem(CHAVE_CONFIG_PROGRAMA, '{config-corrompida');

    expect(() => carregarConfigPrograma()).not.toThrow();
    expect(carregarConfigPrograma()).toBeNull();
    expect(localStorage.getItem(CHAVE_CONFIG_PROGRAMA)).toBe('{config-corrompida');
  });
});
