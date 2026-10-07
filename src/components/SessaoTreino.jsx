import { useEffect, useId, useRef, useState } from 'react';

function formatarAlvo(exercicio) {
  const repeticoes = exercicio.repsMin === exercicio.repsMax
    ? exercicio.repsMin
    : `${exercicio.repsMin}–${exercicio.repsMax}`;
  const unidade = exercicio.unidade === 'segundos' ? 's' : exercicio.unidade === 'minutos' ? 'min' : '';
  const alvo = unidade ? `${repeticoes}${unidade}` : `${repeticoes}`;
  const rirMaximo = exercicio.rirAlvoMax ?? exercicio.rirAlvo;
  const rir = rirMaximo > exercicio.rirAlvo
    ? `${exercicio.rirAlvo}–${rirMaximo}`
    : exercicio.rirAlvo;
  return `${exercicio.series} x ${alvo} · RIR ${rir}`;
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function ControleNumero({ label, valor, onChange, passo, minimo, inputMode = 'numeric' }) {
  const id = useId();

  const ajustar = (direcao) => {
    const base = valor === '' || valor === null ? minimo : Number(valor);
    const proximo = Math.max(minimo, base + (passo * direcao));
    onChange(Math.round(proximo * 10) / 10);
  };

  return (
    <div className="session-stepper">
      <label htmlFor={id}>{label}</label>
      <button type="button" onClick={() => ajustar(-1)} aria-label={`Diminuir ${label}`}>
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode={inputMode}
        min={minimo}
        step={passo}
        value={valor ?? ''}
        onChange={(event) => {
          const novoValor = event.target.value;
          onChange(novoValor === '' ? '' : Number(novoValor));
        }}
      />
      <button type="button" onClick={() => ajustar(1)} aria-label={`Aumentar ${label}`}>
        +
      </button>
    </div>
  );
}

function CamposSerie({ valores, onChange }) {
  const alterar = (campo) => (valor) => onChange({ ...valores, [campo]: valor });

  return (
    <div className="session-stepper-list">
      <ControleNumero
        label="Carga (kg)"
        valor={valores.kg}
        onChange={alterar('kg')}
        passo={2.5}
        minimo={0}
        inputMode="decimal"
      />
      <ControleNumero
        label="Repetições"
        valor={valores.reps}
        onChange={alterar('reps')}
        passo={1}
        minimo={1}
      />
      <ControleNumero
        label="RIR"
        valor={valores.rir}
        onChange={alterar('rir')}
        passo={1}
        minimo={0}
      />
    </div>
  );
}

function NotaSerie({ nota, onChange, aberta = false }) {
  const id = useId();

  return (
    <details className="session-note" open={aberta || undefined}>
      <summary className="session-note-summary">Adicionar nota opcional</summary>
      <label className="sr-only" htmlFor={id}>Nota da série</label>
      <textarea
        id={id}
        className="session-note-input"
        value={nota}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Técnica, desconforto ou ajuste da série"
      />
    </details>
  );
}

function FormularioNovaSerie({ exercicio, series, disabled, destaque, onRegistrar, onStatus }) {
  const anterior = series.at(-1);
  const [valores, setValores] = useState(() => ({
    kg: anterior?.kg ?? 0,
    reps: anterior?.reps ?? exercicio.repsMin,
    rir: anterior?.rir ?? exercicio.rirAlvo,
    nota: '',
  }));

  const numeroSerie = series.length + 1;
  const ehExtra = numeroSerie > exercicio.series;

  const enviar = (event) => {
    event.preventDefault();
    const resultado = onRegistrar(valores);
    if (resultado.ok) {
      setValores((atuais) => ({ ...atuais, nota: '' }));
      onStatus(ehExtra ? 'Série extra registrada.' : `Série ${numeroSerie} registrada.`);
    }
  };

  return (
    <details className="session-disclosure" open={destaque || undefined}>
      <summary className="session-summary">
        <span>{ehExtra ? 'Adicionar série extra' : `Adicionar série ${numeroSerie}`}</span>
        <span aria-hidden="true">＋</span>
      </summary>
      <form className="session-form" onSubmit={enviar}>
        <CamposSerie valores={valores} onChange={setValores} />
        <NotaSerie
          nota={valores.nota}
          onChange={(nota) => setValores((atuais) => ({ ...atuais, nota }))}
        />
        <div className="session-form-actions">
          <button type="submit" className="session-button primary" disabled={disabled}>
            {ehExtra ? 'Registrar série extra' : 'Registrar série'}
          </button>
        </div>
      </form>
    </details>
  );
}

function SerieRegistrada({ serie, index, disabled, onEditar, onRemover, onStatus }) {
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState(() => ({ ...serie }));

  const iniciarEdicao = () => {
    setValores({ ...serie });
    setEditando(true);
  };

  const salvarEdicao = () => {
    const resultado = onEditar(index, valores);
    if (resultado.ok) {
      setEditando(false);
      onStatus(`Série ${index + 1} atualizada.`);
    }
  };

  const remover = () => {
    const resultado = onRemover(index);
    if (resultado.ok) onStatus(`Série ${index + 1} removida.`);
  };

  if (editando) {
    return (
      <li className="session-series-row">
        <div className="session-series-number">Editar série {index + 1}</div>
        <div className="session-form">
          <CamposSerie valores={valores} onChange={setValores} />
          <NotaSerie
            nota={valores.nota}
            aberta={Boolean(valores.nota)}
            onChange={(nota) => setValores((atuais) => ({ ...atuais, nota }))}
          />
          <div className="session-form-actions">
            <button type="button" className="session-button primary" onClick={salvarEdicao}>
              Salvar série
            </button>
            <button type="button" className="session-button" onClick={() => setEditando(false)}>
              Cancelar edição
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="session-series-row">
      <div className="session-series-summary">
        <div className="session-series-values">
          <span className="session-series-number">Série {index + 1}</span>
          <strong>{formatarNumero(serie.kg)} kg</strong>
          <span>{formatarNumero(serie.reps)} reps</span>
          <span>RIR {serie.rir ?? '—'}</span>
        </div>
        <div className="session-series-actions">
          <button type="button" className="session-button" onClick={iniciarEdicao} disabled={disabled} aria-label={`Editar série ${index + 1}`}>
            Editar
          </button>
          <button type="button" className="session-button danger" onClick={remover} disabled={disabled} aria-label={`Remover série ${index + 1}`}>
            Remover
          </button>
        </div>
      </div>
      {serie.nota ? <p className="session-series-note">{serie.nota}</p> : null}
    </li>
  );
}

function ExercicioSessao({
  exercicio,
  entrada,
  numero,
  destaque,
  sessaoConcluida,
  onRegistrar,
  onEditar,
  onRemover,
  onConcluida,
  onStatus,
}) {
  const series = entrada?.series ?? [];
  const concluido = series.length >= exercicio.series;

  const registrar = (dadosSerie) => {
    const resultado = onRegistrar(exercicio.id, dadosSerie);
    if (resultado.concluiuAgora) onConcluida();
    return resultado;
  };

  return (
    <li className={`session-exercise ${concluido ? 'is-complete' : ''}`}>
      <div className="session-heading-row">
        <span className="session-marker" aria-hidden="true">{concluido ? '✓' : numero}</span>
        <div className="session-heading-copy">
          <h3 className="session-exercise-title">{exercicio.nome}</h3>
          <p className="session-target">{formatarAlvo(exercicio)}</p>
          {concluido ? <span className="session-complete-label">Exercício concluído</span> : null}
        </div>
      </div>

      {series.length > 0 ? (
        <ol className="session-series-list" aria-label={`Séries de ${exercicio.nome}`}>
          {series.map((serie, index) => (
            <SerieRegistrada
              key={serie.feitaEm}
              serie={serie}
              index={index}
              disabled={sessaoConcluida}
              onEditar={(serieIndex, dados) => onEditar(exercicio.id, serieIndex, dados)}
              onRemover={(serieIndex) => onRemover(exercicio.id, serieIndex)}
              onStatus={onStatus}
            />
          ))}
        </ol>
      ) : null}

      <FormularioNovaSerie
        exercicio={exercicio}
        series={series}
        disabled={sessaoConcluida}
        destaque={destaque}
        onRegistrar={registrar}
        onStatus={onStatus}
      />
    </li>
  );
}

const MOBILIDADE_POR_TREINO = {
  push: 'Mobilidade de ombros e escápulas.',
  pull: 'Mobilidade de ombros e coluna torácica.',
  legs: 'Mobilidade de quadril e tornozelo.',
};

function AquecimentoTreino({ treino, feito, disabled, onMarcar, onStatus }) {
  const [oculto, setOculto] = useState(false);
  const tipo = Object.keys(MOBILIDADE_POR_TREINO).find((item) => treino.id.startsWith(item));
  const mobilidade = MOBILIDADE_POR_TREINO[tipo] ?? 'Mobilidade do grupo muscular do dia.';

  const marcar = (proximoValor) => {
    const resultado = onMarcar(proximoValor);
    if (resultado.ok) {
      setOculto(false);
      onStatus(proximoValor ? 'Aquecimento marcado como feito.' : 'Aquecimento desmarcado.');
    }
  };

  if (oculto && !feito) {
    return (
      <section className="session-warmup session-warmup-collapsed" aria-label="Aquecimento pulado">
        <p>Aquecimento pulado por agora.</p>
        <button type="button" className="session-button" onClick={() => setOculto(false)}>
          Mostrar
        </button>
      </section>
    );
  }

  return (
    <section className={`session-warmup ${feito ? 'is-complete' : ''}`} aria-labelledby="aquecimento-title">
      <div className="session-warmup-header">
        <h3 id="aquecimento-title" className="session-warmup-title">Aquecimento (5 min)</h3>
        {feito ? <span className="session-warmup-state">Feito</span> : null}
      </div>
      <ul className="session-warmup-list">
        <li>
          <span className="session-warmup-marker" aria-hidden="true">{feito ? '✓' : '○'}</span>
          <span>3 min de movimento geral: caminhada ou bicicleta leve.</span>
        </li>
        <li>
          <span className="session-warmup-marker" aria-hidden="true">{feito ? '✓' : '○'}</span>
          <span>{mobilidade}</span>
        </li>
        <li>
          <span className="session-warmup-marker" aria-hidden="true">{feito ? '✓' : '○'}</span>
          <span>1–2 séries leves do primeiro exercício (carga ~50%, sem registrar como série).</span>
        </li>
      </ul>
      {feito ? (
        <button
          type="button"
          className="session-button"
          onClick={() => marcar(false)}
          disabled={disabled}
        >
          Desmarcar aquecimento
        </button>
      ) : (
        <div className="session-warmup-actions">
          <button
            type="button"
            className="session-button primary"
            onClick={() => marcar(true)}
            disabled={disabled}
          >
            Marcar como feito
          </button>
          <button
            type="button"
            className="session-button"
            onClick={() => setOculto(true)}
            disabled={disabled}
          >
            Pular agora
          </button>
        </div>
      )}
    </section>
  );
}

function DialogoReset({ aberto, onFechar, onConfirmar }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;

    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      className="session-reset-dialog"
      aria-labelledby="reset-title"
      onClose={onFechar}
      onCancel={onFechar}
    >
      <h3 id="reset-title">Resetar o treino de hoje?</h3>
      <p>As séries registradas hoje serão removidas. A dieta não será alterada.</p>
      <div className="session-form-actions">
        <button type="button" className="session-button" onClick={onFechar} autoFocus>
          Manter treino
        </button>
        <button type="button" className="session-button danger" onClick={onConfirmar}>
          Resetar treino
        </button>
      </div>
    </dialog>
  );
}

export default function SessaoTreino({ treino, controle, onConcluida }) {
  const [status, setStatus] = useState('');
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const { sessao, progresso, erro } = controle;
  const programa = treino.programa;
  const sessaoConcluida = Boolean(sessao.concluidaEm);
  const entradas = new Map(
    sessao.exercicios.map((entrada) => [entrada.exercicioId, entrada]),
  );
  const primeiroPendente = treino.exercicios.find((exercicio) => (
    (entradas.get(exercicio.id)?.series.length ?? 0) < exercicio.series
  ));

  const concluir = () => {
    const resultado = controle.concluir();
    if (resultado.ok) {
      setStatus(resultado.concluiuAgora ? 'Treino concluído.' : 'O treino já estava concluído.');
      if (resultado.concluiuAgora) onConcluida();
    }
  };

  const reabrir = () => {
    const resultado = controle.reabrir();
    if (resultado.ok) setStatus('Treino reaberto para edição.');
  };

  const resetar = () => {
    const resultado = controle.resetar();
    setConfirmandoReset(false);
    if (resultado.ok) {
      setStatus('Treino de hoje resetado.');
    }
  };

  return (
    <section className="glass-card rounded-2xl p-5 animate-fade-in" aria-labelledby="sessao-title">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="sessao-title" className="text-base font-bold text-white leading-tight">{treino.titulo}</h2>
          {programa ? (
            <p className="session-program-line">
              Semana {programa.semana} · Fase {programa.fase} ({programa.faseNome})
            </p>
          ) : null}
          {programa?.deload ? (
            <span className="session-deload-label">Semana de deload</span>
          ) : null}
          <p className="text-xs text-white/60 mt-1">
            {progresso.seriesFeitas}/{progresso.totalSeries} séries prescritas
          </p>
        </div>
        <span className="text-xs text-white/60 font-mono">
          {progresso.exerciciosFeitos}/{treino.exercicios.length}
        </span>
      </div>

      {programa?.semana <= 8 ? (
        <p className="session-safety-note">
          Dor aguda ou que pega na articulação: troque o exercício ou reduza a carga. Dor muscular é normal.
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">{status}</p>

      {erro ? (
        <div className="session-save-alert" role="alert">
          <span>{erro === 'Não foi possível salvar.' ? 'Não foi possível salvar. Tente novamente.' : erro}</span>
          <button type="button" className="session-button" onClick={controle.descartarErro}>
            Fechar aviso
          </button>
        </div>
      ) : null}

      {sessaoConcluida ? (
        <div className="session-completed-banner">✓ Treino concluído e salvo neste aparelho</div>
      ) : null}

      <AquecimentoTreino
        treino={treino}
        feito={Boolean(sessao.aquecimentoFeito)}
        disabled={sessaoConcluida}
        onMarcar={controle.marcarAquecimento}
        onStatus={setStatus}
      />

      <ol className="session-stack">
        {treino.exercicios.map((exercicio, index) => (
          <ExercicioSessao
            key={exercicio.id}
            exercicio={exercicio}
            entrada={entradas.get(exercicio.id)}
            numero={index + 1}
            destaque={primeiroPendente?.id === exercicio.id}
            sessaoConcluida={sessaoConcluida}
            onRegistrar={controle.registrar}
            onEditar={controle.editar}
            onRemover={controle.remover}
            onConcluida={onConcluida}
            onStatus={setStatus}
          />
        ))}
      </ol>

      <div className="mt-4" role="progressbar" aria-label="Progresso das séries" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progresso.percentual}>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 ease-out" style={{ width: `${progresso.percentual}%` }} />
        </div>
      </div>

      <div className="session-footer-actions mt-4">
        <button type="button" className="session-button primary" onClick={concluir}>
          {sessaoConcluida ? '✓ Concluir treino' : 'Concluir treino'}
        </button>
        {sessaoConcluida ? (
          <button type="button" className="session-button" onClick={reabrir}>
            Reabrir treino
          </button>
        ) : (
          <button type="button" className="session-button danger" onClick={() => setConfirmandoReset(true)}>
            Resetar treino
          </button>
        )}
      </div>

      {sessaoConcluida ? (
        <button type="button" className="session-button danger w-full mt-2" onClick={() => setConfirmandoReset(true)}>
          Resetar treino
        </button>
      ) : null}

      <DialogoReset
        aberto={confirmandoReset}
        onFechar={() => setConfirmandoReset(false)}
        onConfirmar={resetar}
      />
    </section>
  );
}
