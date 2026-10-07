import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EditorConfigPrograma,
} from './ConfigPrograma';
import {
  CartaoTela,
  ContainerTela,
  TOKENS_LAYOUT,
} from './ComponentesTela';
import {
  gerarPlanoAlimentarDoDia,
  getDiaHebraico,
  getPalavraAleatoria,
  getPalavraDoDia,
} from '../data';
import {
  calcularSemanaPrograma,
  getFasePrograma,
} from '../programa/fases';

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function CheckboxDieta({ marcado, onClick, ariaLabel }) {
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

export default function TelaMais({ dataAtual, configPrograma, erroConfig, onConfirmarInicio, onVoltar }) {
  const diaHebraico = useMemo(() => getDiaHebraico(), []);
  const planoAlimentar = useMemo(() => gerarPlanoAlimentarDoDia(), []);
  const [dieta, setDieta] = useState(() => loadJSON(`dieta-${dataAtual}`, {}));
  const [palavra, setPalavra] = useState(() => getPalavraDoDia());

  useEffect(() => {
    saveJSON(`dieta-${dataAtual}`, dieta);
  }, [dataAtual, dieta]);

  const infoFase = useMemo(() => {
    const semana = calcularSemanaPrograma(configPrograma.inicio, dataAtual);
    return getFasePrograma(semana);
  }, [configPrograma.inicio, dataAtual]);

  const linhaFase = useMemo(() => {
    if (infoFase.deload) {
      return 'Semana leve';
    }
    return `Semana ${infoFase.semana} · Fase ${infoFase.fase} (${infoFase.faseNome})`;
  }, [infoFase]);

  const toggleDieta = useCallback((id) => {
    setDieta((anterior) => ({ ...anterior, [id]: !anterior[id] }));
  }, []);

  const novaPalavra = useCallback(() => {
    setPalavra((anterior) => getPalavraAleatoria(anterior?.idx));
  }, []);

  const feitosDieta = planoAlimentar.filter((refeicao) => dieta[refeicao.id]).length;
  const pctDieta = Math.round((feitosDieta / planoAlimentar.length) * 100);

  return (
    <>
      <ContainerTela paddingAbaixo={64}>
        <header style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <button
              type="button"
              onClick={onVoltar}
              style={{
                minHeight: 48,
                minWidth: 88,
                padding: '0 14px',
                fontSize: 15,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.72)',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >
              ← Voltar
            </button>
            <div style={{ width: 88 }} />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: 0.3,
              color: '#f8fafc',
              lineHeight: 1.1,
            }}
          >
            Mais
          </h1>
          <p
            style={{
              margin: '10px 0 0',
              fontSize: 16,
              fontWeight: 600,
              color: infoFase.deload ? '#86efac' : 'rgba(255,255,255,0.55)',
            }}
          >
            {linhaFase}
          </p>
        </header>

        <CartaoTela>
          <div style={{ marginBottom: 14 }}>
            <h2
              id="alimentacao-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                lineHeight: 1.3,
              }}
            >
              🍽️ Plano alimentar
            </h2>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {planoAlimentar.map((refeicao) => {
              const feito = Boolean(dieta[refeicao.id]);
              return (
                <li key={refeicao.id}>
                  <div
                    style={{
                      minHeight: 72,
                      padding: '14px 16px',
                      borderRadius: TOKENS_LAYOUT.RAIO_CARTAO,
                      border: feito
                        ? '1px solid rgba(74, 222, 128, 0.28)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: feito
                        ? 'rgba(22, 163, 74, 0.10)'
                        : 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleDieta(refeicao.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleDieta(refeicao.id)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <CheckboxDieta
                        marcado={feito}
                        onClick={() => toggleDieta(refeicao.id)}
                        ariaLabel={feito ? `Desmarcar ${refeicao.label}` : `Marcar ${refeicao.label} como feito`}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          color: feito ? 'rgba(255,255,255,0.55)' : TOKENS_LAYOUT.TEXTO_PRINCIPAL,
                          textDecoration: feito ? 'line-through' : 'none',
                          textDecorationThickness: feito ? '1.5px' : 0,
                          textDecorationColor: 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {refeicao.emoji} {refeicao.label}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          marginTop: 4,
                          color: '#fcd34d',
                          fontWeight: 600,
                          lineHeight: 1.4,
                        }}
                      >
                        {refeicao.macros}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', fontWeight: 600 }}>
              Dieta do dia
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24' }}>
              {pctDieta}%
            </span>
          </div>
        </CartaoTela>

        <CartaoTela>
          <div style={{ marginBottom: 14 }}>
            <h2
              id="dia-hebraico-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                lineHeight: 1.3,
              }}
            >
              🕎 Dia hebraico
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ fontSize: 36, lineHeight: 1 }} aria-hidden="true">{diaHebraico.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fcd34d', lineHeight: 1.2 }}>
                {diaHebraico.diaPt}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: TOKENS_LAYOUT.TEXTO_PRINCIPAL, lineHeight: 1.2, marginTop: 4 }}>
                {diaHebraico.transliterado}
              </div>
              <div style={{ fontSize: 16, color: '#fbbf24', fontWeight: 700, marginTop: 6 }} dir="rtl">
                {diaHebraico.hebraico}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.60)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginTop: 8 }}>
                {diaHebraico.nome}
              </div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', marginTop: 10, lineHeight: 1.5, marginBottom: 0, fontStyle: 'italic' }}>
                &ldquo;{diaHebraico.criacao}&rdquo;
              </p>
              <p style={{ fontSize: 14, color: 'rgba(251, 191, 36, 0.70)', marginTop: 6, fontWeight: 600 }}>
                — {diaHebraico.referencia}
              </p>
            </div>
          </div>
        </CartaoTela>

        <CartaoTela>
          <div style={{ marginBottom: 14 }}>
            <h2
              id="palavra-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: 'rgba(255,255,255,0.55)',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                lineHeight: 1.3,
              }}
            >
              📜 Palavra do dia — Tanakh
            </h2>
          </div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, minHeight: 56, margin: 0, fontStyle: 'italic' }}>
            &ldquo;{palavra.texto}&rdquo;
          </p>
          <p style={{ fontSize: 14, color: 'rgba(251, 191, 36, 0.72)', marginTop: 10, fontWeight: 600 }}>
            — {palavra.ref}
          </p>
          <button
            type="button"
            onClick={novaPalavra}
            style={{
              marginTop: 16,
              width: '100%',
              minHeight: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(251, 191, 36, 0.18)',
              color: TOKENS_LAYOUT.TEXTO_PRINCIPAL,
              fontSize: 15,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1.1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Outra palavra
          </button>
        </CartaoTela>

        <CartaoTela>
          <EditorConfigPrograma
            inicioAtual={configPrograma.inicio}
            erro={erroConfig}
            onConfirmar={onConfirmarInicio}
          />
        </CartaoTela>

        <footer style={{ marginTop: 6, textAlign: 'center', paddingBottom: 8 }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700 }}>
            Treino Diário · Disciplina Transforma
          </div>
        </footer>
      </ContainerTela>
    </>
  );
}
