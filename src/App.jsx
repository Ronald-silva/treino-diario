import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';

const treinosSemana = {
  1: {
    titulo: "Peito, Ombro e Tríceps (PUSH)",
    exercicios: [
      'Supino reto com barra',
      'Supino inclinado com halteres',
      'Desenvolvimento com halteres',
      'Elevação lateral',
      'Tríceps corda na polia',
      'Tríceps testa com barra'
    ]
  },
  2: {
    titulo: "Costas e Bíceps (PULL)",
    exercicios: [
      'Puxada na frente na polia alta',
      'Remada baixa',
      'Remada unilateral com halter',
      'Rosca direta com barra',
      'Rosca alternada com halteres',
      'Face pull'
    ]
  },
  3: {
    titulo: "Pernas e Abdômen",
    exercicios: [
      'Agachamento livre',
      'Leg press',
      'Cadeira extensora',
      'Mesa flexora',
      'Elevação de panturrilhas',
      'Prancha abdominal',
      'Abdominal infra'
    ]
  },
  4: {
    titulo: "PUSH (variações)",
    exercicios: [
      'Supino reto com halteres',
      'Crucifixo inclinado',
      'Desenvolvimento Arnold',
      'Elevação frontal',
      'Tríceps francês',
      'Mergulho em banco'
    ]
  },
  5: {
    titulo: "PULL (variações)",
    exercicios: [
      'Barra fixa assistida ou puxada aberta',
      'Remada curvada com barra',
      'Rosca scott',
      'Rosca martelo',
      'Encolhimento para trapézio',
      'Abdominal oblíquo'
    ]
  },
  6: {
    titulo: "Pernas + Funcional",
    exercicios: [
      'Agachamento sumô com halter',
      'Afundo alternado',
      'Stiff com halteres',
      'Panturrilha no leg',
      'Circuito leve: corda, prancha e agachamento'
    ]
  }
};

const App = () => {
  const hoje = new Date().getDay();
  const dia = hoje === 0 ? 1 : hoje;
  const treino = treinosSemana[dia] || treinosSemana[1];
  
  const [showModal, setShowModal] = useState(false);
  const [mensagemMotivacional, setMensagemMotivacional] = useState('');

  const [concluidos, setConcluidos] = useState(() => {
    const salvo = localStorage.getItem(`concluidos-${dia}`);
    return salvo ? JSON.parse(salvo) : {};
  });

  const alternarConclusao = (id) => {
    const novoEstado = { ...concluidos, [id]: !concluidos[id] };
    setConcluidos(novoEstado);
    localStorage.setItem(`concluidos-${dia}`, JSON.stringify(novoEstado));
  };

  const resetarTreino = () => {
    setConcluidos({});
    localStorage.removeItem(`concluidos-${dia}`);
  };

  const mensagensMotivacionais = [
    "Parabéns! Você arrasou no treino de hoje! 💪",
    "Mais um treino concluído! Continue nesse ritmo! 🔥",
    "Excelente trabalho! Cada treino te deixa mais forte! 💯",
    "Você está cada vez mais perto dos seus objetivos! 🏆",
    "Superação diária! Seu corpo agradece pelo esforço! 🌟"
  ];

  const concluirTreino = () => {
    const todosExercicios = {};
    treino.exercicios.forEach((_, index) => {
      todosExercicios[index] = true;
    });
    setConcluidos(todosExercicios);
    localStorage.setItem(`concluidos-${dia}`, JSON.stringify(todosExercicios));
    
    // Escolher uma mensagem motivacional aleatória
    const mensagemAleatoria = mensagensMotivacionais[Math.floor(Math.random() * mensagensMotivacionais.length)];
    setMensagemMotivacional(mensagemAleatoria);
    
    // Exibir o modal
    setShowModal(true);
    
    // Registrar a conclusão do treino no histórico
    const historicoTreinos = JSON.parse(localStorage.getItem('historico-treinos') || '[]');
    historicoTreinos.push({
      data: new Date().toISOString(),
      treino: treino.titulo,
      exercicios: treino.exercicios.length
    });
    localStorage.setItem('historico-treinos', JSON.stringify(historicoTreinos));
  };

  const feitos = treino.exercicios.filter((_, i) => concluidos[i]);
  const progresso = Math.round((feitos.length / treino.exercicios.length) * 100);

  // Função para fechar o modal
  const fecharModal = () => {
    setShowModal(false);
  };

  // Usar useEffect para fechar o modal automaticamente após 5 segundos
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 5000); // 5 segundos
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center bg-image">
      {/* Modal de parabéns */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md transform animate-bounce-subtle">
            <h3 className="text-xl font-bold text-center text-green-600 mb-4">🎉 Treino Concluído! 🎉</h3>
            <p className="text-center text-gray-700 mb-4">{mensagemMotivacional}</p>
            <div className="flex justify-center">
              <button 
                onClick={fecharModal}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">{treino.titulo}</h2>
        <p className="text-center text-gray-700 mb-4">
          Progresso: {feitos.length}/{treino.exercicios.length} exercícios ({progresso}%)
        </p>
        <ul className="space-y-2">
          {treino.exercicios.map((ex, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!concluidos[i]}
                onChange={() => alternarConclusao(i)}
                className="w-5 h-5 text-blue-600"
              />
              <span className={concluidos[i] ? "line-through text-gray-500" : ""}>
                {ex}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={concluirTreino}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded"
          >
            Concluir Treino
          </button>
          <button
            onClick={resetarTreino}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
          >
            Resetar Treino
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
