import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';
import SessaoTreino from './components/SessaoTreino';
import { useDataLocalAtual, useSessao } from './hooks/useSessao';
import {
  gerarTreinoDoDia,
  getDiaHebraico,
  getInfoCiclo,
  gerarPlanoAlimentarDoDia,
  getPalavraAleatoria,
  getPalavraDoDia,
} from './data';

function criarDataLocal(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function getDataFormatada(data) {
  const d = criarDataLocal(data);
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function getDiaSemana(data) {
  const dia = criarDataLocal(data).getDay();
  return dia === 0 ? 7 : dia;
}

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

function ProgressBar({ pct, color = 'from-amber-500 to-orange-500', height = 'h-2', label = 'Progresso' }) {
  return (
    <div
      className={`w-full bg-white/5 rounded-full ${height} overflow-hidden`}
      role="progressbar"
      aria-label={label}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={pct}
    >
      <div
        className={`${height} rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out ${pct > 0 ? 'progress-glow' : ''}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return <span className="section-title mb-3 mt-1">{children}</span>;
}

function AppDoDia({ dataAtual }) {
  const diaSemana = getDiaSemana(dataAtual);
  const ciclo = getInfoCiclo();
  const diaHebraico = useMemo(() => getDiaHebraico(), []);
  const isDomingo = diaSemana === 7;
  const treino = useMemo(
    () => (isDomingo ? null : gerarTreinoDoDia(diaSemana)),
    [diaSemana, isDomingo],
  );
  const planoAlimentar = useMemo(() => gerarPlanoAlimentarDoDia(), []);
  const controleSessao = useSessao(dataAtual, treino);

  const [dieta, setDieta] = useState(() => loadJSON(`dieta-${dataAtual}`, {}));
  const [palavra, setPalavra] = useState(() => getPalavraDoDia());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    saveJSON(`dieta-${dataAtual}`, dieta);
  }, [dataAtual, dieta]);

  useEffect(() => {
    if (!showModal) return undefined;
    const timeout = window.setTimeout(() => setShowModal(false), 5000);
    return () => window.clearTimeout(timeout);
  }, [showModal]);

  const toggleDieta = useCallback((id) => {
    setDieta((anterior) => ({ ...anterior, [id]: !anterior[id] }));
  }, []);

  const novaPalavra = useCallback(() => {
    setPalavra((anterior) => getPalavraAleatoria(anterior?.idx));
  }, []);

  const feitosDieta = planoAlimentar.filter((refeicao) => dieta[refeicao.id]).length;
  const pctDieta = Math.round((feitosDieta / planoAlimentar.length) * 100);
  const { totalSeries, seriesFeitas, percentual: pctTreino } = controleSessao.progresso;
  const totalDisciplina = totalSeries + planoAlimentar.length;
  const pctDisciplina = totalDisciplina > 0
    ? Math.round(((seriesFeitas + feitosDieta) / totalDisciplina) * 100)
    : pctDieta;

  return (
    <div className="min-h-screen bg-image p-4 md:p-6 flex flex-col items-center">
      {showModal ? (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conclusao-title"
          onClick={() => setShowModal(false)}
        >
          <div className="glass-card rounded-2xl p-8 w-full max-w-md animate-fade-in text-center" onClick={(event) => event.stopPropagation()}>
            <div className="text-5xl mb-4" aria-hidden="true">🏆</div>
            <h2 id="conclusao-title" className="text-2xl font-bold text-amber-400 mb-3">Treino concluído!</h2>
            <p className="text-white/70 text-sm mb-4 italic">“{palavra.texto}”</p>
            <p className="text-amber-400/50 text-xs font-mono mb-6">— {palavra.ref}</p>
            <button type="button" onClick={() => setShowModal(false)} className="session-button primary">
              Fechar conclusão
            </button>
          </div>
        </div>
      ) : null}

      <main className="w-full max-w-lg space-y-4">
        <header className="text-center py-4 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            TREINO <span className="text-yellow-500">DIÁRIO</span>
          </h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-[3px] mt-1">
            Disciplina &middot; Transformação &middot; Fé
          </p>
          <p className="text-yellow-600/50 text-[11px] font-medium mt-2">
            {diaHebraico.diaPt}, {getDataFormatada(dataAtual)}
          </p>
        </header>

        <section className="glass-card rounded-2xl p-5 animate-fade-in" aria-labelledby="disciplina-title">
          <div className="flex items-center justify-between mb-3">
            <h2 id="disciplina-title" className="text-xs font-bold text-white/50 uppercase tracking-widest">Disciplina do dia</h2>
            <span className={`text-2xl font-black ${pctDisciplina >= 80 ? 'text-emerald-400' : pctDisciplina >= 40 ? 'text-amber-400' : 'text-white/40'}`}>
              {pctDisciplina}%
            </span>
          </div>
          <ProgressBar label="Disciplina do dia" pct={pctDisciplina} color={pctDisciplina >= 80 ? 'from-emerald-400 to-green-500' : 'from-yellow-500 to-amber-600'} height="h-3" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="glass-card-alt rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{pctTreino}%</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Treino</div>
            </div>
            <div className="glass-card-alt rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{pctDieta}%</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Dieta</div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-4 animate-fade-in" aria-label="Ciclo de treino">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Ciclo — Semana {ciclo.semanaNo}/6</span>
              <div className={`text-sm font-bold mt-0.5 ${ciclo.cor}`}>{ciclo.emoji} {ciclo.fase}</div>
            </div>
            <div className={`text-[11px] font-semibold ${ciclo.cor} max-w-[180px] text-right leading-tight`}>
              {ciclo.msg}
            </div>
          </div>
        </section>

        {isDomingo ? (
          <section className="glass-card rounded-2xl p-8 text-center animate-fade-in">
            <div className="text-4xl mb-3" aria-hidden="true">🕊️</div>
            <h2 className="text-xl font-bold text-white mb-1">Dia de descanso</h2>
            <p className="text-white/50 text-sm">Recupere o corpo e a mente. Amanhã voltamos.</p>
          </section>
        ) : treino ? (
          <SessaoTreino
            treino={treino}
            controle={controleSessao}
            onConcluida={() => setShowModal(true)}
          />
        ) : null}

        <section className="glass-card rounded-2xl p-5 animate-fade-in" aria-labelledby="alimentacao-title">
          <h2 id="alimentacao-title"><SectionTitle>🍽️ Plano alimentar</SectionTitle></h2>
          <ul className="space-y-2">
            {planoAlimentar.map((refeicao) => (
              <li key={refeicao.id}>
                <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${dieta[refeicao.id] ? 'bg-emerald-500/8 border border-emerald-500/15' : 'glass-card-alt hover:bg-white/[0.06]'}`}>
                  <input type="checkbox" checked={Boolean(dieta[refeicao.id])} onChange={() => toggleDieta(refeicao.id)} className="custom-check" />
                  <span className="flex-1 min-w-0">
                    <span className={`text-sm font-medium transition-all duration-300 block ${dieta[refeicao.id] ? 'line-through text-white/30' : 'text-white/80'}`}>
                      {refeicao.emoji} {refeicao.label}
                    </span>
                    <span className="text-[10px] text-amber-400/60 font-mono mt-0.5 block">{refeicao.macros}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-0.5 text-center">
            <div className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">Cardápio rotativo — muda todo dia</div>
            <div className="text-[9px] text-amber-600/25 font-medium tracking-wide">Puro · Nordestino · Econômico · Vayikra 11</div>
          </div>
          <div className="mt-3">
            <ProgressBar label="Progresso da dieta" pct={pctDieta} color="from-emerald-400 to-green-500" />
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5 animate-fade-in" aria-labelledby="dia-hebraico-title">
          <h2 id="dia-hebraico-title"><SectionTitle>🕎 Dia hebraico</SectionTitle></h2>
          <div className="flex items-start gap-4 mt-1">
            <div className="text-3xl" aria-hidden="true">{diaHebraico.emoji}</div>
            <div className="flex-1">
              <div className="text-base font-bold text-yellow-500/90 leading-tight">{diaHebraico.diaPt}</div>
              <div className="text-lg font-bold text-white/90 leading-tight mt-0.5">{diaHebraico.transliterado}</div>
              <div className="text-yellow-600/70 text-sm font-semibold mt-0.5 hebrew-text" dir="rtl">{diaHebraico.hebraico}</div>
              <div className="text-white/35 text-[11px] uppercase tracking-wider font-semibold mt-1">{diaHebraico.nome}</div>
              <p className="text-white/55 text-sm mt-2 leading-relaxed italic">“{diaHebraico.criacao}”</p>
              <p className="text-yellow-600/35 text-[10px] font-mono mt-1">— {diaHebraico.referencia}</p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5 animate-fade-in" aria-labelledby="palavra-title">
          <h2 id="palavra-title"><SectionTitle>📜 Palavra do dia — Tanakh</SectionTitle></h2>
          <p className="text-white/65 text-sm leading-relaxed italic min-h-[48px] mt-1">“{palavra.texto}”</p>
          <p className="text-yellow-600/45 text-xs font-mono mt-2">— {palavra.ref}</p>
          <button type="button" onClick={novaPalavra} className="mt-3 w-full min-h-11 rounded-xl bg-white/[0.03] border border-yellow-600/10 text-white/60 text-xs font-semibold uppercase tracking-wider hover:bg-yellow-600/8 hover:text-white/80 active:scale-[0.97] transition-all">
            Outra palavra
          </button>
        </section>

        <footer className="text-center py-6 text-white/20 text-[10px] uppercase tracking-[3px] font-semibold">
          Treino Diário &middot; Disciplina Transforma
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const dataAtual = useDataLocalAtual();
  return <AppDoDia key={dataAtual} dataAtual={dataAtual} />;
}
