import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import {
  ConfigInicial,
} from './components/ConfigPrograma';
import TelaMais from './components/TelaMais';
import { ContainerTela } from './components/ComponentesTela';
import { useConfigPrograma } from './hooks/useConfigPrograma';
import { useDataLocalAtual, useSessao } from './hooks/useSessao';
import { aplicarFase, calcularSemanaPrograma } from './programa/fases';
import { gerarTreinoDoDia } from './data';
import {
  carregarHistorico,
  exercicioConcluido,
} from './storage/sessao';
import {
  NOMES_DIAS_CURTO,
  NOMES_DIAS_LONGO,
  calcularConsistenciaSemana,
  carregarHistoricoMinimas,
  contarConcluidos,
  obterDiasSemanaSegASab,
  getDiaSemanaLocal,
} from './utils/semana';

function criarDataLocal(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarAlvoCurto(exercicio) {
  const repeticoes = exercicio.repsMin === exercicio.repsMax
    ? exercicio.repsMin
    : `${exercicio.repsMin}–${exercicio.repsMax}`;
  return `${exercicio.series} x ${repeticoes}`;
}

function obterNomeTreinoCurto(tituloLongo) {
  if (!tituloLongo) return '';
  const match = tituloLongo.match(/(PUSH\s*[AB]|PULL\s*[AB]|LEGS\s*[AB])/i);
  return match ? match[0].toUpperCase() : tituloLongo.split('—')[0].trim();
}

function CheckboxGrande({ marcado, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={marcado}
      className="flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95"
      style={{
        width: 48,
        height: 48,
        border: marcado
          ? '2px solid #4ade80'
          : '2px solid rgba(255,255,255,0.25)',
        background: marcado
          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
          : 'rgba(255,255,255,0.03)',
        boxShadow: marcado ? '0 0 12px rgba(74, 222, 128, 0.35)' : 'none',
      }}
    >
      {marcado ? (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
          <path d="M5 12l4 4L19 7" stroke="#052e16" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

function CirculoSemana({ dia, nomeCurto, concluido, minima, ehHoje }) {
  const base = {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: 'none',
    fontSize: 14,
    fontWeight: 800,
    transition: 'all 0.2s ease',
    padding: 0,
    cursor: 'default',
  };

  let estilo;
  if (concluido && minima) {
    estilo = {
      ...base,
      background: 'linear-gradient(135deg, rgba(74,222,128,0.35) 0%, rgba(74,222,128,0.15) 100%)',
      color: '#bbf7d0',
      boxShadow: 'inset 0 0 0 2px rgba(74,222,128,0.55)',
    };
  } else if (concluido) {
    estilo = {
      ...base,
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: '#052e16',
      boxShadow: '0 0 14px rgba(74, 222, 128, 0.35)',
    };
  } else if (ehHoje) {
    estilo = {
      ...base,
      background: 'rgba(255,255,255,0.04)',
      color: '#fbbf24',
      boxShadow: 'inset 0 0 0 2.5px #fbbf24, 0 0 14px rgba(251, 191, 36, 0.2)',
    };
  } else {
    estilo = {
      ...base,
      background: 'rgba(255,255,255,0.04)',
      color: 'rgba(255,255,255,0.35)',
      boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.12)',
    };
  }

  return (
    <button type="button" style={estilo} aria-label={`${nomeCurto}: ${concluido ? 'concluído' : 'não concluído'}`}>
      <span style={{ fontSize: 11, lineHeight: 1, marginBottom: 2, opacity: 0.85, letterSpacing: 0.5 }}>
        {nomeCurto}
      </span>
      <span style={{ fontSize: 13, lineHeight: 1, fontWeight: 900 }}>
        {dia}
      </span>
    </button>
  );
}

function CartaoExercicio({
  exercicio,
  entrada,
  aquecimento,
  controle,
  sessaoConcluida,
  onConcluida,
  onStatus,
}) {
  const [expandido, setExpandido] = useState(false);
  const nome = aquecimento ? 'Aquecimento 5 min' : exercicio.nome;
  const alvo = aquecimento
    ? 'Movimento + mobilidade + séries leves'
    : formatarAlvoCurto(exercicio);

  const concluido = aquecimento
    ? Boolean(controle.sessao.aquecimentoFeito)
    : exercicioConcluido(entrada, exercicio);

  const marcar = (proximoValor) => {
    if (sessaoConcluida) return;
    if (aquecimento) {
      const resultado = controle.marcarAquecimento(proximoValor);
      if (resultado.ok) onStatus(proximoValor ? 'Aquecimento marcado.' : 'Aquecimento desmarcado.');
    } else {
      const resultado = controle.marcarManual(exercicio.id, proximoValor);
      if (resultado?.concluiuAgora) onConcluida();
    }
  };

  const toggleCard = (evento) => {
    if (evento.target.closest('[data-checkbox]')) return;
    setExpandido((anterior) => !anterior);
  };

  const estiloCartao = {
    minHeight: 72,
    padding: '14px 16px',
    borderRadius: 16,
    border: concluido
      ? '1px solid rgba(74, 222, 128, 0.28)'
      : '1px solid rgba(255,255,255,0.08)',
    background: concluido
      ? 'rgba(22, 163, 74, 0.10)'
      : 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ marginTop: 0 }}>
      <div role="button" tabIndex={0} style={estiloCartao} onClick={toggleCard} onKeyDown={(e) => e.key === 'Enter' && toggleCard(e)}>
        <div data-checkbox onClick={(e) => e.stopPropagation()}>
          <CheckboxGrande
            marcado={concluido}
            onClick={() => marcar(!concluido)}
            ariaLabel={concluido ? `Desmarcar ${nome}` : `Marcar ${nome} como concluído`}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.3,
              color: concluido ? 'rgba(255,255,255,0.55)' : '#f1f5f9',
              textDecoration: concluido ? 'line-through' : 'none',
              textDecorationThickness: concluido ? '1.5px' : 0,
              textDecorationColor: 'rgba(255,255,255,0.25)',
            }}
          >
            {nome}
          </div>
          <div style={{ fontSize: 16, marginTop: 4, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
            {alvo}
          </div>
        </div>
        <div style={{ flexShrink: 0, color: expandido ? '#fbbf24' : 'rgba(255,255,255,0.3)', fontSize: 20, fontWeight: 700, transition: 'transform 0.2s', transform: expandido ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          +
        </div>
      </div>

      {expandido && !aquecimento ? (
        <div style={{
          marginTop: 10,
          padding: 16,
          borderRadius: 16,
          background: 'rgba(6, 10, 24, 0.75)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <DetalheSeriesExercicio
            exercicio={exercicio}
            entrada={entrada}
            controle={controle}
            sessaoConcluida={sessaoConcluida}
            onConcluida={onConcluida}
            onStatus={onStatus}
          />
        </div>
      ) : null}

      {expandido && aquecimento ? (
        <div style={{
          marginTop: 10,
          padding: 16,
          borderRadius: 16,
          background: 'rgba(30, 58, 138, 0.18)',
          border: '1px solid rgba(96, 165, 250, 0.18)',
          color: 'rgba(255,255,255,0.72)',
          fontSize: 15,
          lineHeight: 1.6,
        }}>
          <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'grid', gap: 8 }}>
            <li>3 min de movimento geral: caminhada ou bicicleta leve.</li>
            <li>Mobilidade do grupo muscular do dia.</li>
            <li>1–2 séries leves do primeiro exercício (~50% carga).</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function DetalheSeriesExercicio({ exercicio, entrada, controle, sessaoConcluida, onConcluida, onStatus }) {
  const series = entrada?.series ?? [];
  const [valores, setValores] = useState(() => {
    const anterior = series.at(-1);
    return {
      kg: anterior?.kg ?? 0,
      reps: anterior?.reps ?? exercicio.repsMin,
      rir: anterior?.rir ?? exercicio.rirAlvo,
      nota: '',
    };
  });

  const registrar = () => {
    const resultado = controle.registrar(exercicio.id, valores);
    if (resultado.ok) {
      setValores((atual) => ({ ...atual, nota: '' }));
      onStatus(`Série ${series.length + 1} registrada.`);
      if (resultado.concluiuAgora) onConcluida();
    }
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {series.length > 0 ? (
        <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {series.map((serie, idx) => (
            <li key={serie.feitaEm} style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 15,
              color: '#f1f5f9',
              flexWrap: 'wrap',
            }}>
              <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 13 }}>S{idx + 1}</span>
              <strong>{Number(serie.kg).toFixed(serie.kg % 1 === 0 ? 0 : 1)} kg</strong>
              <span>{serie.reps} reps</span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>RIR {serie.rir ?? '—'}</span>
              <button
                type="button"
                onClick={() => controle.remover(exercicio.id, idx)}
                disabled={sessaoConcluida}
                style={{
                  marginLeft: 'auto',
                  fontSize: 13,
                  color: '#fca5a5',
                  background: 'transparent',
                  border: 'none',
                  cursor: sessaoConcluida ? 'not-allowed' : 'pointer',
                  minHeight: 36,
                  padding: '6px 10px',
                  borderRadius: 8,
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontWeight: 600 }}>Carga (kg)</div>
          <input
            type="number"
            min={0}
            step={2.5}
            value={valores.kg}
            onChange={(e) => setValores({ ...valores, kg: e.target.value === '' ? '' : Number(e.target.value) })}
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: 10,
              background: 'rgba(6, 10, 24, 0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
              fontSize: 17,
              textAlign: 'center',
              padding: '0 8px',
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontWeight: 600 }}>Reps</div>
          <input
            type="number"
            min={1}
            step={1}
            value={valores.reps}
            onChange={(e) => setValores({ ...valores, reps: e.target.value === '' ? '' : Number(e.target.value) })}
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: 10,
              background: 'rgba(6, 10, 24, 0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
              fontSize: 17,
              textAlign: 'center',
              padding: '0 8px',
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontWeight: 600 }}>RIR</div>
          <input
            type="number"
            min={0}
            step={1}
            value={valores.rir}
            onChange={(e) => setValores({ ...valores, rir: e.target.value === '' ? null : Number(e.target.value) })}
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: 10,
              background: 'rgba(6, 10, 24, 0.85)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f1f5f9',
              fontSize: 17,
              textAlign: 'center',
              padding: '0 8px',
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={registrar}
        disabled={sessaoConcluida}
        style={{
          minHeight: 48,
          borderRadius: 12,
          background: sessaoConcluida
            ? 'rgba(255,255,255,0.06)'
            : 'linear-gradient(90deg, #eab308, #d97706)',
          color: sessaoConcluida ? 'rgba(255,255,255,0.4)' : '#080c1e',
          border: 'none',
          fontSize: 16,
          fontWeight: 800,
          cursor: sessaoConcluida ? 'not-allowed' : 'pointer',
        }}
      >
        {series.length >= exercicio.series ? 'Registrar série extra' : `Registrar série ${series.length + 1}`}
      </button>
    </div>
  );
}

function DialogoSimples({ aberto, titulo, mensagem, onCancelar, onConfirmar, textoConfirmar = 'Confirmar', perigo }) {
  if (!aberto) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: '#0e1428',
        borderRadius: 18,
        padding: 24,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: 20, fontWeight: 800 }}>{titulo}</h3>
        <p style={{ margin: '12px 0 22px', color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.5 }}>
          {mensagem}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            onClick={onCancelar}
            style={{
              minHeight: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            style={{
              minHeight: 48,
              borderRadius: 12,
              background: perigo ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #eab308, #d97706)',
              color: perigo ? '#fff' : '#080c1e',
              border: 'none',
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

function BannerConfirmacao({ mensagem }) {
  if (!mensagem) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        background: 'rgba(22, 163, 74, 0.95)',
        color: '#f0fdf4',
        padding: '14px 22px',
        borderRadius: 14,
        fontSize: 18,
        fontWeight: 800,
        boxShadow: '0 8px 28px rgba(22, 163, 74, 0.35)',
        border: '1px solid rgba(134, 239, 172, 0.35)',
        maxWidth: 'calc(100% - 32px)',
        textAlign: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      {mensagem}
    </div>
  );
}

function AppDoDia({ dataAtual, configPrograma, erroConfig, onConfirmarInicio }) {
  const diaSemanaNum = getDiaSemanaLocal(dataAtual);
  const isDomingo = diaSemanaNum === 7;
  const treinoBase = useMemo(
    () => (isDomingo ? null : gerarTreinoDoDia(diaSemanaNum)),
    [diaSemanaNum, isDomingo],
  );
  const semanaPrograma = useMemo(
    () => calcularSemanaPrograma(configPrograma.inicio, dataAtual),
    [configPrograma.inicio, dataAtual],
  );
  const treinoProgramado = useMemo(
    () => (treinoBase ? aplicarFase(treinoBase, semanaPrograma) : null),
    [semanaPrograma, treinoBase],
  );
  const controle = useSessao(dataAtual, treinoBase, treinoProgramado);
  const treino = controle.treino;
  const sessaoConcluida = Boolean(controle.sessao.concluidaEm);
  const entradas = useMemo(() => new Map(
    controle.sessao.exercicios.map((e) => [e.exercicioId, e]),
  ), [controle.sessao.exercicios]);

  const [mostrarMais, setMostrarMais] = useState(false);
  const [confirmarMinima, setConfirmarMinima] = useState(false);
  const [banner, setBanner] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(''), 2800);
    return () => clearTimeout(t);
  }, [banner]);

  const dadosSemana = useMemo(() => {
    const dataReferencia = criarDataLocal(dataAtual);
    const dias = obterDiasSemanaSegASab(dataReferencia);
    const historico = carregarHistorico();
    const minimas = carregarHistoricoMinimas();
    const consistencia = calcularConsistenciaSemana(dias, historico, minimas, dataReferencia);
    return {
      consistencia,
      concluidos: contarConcluidos(consistencia),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataAtual, sessaoConcluida, controle.sessao]);

  const nomeTreinoCurto = treino ? obterNomeTreinoCurto(treino.titulo) : '';
  const isDeload = treino?.programa?.deload;

  const linha2 = useMemo(() => {
    const nomeDia = isDomingo ? 'Domingo' : NOMES_DIAS_LONGO[diaSemanaNum];
    if (isDeload) {
      return `${nomeDia} · Semana leve`;
    }
    return `${nomeDia} · Semana ${semanaPrograma}`;
  }, [diaSemanaNum, isDeload, isDomingo, semanaPrograma]);

  const todosExerciciosConcluidos = useMemo(() => {
    if (!treino) return false;
    return treino.exercicios.every((ex) => {
      const entrada = entradas.get(ex.id);
      return exercicioConcluido(entrada, ex);
    });
  }, [entradas, treino]);

  const [confirmarReabrir, setConfirmarReabrir] = useState(false);

  const aoConcluir = () => {
    const resultado = controle.concluir();
    if (resultado.ok) {
      if (resultado.concluiuAgora) {
        setBanner('Treino feito. Dia vencido.');
      } else {
        setBanner('Treino salvo. Dia vencido.');
      }
    }
  };

  const confirmarReabtreino = () => {
    const resultado = controle.reabrir();
    setConfirmarReabrir(false);
    if (resultado.ok) {
      setStatusMsg('Treino reaberto. Você pode ajustar as marcações.');
    }
  };

  const confirmarVersaoMinima = () => {
    const resultado = controle.concluirMinima();
    setConfirmarMinima(false);
    if (resultado.ok) {
      setBanner('Versão mínima registrada. Dia vencido.');
    }
  };

  if (mostrarMais) {
    return (
      <TelaMais
        dataAtual={dataAtual}
        configPrograma={configPrograma}
        erroConfig={erroConfig}
        onConfirmarInicio={onConfirmarInicio}
        onVoltar={() => setMostrarMais(false)}
      />
    );
  }

  return (
    <>
      <BannerConfirmacao mensagem={banner} />
      <DialogoSimples
        aberto={confirmarMinima}
        titulo="Dia ruim: versão mínima"
        mensagem="Marcar como concluído mesmo sem os exercícios? Vai contar como dia feito, mas com marcação especial."
        textoConfirmar="Registrar mínimo"
        perigo
        onCancelar={() => setConfirmarMinima(false)}
        onConfirmar={confirmarVersaoMinima}
      />
      <DialogoSimples
        aberto={confirmarReabrir}
        titulo="Reabrir treino concluído?"
        mensagem="As marcações já salvas serão mantidas, mas você poderá ajustar exercícios individuais e concluir de novo. A data do histórico permanece a mesma."
        textoConfirmar="Reabrir"
        onCancelar={() => setConfirmarReabrir(false)}
        onConfirmar={confirmarReabtreino}
      />

      <ContainerTela paddingAbaixo={200}>
        <header style={{ textAlign: 'center' }}>
          <h1
            style={{
              margin: 0,
              fontSize: isDomingo ? 36 : 40,
              fontWeight: 900,
              letterSpacing: 0.5,
              color: '#f8fafc',
              lineHeight: 1.1,
            }}
          >
            {isDomingo ? 'DESCANSO' : nomeTreinoCurto}
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 16,
              fontWeight: 600,
              color: isDeload ? '#86efac' : 'rgba(255,255,255,0.55)',
            }}
          >
            {linha2}
          </p>
        </header>

        <section aria-label="Consistência da semana">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 6,
              marginBottom: 14,
            }}
          >
            {dadosSemana.consistencia.map((dia) => (
              <CirculoSemana
                key={dia.data}
                dia={dia.dataObj.getDate()}
                nomeCurto={NOMES_DIAS_CURTO[dia.diaSemana]}
                concluido={dia.concluido}
                minima={dia.minima}
                ehHoje={dia.ehHoje}
              />
            ))}
          </div>
          <p
            style={{
              margin: 0,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: '#fbbf24',
            }}
          >
            {dadosSemana.concluidos} de 6 esta semana
          </p>
        </section>

        {!isDomingo && treino ? (
          <section
            aria-label="Exercícios de hoje"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <CartaoExercicio
              aquecimento
              exercicio={{ id: '__aquecimento__', nome: 'Aquecimento 5 min' }}
              entrada={null}
              controle={controle}
              sessaoConcluida={sessaoConcluida}
              onConcluida={() => setBanner('Treino feito. Dia vencido.')}
              onStatus={setStatusMsg}
            />

            {treino.exercicios.map((exercicio) => (
              <CartaoExercicio
                key={exercicio.id}
                exercicio={exercicio}
                entrada={entradas.get(exercicio.id)}
                controle={controle}
                sessaoConcluida={sessaoConcluida}
                onConcluida={() => setBanner('Treino feito. Dia vencido.')}
                onStatus={setStatusMsg}
              />
            ))}
          </section>
        ) : null}

        {isDomingo ? (
          <div
            style={{
              padding: 32,
              borderRadius: 18,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 10 }} aria-hidden="true">🕊️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc' }}>Dia de descanso</div>
            <div style={{ marginTop: 8, fontSize: 16, color: 'rgba(255,255,255,0.55)' }}>
              Recupere corpo e mente. Amanhã voltamos.
            </div>
          </div>
        ) : null}

        <footer style={{ marginTop: 6, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setMostrarMais(true)}
            style={{
              minHeight: 44,
              padding: '8px 18px',
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.38)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(255,255,255,0.18)',
            }}
          >
            Mais
          </button>
        </footer>

      {!isDomingo ? (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            background: 'linear-gradient(to top, #0a0d1a 65%, rgba(10, 13, 26, 0.92) 85%, rgba(10, 13, 26, 0) 100%)',
            padding: '18px 16px 22px',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '100%', maxWidth: 480, display: 'grid', gap: 10, pointerEvents: 'auto' }}>
            <button
              type="button"
              onClick={aoConcluir}
              style={{
                minHeight: 60,
                borderRadius: 16,
                border: 'none',
                padding: '0 20px',
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: 0.3,
                cursor: 'pointer',
                color: todosExerciciosConcluidos || sessaoConcluida ? '#052e16' : '#080c1e',
                background: todosExerciciosConcluidos
                  ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                  : sessaoConcluida
                    ? 'linear-gradient(90deg, rgba(74,222,128,0.75) 0%, rgba(22,163,74,0.75) 100%)'
                    : 'linear-gradient(90deg, #eab308, #d97706)',
                boxShadow: todosExerciciosConcluidos
                  ? '0 8px 28px rgba(22, 163, 74, 0.45)'
                  : sessaoConcluida
                    ? '0 6px 22px rgba(22, 163, 74, 0.25)'
                    : '0 8px 28px rgba(234, 179, 8, 0.32)',
                transition: 'all 0.2s ease',
              }}
            >
              {sessaoConcluida ? '✓ Treino concluído' : 'Concluir treino'}
            </button>
            {sessaoConcluida ? (
              <button
                type="button"
                onClick={() => setConfirmarReabrir(true)}
                style={{
                  minHeight: 44,
                  borderRadius: 12,
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.50)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(255,255,255,0.20)',
                }}
              >
                Reabrir treino
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarMinima(true)}
                style={{
                  minHeight: 44,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Dia ruim: versão mínima
              </button>
            )}
          </div>
        </div>
      ) : null}

      {statusMsg ? (
        <div className="sr-only" aria-live="polite" aria-atomic="true">{statusMsg}</div>
      ) : null}
      </ContainerTela>
    </>
  );
}

export default function App() {
  const dataAtual = useDataLocalAtual();
  const configPrograma = useConfigPrograma();

  if (!configPrograma.config) {
    return (
      <ConfigInicial
        hoje={dataAtual}
        erro={configPrograma.erro}
        onConfirmar={configPrograma.confirmarInicio}
      />
    );
  }

  return (
    <AppDoDia
      key={dataAtual}
      dataAtual={dataAtual}
      configPrograma={configPrograma.config}
      erroConfig={configPrograma.erro}
      onConfirmarInicio={configPrograma.confirmarInicio}
    />
  );
}
