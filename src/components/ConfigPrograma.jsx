import { useRef, useState } from 'react';

function FormularioDataInicio({ inicioInicial, erro, onConfirmar, compacto = false }) {
  const [inicio, setInicio] = useState(inicioInicial);

  const enviar = (event) => {
    event.preventDefault();
    return onConfirmar(inicio);
  };

  return (
    <form className="program-config-form" onSubmit={enviar}>
      <label className="program-config-label">
        Data de início
        <input
          className="program-config-input"
          type="date"
          value={inicio}
          onChange={(event) => setInicio(event.target.value)}
          required
        />
      </label>
      {!compacto ? (
        <p className="program-config-help">
          A semana 1 começa nesta data. Você poderá alterar depois no rodapé.
        </p>
      ) : null}
      {erro ? <p className="program-config-error" role="alert">{erro}</p> : null}
      <button type="submit" className="session-button primary">
        Confirmar data de início
      </button>
    </form>
  );
}

export function ConfigInicial({ hoje, erro, onConfirmar }) {
  return (
    <div className="bg-image program-config-screen">
      <main className="glass-card program-config-card rounded-2xl animate-fade-in">
        <p className="section-title">Programa de treino</p>
        <h1 className="program-config-title">Quando você começou?</h1>
        <p className="program-config-copy">
          Essa data define a fase, o volume e o RIR do treino de hoje.
        </p>
        <FormularioDataInicio
          inicioInicial={hoje}
          erro={erro}
          onConfirmar={onConfirmar}
        />
      </main>
    </div>
  );
}

export function EditorConfigPrograma({ inicioAtual, erro, onConfirmar }) {
  const detailsRef = useRef(null);

  const confirmarEFechar = (inicio) => {
    const resultado = onConfirmar(inicio);
    if (resultado.ok && detailsRef.current) detailsRef.current.open = false;
    return resultado;
  };

  return (
    <details ref={detailsRef} className="program-config-editor">
      <summary>Alterar data de início ({inicioAtual})</summary>
      <FormularioDataInicio
        key={inicioAtual}
        inicioInicial={inicioAtual}
        erro={erro}
        onConfirmar={confirmarEFechar}
        compacto
      />
    </details>
  );
}
