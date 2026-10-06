import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  carregarSessaoDoTreino,
  concluirSessao,
  definirAquecimento,
  editarSerie,
  getDataLocal,
  reabrirSessao,
  registrarSerie,
  removerSerie,
  resetarSessao,
} from '../storage/sessao';

export function useDataLocalAtual() {
  const [dataAtual, setDataAtual] = useState(() => getDataLocal());

  useEffect(() => {
    const verificarData = () => {
      const novaData = getDataLocal();
      setDataAtual((dataAnterior) => (
        dataAnterior === novaData ? dataAnterior : novaData
      ));
    };

    const verificarAoVoltar = () => {
      if (document.visibilityState === 'visible') verificarData();
    };

    const intervalo = window.setInterval(verificarData, 30_000);
    window.addEventListener('focus', verificarData);
    document.addEventListener('visibilitychange', verificarAoVoltar);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener('focus', verificarData);
      document.removeEventListener('visibilitychange', verificarAoVoltar);
    };
  }, []);

  return dataAtual;
}

function sessaoAtingiuPrescricao(sessao, treino) {
  return treino.exercicios.every((exercicio) => {
    const entrada = sessao.exercicios.find((item) => item.exercicioId === exercicio.id);
    return (entrada?.series.length ?? 0) >= exercicio.series;
  });
}

function restaurarTreinoDaSessao(treinoBase, treinoProgramado, sessao) {
  if (!treinoBase) return null;
  if (!sessao.programa) {
    return {
      ...treinoBase,
      programa: treinoProgramado?.programa,
    };
  }

  const exerciciosPorId = new Map(
    treinoBase.exercicios.map((exercicio) => [exercicio.id, exercicio]),
  );
  const exercicios = sessao.exercicios.flatMap((entrada) => {
    const exercicioBase = exerciciosPorId.get(entrada.exercicioId);
    if (!exercicioBase) return [];

    return [{
      ...exercicioBase,
      series: entrada.prescricao?.series ?? exercicioBase.series,
      rirAlvo: entrada.prescricao?.rirAlvo ?? exercicioBase.rirAlvo,
      rirAlvoMax: entrada.prescricao?.rirAlvoMax
        ?? entrada.prescricao?.rirAlvo
        ?? exercicioBase.rirAlvo,
    }];
  });

  return {
    ...treinoProgramado,
    programa: sessao.programa,
    exercicios,
  };
}

export function useSessao(data, treinoBase, treinoProgramado = treinoBase) {
  const configuracao = useMemo(() => ({
    data,
    treinoId: treinoProgramado?.id ?? 'descanso',
    exercicios: treinoProgramado?.exercicios ?? [],
    programa: treinoProgramado?.programa,
  }), [data, treinoProgramado]);

  const [sessao, setSessao] = useState(() => carregarSessaoDoTreino(configuracao));
  const [erro, setErro] = useState(null);
  const treino = useMemo(() => (
    restaurarTreinoDaSessao(treinoBase, treinoProgramado, sessao)
  ), [sessao, treinoBase, treinoProgramado]);

  const aplicarResultado = useCallback((resultado) => {
    setSessao(resultado.sessao);
    setErro(resultado.ok ? null : resultado.erro);
    return resultado;
  }, []);

  const registrar = useCallback((exercicioId, dadosSerie) => {
    let resultado = registrarSerie(sessao, exercicioId, dadosSerie);
    let concluiuAgora = false;

    if (
      resultado.ok
      && treino
      && !resultado.sessao.concluidaEm
      && sessaoAtingiuPrescricao(resultado.sessao, treino)
    ) {
      resultado = concluirSessao(resultado.sessao);
      concluiuAgora = Boolean(resultado.sessao.concluidaEm);
    }

    aplicarResultado(resultado);
    return { ...resultado, concluiuAgora };
  }, [aplicarResultado, sessao, treino]);

  const editar = useCallback((exercicioId, serieIndex, dadosSerie) => (
    aplicarResultado(editarSerie(sessao, exercicioId, serieIndex, dadosSerie))
  ), [aplicarResultado, sessao]);

  const remover = useCallback((exercicioId, serieIndex) => (
    aplicarResultado(removerSerie(sessao, exercicioId, serieIndex))
  ), [aplicarResultado, sessao]);

  const marcarAquecimento = useCallback((feito) => (
    aplicarResultado(definirAquecimento(sessao, feito))
  ), [aplicarResultado, sessao]);

  const concluir = useCallback(() => {
    const jaEstavaConcluida = Boolean(sessao.concluidaEm);
    const resultado = aplicarResultado(concluirSessao(sessao));
    return {
      ...resultado,
      concluiuAgora: resultado.ok && !jaEstavaConcluida,
    };
  }, [aplicarResultado, sessao]);

  const reabrir = useCallback(() => (
    aplicarResultado(reabrirSessao(sessao))
  ), [aplicarResultado, sessao]);

  const resetar = useCallback(() => (
    aplicarResultado(resetarSessao({
      data,
      treinoId: treino?.id ?? 'descanso',
      exercicios: treino?.exercicios ?? [],
      programa: treino?.programa,
    }))
  ), [aplicarResultado, data, treino]);

  const progresso = useMemo(() => {
    if (!treino) {
      return { totalSeries: 0, seriesFeitas: 0, exerciciosFeitos: 0, percentual: 0 };
    }

    let totalSeries = 0;
    let seriesFeitas = 0;
    let exerciciosFeitos = 0;

    treino.exercicios.forEach((exercicio) => {
      const entrada = sessao.exercicios.find((item) => item.exercicioId === exercicio.id);
      const quantidade = entrada?.series.length ?? 0;
      totalSeries += exercicio.series;
      seriesFeitas += Math.min(quantidade, exercicio.series);
      if (quantidade >= exercicio.series) exerciciosFeitos += 1;
    });

    return {
      totalSeries,
      seriesFeitas,
      exerciciosFeitos,
      percentual: totalSeries > 0 ? Math.round((seriesFeitas / totalSeries) * 100) : 0,
    };
  }, [sessao, treino]);

  const descartarErro = useCallback(() => setErro(null), []);

  return {
    sessao,
    treino,
    erro,
    progresso,
    registrar,
    editar,
    remover,
    marcarAquecimento,
    concluir,
    reabrir,
    resetar,
    descartarErro,
  };
}
