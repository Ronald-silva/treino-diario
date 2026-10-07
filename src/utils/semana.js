export const SEGUNDA = 1;
export const TERCA = 2;
export const QUARTA = 3;
export const QUINTA = 4;
export const SEXTA = 5;
export const SABADO = 6;
export const DOMINGO = 0;

const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

function doisDigitos(valor) {
  return String(valor).padStart(2, '0');
}

export function formatarDataLocal(data) {
  return [
    data.getFullYear(),
    doisDigitos(data.getMonth() + 1),
    doisDigitos(data.getDate()),
  ].join('-');
}

export function criarDataLocal(dataStr) {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function getDiaSemanaLocal(data) {
  const dia = data instanceof Date ? data.getDay() : criarDataLocal(data).getDay();
  return dia === 0 ? 7 : dia;
}

export function obterSegundaDaSemana(data) {
  const dataObj = data instanceof Date ? new Date(data) : criarDataLocal(data);
  const dia = getDiaSemanaLocal(dataObj);
  const diasParaSegunda = dia === 7 ? -6 : 1 - dia;

  const segunda = new Date(dataObj);
  segunda.setHours(0, 0, 0, 0);
  segunda.setDate(segunda.getDate() + diasParaSegunda);
  return segunda;
}

export function obterDiasSemanaSegASab(dataHoje = new Date()) {
  const segunda = obterSegundaDaSemana(dataHoje);
  const dias = [];

  for (let i = 0; i < 6; i++) {
    const data = new Date(segunda);
    data.setDate(segunda.getDate() + i);
    dias.push({
      data: formatarDataLocal(data),
      diaSemana: i + 1,
      dataObj: data,
    });
  }

  return dias;
}

export function obterDiaDeHoje(dataHoje = new Date()) {
  return formatarDataLocal(dataHoje);
}

export function calcularConsistenciaSemana(diasSemana, historicoConcluidas, sessoesMinimas = new Set(), dataHoje = new Date()) {
  const setHistorico = new Set(historicoConcluidas);
  const hoje = obterDiaDeHoje(dataHoje);

  return diasSemana.map((dia) => {
    const data = dia.data;
    const concluido = setHistorico.has(data);
    const minima = concluido && sessoesMinimas.has(data);
    const ehHoje = data === hoje;

    return {
      ...dia,
      concluido,
      minima,
      ehHoje,
    };
  });
}

export function contarConcluidos(consistencia) {
  return consistencia.filter((d) => d.concluido).length;
}

export const NOMES_DIAS_CURTO = ['', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export const NOMES_DIAS_LONGO = [
  '',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function carregarHistoricoMinimas() {
  try {
    const valor = localStorage.getItem('treino:v2:historico');
    if (!valor) return new Set();

    const datas = JSON.parse(valor);
    if (!Array.isArray(datas)) return new Set();

    const minimas = new Set();
    datas.forEach((data) => {
      try {
        const chave = `treino:v2:sessao:${data}`;
        const sessaoStr = localStorage.getItem(chave);
        if (sessaoStr) {
          const sessao = JSON.parse(sessaoStr);
          if (sessao?.minima) minimas.add(data);
        }
      } catch {
        /* ignora erros de sessão individuais */
      }
    });
    return minimas;
  } catch {
    /* fallback silencioso para localStorage indisponível */
    return new Set();
  }
}
