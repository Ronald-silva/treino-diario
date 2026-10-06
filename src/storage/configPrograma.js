import { dataLocalValida } from '../programa/fases';

export const CHAVE_CONFIG_PROGRAMA = 'treino:v2:config';
export const VERSAO_CONFIG_PROGRAMA = 1;

const MENSAGEM_CONFIG_INVALIDA = 'Informe uma data de início válida.';
const MENSAGEM_ERRO_SALVAR = 'Não foi possível salvar.';

function configValida(config) {
  return config
    && config.v === VERSAO_CONFIG_PROGRAMA
    && dataLocalValida(config.inicio);
}

export function carregarConfigPrograma() {
  try {
    const valor = localStorage.getItem(CHAVE_CONFIG_PROGRAMA);
    if (!valor) return null;

    const config = JSON.parse(valor);
    return configValida(config) ? config : null;
  } catch {
    return null;
  }
}

export function salvarConfigPrograma(inicio) {
  if (!dataLocalValida(inicio)) {
    return { ok: false, config: null, erro: MENSAGEM_CONFIG_INVALIDA };
  }

  const config = { v: VERSAO_CONFIG_PROGRAMA, inicio };

  try {
    localStorage.setItem(CHAVE_CONFIG_PROGRAMA, JSON.stringify(config));
    return { ok: true, config, erro: null };
  } catch {
    return { ok: false, config: null, erro: MENSAGEM_ERRO_SALVAR };
  }
}
