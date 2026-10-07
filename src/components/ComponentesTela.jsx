/* eslint-disable react-refresh/only-export-components */
import React from 'react';

const FUNDO = '#0a0d1a';
const TEXTO_PRINCIPAL = '#f1f5f9';
const LARGURA_MAX = 480;
const PADDING_X = 20;
const PADDING_TOPO = 24;
const RAIO_CARTAO = 16;
const BORDA_CARTAO = '1px solid rgba(255,255,255,0.08)';
const FUNDO_CARTAO = 'rgba(255,255,255,0.03)';
const GAP_ENTRE_CARTOES = 12;
const GAP_CONTAINER = 20;

export function ContainerTela({ children, paddingAbaixo = 200 }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: FUNDO,
        color: TEXTO_PRINCIPAL,
        paddingBottom: paddingAbaixo,
      }}
    >
      <div
        style={{
          maxWidth: LARGURA_MAX,
          margin: '0 auto',
          padding: `${PADDING_TOPO}px ${PADDING_X}px 0`,
          display: 'flex',
          flexDirection: 'column',
          gap: `${GAP_CONTAINER}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function CartaoTela({ children, destaque, style }) {
  return (
    <div
      style={{
        borderRadius: RAIO_CARTAO,
        border: destaque ? '1px solid rgba(74, 222, 128, 0.28)' : BORDA_CARTAO,
        background: destaque ? 'rgba(22, 163, 74, 0.10)' : FUNDO_CARTAO,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const TOKENS_LAYOUT = {
  FUNDO,
  TEXTO_PRINCIPAL,
  LARGURA_MAX,
  PADDING_X,
  PADDING_TOPO,
  RAIO_CARTAO,
  BORDA_CARTAO,
  FUNDO_CARTAO,
  GAP_ENTRE_CARTOES,
  GAP_CONTAINER,
};

export function SecaoTela({ titulo, titleId, children }) {
  return (
    <section aria-labelledby={titleId} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {titulo ? (
        <h2
          id={titleId}
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
          {titulo}
        </h2>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP_ENTRE_CARTOES}px` }}>
        {children}
      </div>
    </section>
  );
}
