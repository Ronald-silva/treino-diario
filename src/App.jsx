import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';

const treinosSemana = {
  1: {
    titulo: "Peito, Ombro e Tríceps",
    exercicios: [
      'Supino reto com barra – 4x10',
      'Supino inclinado com halteres – 3x10',
      'Desenvolvimento com halteres – 3x10',
      'Elevação lateral – 3x12',
      'Tríceps corda na polia – 3x12',
      'Tríceps testa com barra – 3x10'
    ]
  },
  2: {
    titulo: "Costas e Bíceps",
    exercicios: [
      'Puxada na frente na polia alta – 4x10',
      'Remada baixa – 3x10',
      'Remada unilateral com halter – 3x10',
      'Rosca direta com barra – 3x10',
      'Rosca alternada com halteres – 3x12',
      'Face pull – 3x15'
    ]
  },
  3: {
    titulo: "Pernas e Abdômen",
    exercicios: [
      'Agachamento livre – 4x10',
      'Leg press – 3x10',
      'Cadeira extensora – 3x12',
      'Mesa flexora – 3x12',
      'Elevação de panturrilhas – 3x15',
      'Prancha abdominal – 3x30 segundos',
      'Abdominal infra – 3x15'
    ]
  },
  4: {
    titulo: "PUSH (variações)",
    exercicios: [
      'Supino reto com halteres – 4x10',
      'Crucifixo inclinado – 3x12',
      'Desenvolvimento Arnold – 3x10',
      'Elevação frontal – 3x12',
      'Tríceps francês – 3x10',
      'Mergulho em banco – 3x12'
    ]
  },
  5: {
    titulo: "PULL (variações)",
    exercicios: [
      'Barra fixa assistida ou puxada aberta – 4x10',
      'Remada curvada com barra – 3x10',
      'Rosca scott – 3x12',
      'Rosca martelo – 3x12',
      'Encolhimento para trapézio – 3x15',
      'Abdominal oblíquo – 3x15'
    ]
  },
  6: {
    titulo: "Pernas + Funcional",
    exercicios: [
      'Agachamento sumô com halter – 3x12',
      'Afundo alternado – 3x10 por perna',
      'Stiff com halteres – 3x12',
      'Panturrilha no leg – 3x20',
      'Circuito leve: corda, prancha e agachamento – 10 min'
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
  "Superação diária! Seu corpo agradece pelo esforço! 🌟",
  "Fortalece-te e sê corajoso, pois YHWH é contigo por onde quer que andares. (Josué 1:9) 🛡️",
  "O justo é firme como o leão. (Provérbios 28:1) 🦁",
  "Com meu Deus salto muralhas. (Salmos 18:29) 🧗",
  "A sabedoria fortalece mais ao sábio do que dez poderosos numa cidade. (Eclesiastes 7:19) 🧠",
  "O homem disciplinado domina a si mesmo melhor do que aquele que conquista cidades. (Provérbios 16:32) 🎯",
  "A força não vem dos músculos, mas do coração alinhado com o Eterno. 🕊️",
  "YHWH adestra minhas mãos para a batalha e meus braços para o combate. (Salmos 18:34) ⚔️",
  "Sete vezes cai o justo, e se levanta. (Provérbios 24:16) 🔁",
  "O temor do Eterno é o princípio da sabedoria — e o princípio da verdadeira força. (Provérbios 1:7) 🛤️",
  "Confia no Eterno com todo o teu coração, e Ele endireitará os teus caminhos. (Provérbios 3:5-6) 🚀"
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
