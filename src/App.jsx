import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './index.css';
import './App.css';
import { gerarTreinoDoDia, getInfoCiclo, gerarPlanoAlimentarDoDia, getDiaHebraico, getPalavraDoDia, getPalavraAleatoria } from './data';

// ─── Helpers ──────────────────────────────────────────────────────────────

function getDataHoje() {
  return new Date().toISOString().slice(0, 10); // "2026-04-27"
}

function getDataFormatada() {
  const d = new Date();
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// getSemanaDoAno movido para data.js

function getDiaSemana() {
  const d = new Date().getDay(); // 0=dom
  return d === 0 ? 7 : d; // 7=dom (descanso)
}

function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Componentes pequenos ────────────────────────────────────────────────

function ProgressBar({ pct, color = 'from-amber-500 to-orange-500', height = 'h-2' }) {
  return (
    <div className={`w-full bg-white/5 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out ${pct > 0 ? 'progress-glow' : ''}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="section-title mb-3 mt-1">{children}</div>;
}

// ─── APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const hoje = getDataHoje();
  const diaSemana = getDiaSemana();
  const ciclo = getInfoCiclo();
  const diaHebraico = useMemo(() => getDiaHebraico(), []);

  // Domingo = descanso
  const isDomingo = diaSemana === 7;

  // Treino do dia (com rotação automática baseada na semana)
  const treino = useMemo(
    () => (isDomingo ? null : gerarTreinoDoDia(diaSemana)),
    [diaSemana, isDomingo]
  );

  // Plano alimentar do dia (rotação diária automática)
  const planoAlimentar = useMemo(() => gerarPlanoAlimentarDoDia(), []);

  // ── Estado: exercícios concluídos ──
  const [concluidos, setConcluidos] = useState(() => loadJSON(`treino-${hoje}`, {}));

  // ── Estado: progressão de carga por exercício ──
  const [cargas, setCargas] = useState(() => loadJSON(`cargas-${hoje}`, {}));

  // ── Estado: dieta do dia ──
  const [dieta, setDieta] = useState(() => loadJSON(`dieta-${hoje}`, {}));

  // ── Estado: palavra do dia (Tanakh) ──
  const [palavra, setPalavra] = useState(() => getPalavraDoDia());

  // ── Estado: modal ──
  const [showModal, setShowModal] = useState(false);

  // ── Persistir mudanças ──
  useEffect(() => { saveJSON(`treino-${hoje}`, concluidos); }, [concluidos, hoje]);
  useEffect(() => { saveJSON(`cargas-${hoje}`, cargas); }, [cargas, hoje]);
  useEffect(() => { saveJSON(`dieta-${hoje}`, dieta); }, [dieta, hoje]);

  // ── Fechar modal auto ──
  useEffect(() => {
    if (showModal) {
      const t = setTimeout(() => setShowModal(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showModal]);

  // ── Handlers ──
  const toggleExercicio = useCallback((i) => {
    setConcluidos((prev) => ({ ...prev, [i]: !prev[i] }));
  }, []);

  const setCarga = useCallback((i, tipo) => {
    setCargas((prev) => ({ ...prev, [i]: prev[i] === tipo ? null : tipo }));
  }, []);

  const toggleDieta = useCallback((id) => {
    setDieta((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const novaPalavra = useCallback(() => {
    setPalavra((prev) => {
      const nova = getPalavraAleatoria(prev?.idx);
      return nova;
    });
  }, []);

  const concluirTudo = useCallback(() => {
    if (!treino) return;
    const todos = {};
    treino.exercicios.forEach((_, i) => { todos[i] = true; });
    setConcluidos(todos);
    setShowModal(true);

    // Histórico
    const hist = loadJSON('historico-treinos', []);
    hist.push({ data: new Date().toISOString(), treino: treino.titulo, total: treino.exercicios.length });
    saveJSON('historico-treinos', hist);
  }, [treino]);

  const resetarDia = useCallback(() => {
    setConcluidos({});
    setCargas({});
    setDieta({});
  }, []);

  // ── Cálculos de progresso ──
  const totalEx = treino?.exercicios.length || 0;
  const feitosEx = treino ? treino.exercicios.filter((_, i) => concluidos[i]).length : 0;
  const pctTreino = totalEx > 0 ? Math.round((feitosEx / totalEx) * 100) : 0;

  const feitosDieta = planoAlimentar.filter((r) => dieta[r.id]).length;
  const pctDieta = Math.round((feitosDieta / planoAlimentar.length) * 100);

  const pctDisciplina = totalEx > 0
    ? Math.round(((feitosEx + feitosDieta) / (totalEx + planoAlimentar.length)) * 100)
    : pctDieta;

  // Feedback de evolução
  const cargasUp = Object.values(cargas).filter((v) => v === 'up').length;
  const evoluiu = cargasUp > 0;

  // ── RENDER ──
  return (
    <div className="min-h-screen bg-image p-4 md:p-6 flex flex-col items-center">
      {/* ── Modal de conclusão ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="glass-card rounded-2xl p-8 w-full max-w-md animate-fade-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-amber-400 mb-3">Treino Concluído!</h3>
            <p className="text-white/70 text-sm mb-4 italic">"{palavra.texto}"</p>
            <p className="text-amber-400/50 text-xs font-mono mb-6">— {palavra.ref}</p>
            {evoluiu && (
              <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
                Você evoluiu hoje 🔥 — {cargasUp} exercício(s) com carga aumentada
              </div>
            )}
            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm hover:brightness-110 transition-all">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ── Container principal ── */}
      <div className="w-full max-w-lg space-y-4">

        {/* ── Header ── */}
        <div className="text-center py-4 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            TREINO <span className="text-yellow-500">DIÁRIO</span>
          </h1>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-[3px] mt-1">
            Disciplina &middot; Transformação &middot; Fé
          </p>
          <p className="text-yellow-600/50 text-[11px] font-medium mt-2">
            {diaHebraico.diaPt}, {getDataFormatada()}
          </p>
        </div>

        {/* ── Card: Disciplina do Dia ── */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Disciplina do Dia</span>
            <span className={`text-2xl font-black ${pctDisciplina >= 80 ? 'text-emerald-400' : pctDisciplina >= 40 ? 'text-amber-400' : 'text-white/40'}`}>
              {pctDisciplina}%
            </span>
          </div>
          <ProgressBar pct={pctDisciplina} color={pctDisciplina >= 80 ? 'from-emerald-400 to-green-500' : 'from-yellow-500 to-amber-600'} height="h-3" />
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
        </div>

        {/* ── Card: Ciclo / Periodização ── */}
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Ciclo — Semana {ciclo.semanaNo}/6</span>
              <div className={`text-sm font-bold mt-0.5 ${ciclo.cor}`}>{ciclo.emoji} {ciclo.fase}</div>
            </div>
            <div className={`text-[11px] font-semibold ${ciclo.cor} max-w-[180px] text-right leading-tight`}>
              {ciclo.msg}
            </div>
          </div>
        </div>

        {/* ── Card: Treino ── */}
        {isDomingo ? (
          <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
            <div className="text-4xl mb-3">🕊️</div>
            <h2 className="text-xl font-bold text-white mb-1">Dia de Descanso</h2>
            <p className="text-white/50 text-sm">Recupere o corpo e a mente. Amanhã voltamos.</p>
          </div>
        ) : treino && (
          <div className="glass-card rounded-2xl p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white leading-tight">{treino.titulo}</h2>
              <span className="text-xs text-white/40 font-mono">{feitosEx}/{totalEx}</span>
            </div>

            <ul className="space-y-2.5">
              {treino.exercicios.map((ex, i) => (
                <li key={i} className={`rounded-xl p-3 transition-all duration-300 ${concluidos[i] ? 'bg-yellow-500/[0.06] border border-yellow-500/15' : 'glass-card-alt'}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!concluidos[i]}
                      onChange={() => toggleExercicio(i)}
                      className="custom-check mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium transition-all duration-300 block ${concluidos[i] ? 'line-through text-white/30' : 'text-white/90'}`}>
                        {ex}
                      </span>
                      {/* Progressão de carga */}
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={() => setCarga(i, 'up')} className={`load-btn ${cargas[i] === 'up' ? 'active-up' : ''}`}>▲ Aumentei</button>
                        <button onClick={() => setCarga(i, 'same')} className={`load-btn ${cargas[i] === 'same' ? 'active-same' : ''}`}>= Mantive</button>
                        <button onClick={() => setCarga(i, 'down')} className={`load-btn ${cargas[i] === 'down' ? 'active-down' : ''}`}>▼ Reduzi</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Feedback de evolução */}
            {evoluiu && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-fade-in">
                <span className="text-emerald-400 text-sm font-bold">Você evoluiu hoje 🔥</span>
                <span className="text-emerald-400/60 text-xs block mt-0.5">{cargasUp} exercício(s) com carga aumentada</span>
              </div>
            )}

            <ProgressBar pct={pctTreino} height="h-1.5" />

            {/* Botões */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={concluirTudo} className="py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all">
                ✅ Concluir Tudo
              </button>
              <button onClick={resetarDia} className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white/80 active:scale-[0.97] transition-all">
                🔄 Resetar Dia
              </button>
            </div>
          </div>
        )}

        {/* ── Card: Alimentação ── */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <SectionTitle>🍽️ Plano Alimentar</SectionTitle>
          <ul className="space-y-2">
            {planoAlimentar.map((refeicao) => (
              <li
                key={refeicao.id}
                onClick={() => toggleDieta(refeicao.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${dieta[refeicao.id] ? 'bg-emerald-500/8 border border-emerald-500/15' : 'glass-card-alt hover:bg-white/[0.06]'}`}
              >
                <input type="checkbox" checked={!!dieta[refeicao.id]} readOnly className="custom-check" />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium transition-all duration-300 block ${dieta[refeicao.id] ? 'line-through text-white/30' : 'text-white/80'}`}>
                    {refeicao.emoji} {refeicao.label}
                  </span>
                  <span className="text-[10px] text-amber-400/60 font-mono mt-0.5 block">{refeicao.macros}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-center text-[10px] text-white/25 font-semibold uppercase tracking-wider">
            Cardápio rotativo — muda automaticamente todo dia
          </div>
          <div className="mt-3">
            <ProgressBar pct={pctDieta} color="from-emerald-400 to-green-500" />
          </div>
        </div>

        {/* ── Card: Dia Hebraico ── */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <SectionTitle>🕎 Dia Hebraico</SectionTitle>
          <div className="flex items-start gap-4 mt-1">
            <div className="text-3xl">{diaHebraico.emoji}</div>
            <div className="flex-1">
              <div className="text-base font-bold text-yellow-500/90 leading-tight">
                {diaHebraico.diaPt}
              </div>
              <div className="text-lg font-bold text-white/90 leading-tight mt-0.5">{diaHebraico.transliterado}</div>
              <div className="text-yellow-600/70 text-sm font-semibold mt-0.5 hebrew-text" dir="rtl">{diaHebraico.hebraico}</div>
              <div className="text-white/35 text-[11px] uppercase tracking-wider font-semibold mt-1">{diaHebraico.nome}</div>
              <p className="text-white/55 text-sm mt-2 leading-relaxed italic">"{diaHebraico.criacao}"</p>
              <p className="text-yellow-600/35 text-[10px] font-mono mt-1">— {diaHebraico.referencia}</p>
            </div>
          </div>
        </div>

        {/* ── Card: Palavra do Dia (Tanakh) ── */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <SectionTitle>📜 Palavra do Dia — Tanakh</SectionTitle>
          <p className="text-white/65 text-sm leading-relaxed italic min-h-[48px] mt-1">
            "{palavra.texto}"
          </p>
          <p className="text-yellow-600/45 text-xs font-mono mt-2">— {palavra.ref}</p>
          <button onClick={novaPalavra} className="mt-3 w-full py-2 rounded-xl bg-white/[0.03] border border-yellow-600/10 text-white/40 text-xs font-semibold uppercase tracking-wider hover:bg-yellow-600/8 hover:text-white/60 active:scale-[0.97] transition-all">
            🔄 Outra Palavra
          </button>
        </div>

        {/* ── Footer ── */}
        <div className="text-center py-6 text-white/20 text-[10px] uppercase tracking-[3px] font-semibold">
          Treino Diário &middot; Disciplina Transforma
        </div>
      </div>
    </div>
  );
}
