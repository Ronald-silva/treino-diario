# Análise do app Treino Diário

## Evidência usada

- **FATO:** a análise cobriu todo o código-fonte do app: entrada React, tela única, dados estáticos, estilos e configuração de execução (`src/main.jsx:1-10`, `src/App.jsx:1-361`, `src/data.js:1-515`, `src/App.css:1-218`, `package.json:1-30`).
- **FATO:** o app foi executado em Chromium a 1440×900 e 390×844. Não houve erro no console nem overflow horizontal; marcar um exercício persistiu após recarregar, coerente com o uso de `localStorage` (`src/App.jsx:25-34`, `src/App.jsx:73-91`).
- **FATO:** `npm run lint` terminou sem erro; o script e as regras estão configurados em `package.json:6-10` e `eslint.config.js:6-32`.

## ETAPA 1 — Mapeamento

### Stack, estrutura, telas, dados e execução

- **FATO — Stack:** SPA em React 19, Vite 6, Tailwind CSS 3/PostCSS e JavaScript/JSX; não há TypeScript (`package.json:5-28`, `tailwind.config.js:1-8`, `postcss.config.js:1-6`).
- **FATO — Estrutura:** `src/main.jsx` monta `App`; `src/App.jsx` contém estado, persistência e toda a interface; `src/data.js` contém exercícios, split, ciclo, alimentação e textos; `src/App.css` concentra os estilos próprios (`src/main.jsx:1-10`, `src/App.jsx:1-4`, `src/data.js:1-13`, `src/App.css:1-13`).
- **FATO — Rotas/telas:** há uma única tela longa e nenhuma dependência de roteamento; `App` é montado diretamente na raiz (`src/main.jsx:7-10`, `package.json:12-15`).
- **FATO — Modelo de dados:** não há tabelas, banco ou tipos formais. Exercícios são strings com nome, séries e repetições misturados; a sessão usa objetos indexados pela posição do exercício (`src/data.js:13-148`, `src/App.jsx:73-80`, `src/App.jsx:102-108`).
- **FATO — Persistência:** `treino-AAAA-MM-DD` guarda exercício concluído, `cargas-AAAA-MM-DD` guarda `up/same/down`, `dieta-AAAA-MM-DD` guarda refeições e `historico-treinos` recebe `{data, treino, total}` (`src/App.jsx:73-91`, `src/App.jsx:121-132`).
- **FATO — Serviços externos:** não encontrado. O app não declara cliente HTTP, banco, autenticação ou SDK externo; as dependências de produção são apenas React e React DOM (`package.json:12-15`).
- **FATO — Como roda:** `npm run dev`, `npm run build`, `npm run lint` e `npm run preview` usam Vite/ESLint (`package.json:6-10`, `vite.config.js:1-7`).
- **FATO — Deploy:** não encontrado. Não há configuração de Vercel, Netlify, GitHub Actions ou outro provedor; `dist` está ignorado (`.gitignore:10-13`).
- **RISCO — Documentação:** o README ainda é o texto genérico do template Vite e não documenta instalação, uso, armazenamento ou deploy do app (`README.md:1-12`).

### O que o app já faz hoje

- **FATO:** escolhe automaticamente um treino PUSH/PULL/LEGS para segunda a sábado e mostra descanso no domingo (`src/data.js:150-179`, `src/App.jsx:61-68`, `src/App.jsx:229-289`).
- **FATO:** varia os exercícios de cada grupo conforme o dia do ano (`src/data.js:3-8`, `src/data.js:161-179`).
- **FATO:** mostra séries e repetições alvo dentro do texto do exercício, por exemplo `4x10` e `3x12` (`src/data.js:13-148`).
- **FATO:** permite marcar o exercício inteiro como concluído e classificar a carga do dia como aumentada, mantida ou reduzida (`src/App.jsx:243-266`).
- **FATO:** calcula percentuais diários de treino, dieta e “disciplina” (`src/App.jsx:140-150`, `src/App.jsx:195-214`).
- **FATO:** exibe um ciclo visual de seis semanas com adaptação, progressão e deload (`src/data.js:182-196`, `src/App.jsx:216-227`).
- **FATO:** grava um histórico mínimo quando o usuário toca em “Concluir Tudo” (`src/App.jsx:121-132`, `src/App.jsx:279-287`).
- **FATO:** mantém marcações do dia no navegador após fechar/recarregar (`src/App.jsx:25-34`, `src/App.jsx:73-91`).
- **FATO:** oferece plano alimentar rotativo, conteúdo do dia hebraico e palavra do Tanakh (`src/data.js:198-340`, `src/data.js:343-515`, `src/App.jsx:291-352`).

## ETAPA 2 — Avaliação para ganho de massa muscular

### 1. Registro de série: carga, repetições, RIR/esforço e notas

- **FATO — Existe?** Não como registro de série. Existe apenas um checkbox para o exercício inteiro e uma escolha qualitativa `Aumentei/Mantive/Reduzi` por exercício (`src/App.jsx:243-262`).
- **RISCO — Funciona bem?** Não para hipertrofia mensurável: o app não sabe quantas séries foram realizadas, a carga usada, as repetições reais, o RIR/RPE nem se alguma série foi pulada (`src/App.jsx:73-78`, `src/App.jsx:102-108`).
- **FATO — Toques:** registrar uma série é impossível. Um toque marca o exercício inteiro; um segundo toque opcional classifica a tendência de carga (`src/App.jsx:247-261`).
- **RECOMENDAÇÃO — Falta:** registrar cada série com `kg`, `reps`, `RIR` e nota opcional, pré-preenchendo os valores anteriores para confirmar uma série repetida com um toque (`src/App.jsx:243-266`, `src/data.js:13-148`).

### 2. Performance da última sessão durante o treino

- **FATO — Existe?** Não encontrado.
- **FATO — Funciona bem?** O estado de carga é lido apenas da chave do dia atual; o histórico salvo não contém exercício, série, carga ou repetição (`src/App.jsx:77-78`, `src/App.jsx:129-131`).
- **RECOMENDAÇÃO — Falta:** mostrar, em cada exercício, a última carga/reps/RIR válidos e um alvo curto para hoje (`src/App.jsx:243-266`).

### 3. Sobrecarga progressiva

- **FATO — Existe?** Parcial: há botões qualitativos e uma mensagem de “evolução” quando algum exercício recebe `up` (`src/App.jsx:106-108`, `src/App.jsx:152-154`, `src/App.jsx:269-275`).
- **RISCO — Funciona bem?** Não. “Aumentei” não registra o valor, não compara sessões e não comprova progressão; a rotação diária também troca a variação do exercício, dificultando comparação consistente (`src/data.js:161-179`).
- **FATO — Histórico, gráficos, PRs e sugestão baseada em dados:** não encontrado.
- **RECOMENDAÇÃO — Falta:** usar progressão dupla: quando todas as séries atingirem o topo da faixa com o RIR alvo, sugerir o próximo incremento configurável; registrar PR de carga, reps e volume. Gráfico pode esperar (`src/data.js:13-148`, `src/App.jsx:257-275`).

### 4. Rotinas/splits

- **FATO — Existe?** Parcial: existe um PPL fixo, repetido duas vezes por semana, com ordem, séries e reps embutidas nas strings (`src/data.js:13-159`).
- **RISCO — Funciona bem?** Serve como ficha pronta, mas a variação automática diária reduz a continuidade do mesmo movimento e não respeita trocas por equipamento ocupado, dor ou preferência (`src/data.js:161-179`).
- **FATO — Criação e edição pelo usuário:** não encontrado.
- **RECOMENDAÇÃO — Falta:** primeiro estabilizar a ficha com IDs de exercício e permitir substituição equivalente; editor completo de rotinas não é necessário para o primeiro uso real (`src/data.js:13-179`).

### 5. Volume semanal por grupo muscular

- **FATO — Existe?** Não encontrado.
- **RISCO — Funciona bem?** O programa contém séries prescritas, mas elas estão em texto e o app não conhece séries efetivamente feitas nem músculos secundários; portanto não consegue calcular volume real (`src/data.js:13-148`, `src/App.jsx:141-143`).
- **RECOMENDAÇÃO — Falta:** derivar séries semanais concluídas por grupo a partir do registro de séries e de metadados estruturados do exercício (`src/data.js:13-159`).

### 6. Timer de descanso

- **FATO — Existe?** Não encontrado.
- **RECOMENDAÇÃO — Falta:** iniciar timer ao concluir uma série, com duração por exercício e ações grandes de `+30 s`, pausar e encerrar (`src/App.jsx:243-287`).

### 7. Biblioteca de exercícios

- **FATO — Existe?** Parcial: há exercícios agrupados e quatro variações por slot; equipamento e variação aparecem apenas no nome textual (`src/data.js:10-148`).
- **RISCO — Funciona bem?** É suficiente para gerar a ficha, mas não existe tela de busca/substituição nem campos estruturados para equipamento, músculo principal, secundários, instruções ou ID estável (`src/data.js:13-148`, `src/data.js:169-179`).
- **RECOMENDAÇÃO — Falta:** converter cada exercício em objeto com ID, nome, grupos, equipamento e prescrição; expor apenas a substituição necessária durante o treino (`src/data.js:13-179`).

### 8. Medidas corporais e peso

- **FATO — Existe?** Não encontrado.
- **RECOMENDAÇÃO — Falta:** peso e medidas podem entrar depois do diário de treino; não bloqueiam o primeiro uso consistente, que hoje está concentrado no checklist (`src/App.jsx:229-289`).

### 9. Uso na academia

- **FATO — Offline/sinal ruim:** as alterações são locais e não dependem de API, então uma página já carregada continua salvando no navegador; não foi encontrado manifest, service worker ou cache offline para abrir o app sem rede (`src/App.jsx:25-34`, `package.json:12-15`, `index.html:1-14`).
- **FATO — Retomada:** a marcação de exercício sobreviveu a reload no teste, conforme a persistência por efeito (`src/App.jsx:73-91`).
- **RISCO — Perda:** os dados ficam em um único navegador, sem exportação, backup ou sincronização; limpar os dados do site, trocar de celular ou desinstalar o navegador elimina o histórico (`src/App.jsx:25-34`, `src/App.jsx:128-131`).
- **FATO — Rapidez/legibilidade:** não houve erro nem overflow no teste móvel, mas checkbox e botões de carga mediram 22 px e 23 px de altura; o CSS confirma alvos pequenos e texto de 11 px com baixa opacidade (`src/App.css:90-102`, `src/App.css:148-158`).
- **HIPÓTESE — Uma mão/ambiente de academia:** acertar o checkbox de 22 px e os três botões de 23 px tende a ser difícil com uma mão e durante esforço; somente o próprio input do exercício é clicável (`src/App.jsx:243-262`, `src/App.css:90-102`).
- **RISCO — Desempenho percebido:** o fundo usado mede cerca de 736 KB e há `backdrop-filter` em todos os cards, combinação que pode pesar em celulares modestos (`src/App.css:32-38`, `src/App.css:65-80`).

### 10. Consistência: histórico, frequência, streak e lembretes

- **FATO — Existe?** Parcial: há gravação de histórico mínimo somente ao tocar “Concluir Tudo” (`src/App.jsx:121-132`, `src/App.jsx:279-287`).
- **RISCO — Funciona bem?** Não existe tela que leia o histórico; marcar todos os exercícios individualmente não grava sessão, e tocar “Concluir Tudo” mais de uma vez grava duplicatas (`src/App.jsx:121-132`).
- **FATO — Frequência, streak e lembretes:** não encontrado.
- **RECOMENDAÇÃO — Falta:** conclusão idempotente da sessão e resumo simples de treinos por semana; streak e notificações devem esperar (`src/App.jsx:121-132`).

## ETAPA 3 — Auditoria técnica relevante

### Bugs prováveis e estados quebrados

- **RISCO — Chave diária errada à noite:** `getDataHoje()` usa UTC (`toISOString`), enquanto o dia da semana e a data exibida usam hora local. Em Fortaleza, após 21h, os estados podem ser gravados com a data do dia seguinte e reaparecer em outro treino (`src/App.jsx:8-15`, `src/App.jsx:20-23`, `src/App.jsx:56-80`).
- **RISCO — Virada do dia com app aberto:** `hoje` e `treino` são recalculados em novo render, mas os estados inicializados por `useState` não são recarregados. Após meia-noite, uma interação pode salvar marcações do dia anterior sob a nova chave e aplicá-las por índice ao novo treino (`src/App.jsx:55-91`).
- **FATO — Histórico duplicável:** cada acionamento de “Concluir Tudo” faz `push`, sem verificar se a sessão já foi concluída (`src/App.jsx:121-132`).
- **FATO — Conclusão inconsistente:** marcar manualmente todos os checkboxes produz 100%, mas não grava o histórico; só o botão grava (`src/App.jsx:121-132`, `src/App.jsx:140-143`, `src/App.jsx:243-287`).
- **RISCO — Reset destrutivo:** “Resetar Dia” não pede confirmação e apaga simultaneamente treino, carga e dieta (`src/App.jsx:134-138`, `src/App.jsx:284-286`).
- **FATO — Semana zero:** em 1º de janeiro, a diferença usada em `Math.ceil` é zero, então o ciclo pode exibir semana `0/6` (`src/data.js:184-195`, `src/App.jsx:216-225`).
- **RISCO — Periodização apenas visual:** adaptação, progressão e deload mudam mensagem e cor, mas não alteram séries, reps, RIR ou treino gerado (`src/data.js:164-195`, `src/App.jsx:216-227`).
- **RISCO — Falha de gravação sem tratamento:** leitura de storage tem fallback, mas `localStorage.setItem` não tem `try/catch`; storage indisponível ou quota excedida pode lançar erro sem mensagem ou recuperação (`src/App.jsx:25-34`, `src/App.jsx:88-91`).

### Risco de perda de dados

- **FATO:** cada clique relevante dispara persistência local, o que reduz perda ao fechar a página no mesmo aparelho (`src/App.jsx:88-112`).
- **RISCO:** não há sessão versionada, exportação, importação, backup nem sincronização; `localStorage` é o único repositório (`src/App.jsx:25-34`, `src/App.jsx:73-91`, `src/App.jsx:128-131`).
- **RISCO:** usar índice como identidade (`0`, `1`, `2`) liga o dado à posição do exercício. Alterar ordem ou ficha impede uma migração confiável do histórico (`src/App.jsx:102-108`, `src/App.jsx:243-261`, `src/data.js:169-179`).

### Modelo de dados

- **FATO:** o modelo atual suporta checklist diário, mas não suporta histórico de séries nem progressão objetiva: a prescrição é string e o histórico contém somente data, título e quantidade total (`src/data.js:13-148`, `src/App.jsx:128-131`).
- **RECOMENDAÇÃO:** adotar IDs estáveis e entidades versionadas `exercise`, `routine`, `workoutSession`, `exerciseEntry` e `setEntry`; manter local-first no início, sem exigir backend (`src/data.js:13-179`, `src/App.jsx:73-91`).

### Segurança básica

- **FATO — Autenticação/RLS/banco:** não encontrado; não se aplica ao armazenamento exclusivamente local atual (`package.json:12-15`, `src/App.jsx:25-34`).
- **FATO — Chaves expostas:** não encontrado no código-fonte e configurações inspecionados.
- **RISCO:** se sincronização for adicionada, autenticação e segregação por usuário terão de existir antes do envio de qualquer dado; o modelo atual não possui `userId` nem controle de acesso (`src/App.jsx:73-91`, `src/App.jsx:128-131`).

### Performance percebida no celular

- **FATO — Pontos positivos:** tela única, sem chamadas externas, sem erro de console e sem overflow horizontal no teste; o container limita a largura e usa layout responsivo simples (`src/App.jsx:157-180`, `package.json:12-15`).
- **RISCO — GPU/rede:** imagem de fundo relativamente pesada, fundo fixo e dois níveis de blur podem causar carregamento e rolagem piores em celular de entrada (`src/App.css:32-38`, `src/App.css:65-80`).
- **RISCO — Interação:** os principais controles repetidos ficam abaixo de 44 px e o texto secundário usa 9–11 px/baixa opacidade, prejudicando velocidade e leitura na academia (`src/App.jsx:254-262`, `src/App.jsx:312-317`, `src/App.css:148-158`).

### Dívida técnica que atrapalha o produto

- **FATO:** lógica de sessão, storage, histórico e toda a tela estão juntas em um componente de 361 linhas; isso aumenta o risco ao introduzir séries, timer e retomada de sessão (`src/App.jsx:55-361`).
- **FATO:** não há script de teste; apenas dev, build, lint e preview (`package.json:6-10`).
- **RECOMENDAÇÃO:** antes de ampliar recursos, criar testes mínimos para data local, conclusão idempotente, retomada após reload e cálculo de progressão; são fluxos que podem perder ou distorcer treino (`src/App.jsx:8-34`, `src/App.jsx:73-132`).

## ETAPA 4 — Decisão de produto

### Veredito em 5 linhas

1. **FATO:** o app abre, é legível e já serve como ficha/checklist pessoal do treino do dia (`src/App.jsx:179-289`).
2. **FATO:** ele ainda não é um diário de hipertrofia, porque não registra nenhuma série real (`src/App.jsx:243-262`).
3. **RISCO:** sem carga, reps e RIR, não há base para comparar sessões nem decidir progressão (`src/App.jsx:73-78`, `src/App.jsx:128-131`).
4. **RISCO:** data UTC, reset sem confirmação e storage sem backup reduzem a confiança para uso diário (`src/App.jsx:8-10`, `src/App.jsx:25-34`, `src/App.jsx:134-138`).
5. **RECOMENDAÇÃO:** o próximo movimento é transformar o checklist em uma sessão por séries, preservando a simplicidade e o modo local (`src/App.jsx:243-287`, `src/data.js:13-179`).

### TOP 5 ações por impacto no treino × esforço

#### 1. Registrar séries reais com IDs estáveis — esforço M

- **FATO — Problema:** exercício é string, identidade é índice e um checkbox representa o exercício inteiro (`src/data.js:13-148`, `src/App.jsx:102-108`, `src/App.jsx:243-262`).
- **RISCO — Impacto:** este é o maior bloqueio para progressão e para confiar no app como diário, pois o estado atual não armazena nenhum resultado de série (`src/App.jsx:73-78`, `src/App.jsx:102-108`).
- **RECOMENDAÇÃO — Solução:** fixar a ficha em exercícios com ID; criar sessão do dia com séries contendo `kg`, `reps`, `RIR`, `doneAt` e nota opcional; pré-preencher a próxima série e persistir a cada confirmação (`src/App.jsx:73-91`, `src/App.jsx:243-266`).
- **RECOMENDAÇÃO — Arquivos envolvidos:** `src/data.js`, `src/App.jsx` e um módulo novo de storage/sessão, separando o que hoje está concentrado no componente (`src/App.jsx:55-132`, `src/data.js:13-179`).

#### 2. Mostrar última sessão e sugerir progressão — esforço M

- **FATO — Problema:** o histórico não guarda exercícios nem desempenho (`src/App.jsx:128-131`).
- **RISCO — Impacto:** o usuário precisa lembrar ou anotar fora do app, porque o histórico atual contém apenas data, título e total (`src/App.jsx:128-131`).
- **RECOMENDAÇÃO — Solução:** exibir carga/reps/RIR anteriores ao lado da série atual e sugerir incremento somente quando todas as séries atingirem o topo da faixa com o RIR alvo; deixar gráficos para depois (`src/App.jsx:243-275`, `src/data.js:13-148`).
- **RECOMENDAÇÃO — Arquivos envolvidos:** `src/App.jsx` e módulo novo de histórico/progressão, extraindo a gravação hoje embutida no componente (`src/App.jsx:121-132`).

#### 3. Tornar a sessão confiável offline e entre dias — esforço M

- **FATO — Problema:** data mistura UTC/local, gravação pode falhar sem tratamento e não existe cache offline/backup (`src/App.jsx:8-34`, `index.html:1-14`).
- **RISCO — Impacto:** marcações podem cair na data errada ou desaparecer ao trocar/limpar o navegador (`src/App.jsx:8-10`, `src/App.jsx:25-34`).
- **RECOMENDAÇÃO — Solução:** chave de data local, sessão versionada, recuperação explícita, exportar/importar JSON e PWA com cache do shell; sincronização em nuvem não é necessária agora (`src/App.jsx:25-34`, `src/App.jsx:73-91`).
- **RECOMENDAÇÃO — Arquivos envolvidos:** `src/App.jsx`, `index.html` e novos `manifest`/service worker/módulo de storage; atualmente o HTML não registra recursos de PWA (`index.html:1-14`).

#### 4. Otimizar o uso com uma mão e adicionar descanso — esforço P/M

- **FATO — Problema:** controles repetidos têm 22–23 px e não há timer (`src/App.css:90-102`, `src/App.css:148-158`, `src/App.jsx:243-262`).
- **RISCO — Impacto:** mais erros de toque e necessidade de alternar para outro cronômetro no meio do treino (`src/App.jsx:243-287`, `src/App.css:90-102`).
- **RECOMENDAÇÃO — Solução:** linha inteira tocável, alvos mínimos de 44 px, exercício ativo em destaque e timer iniciado ao concluir série, com `+30 s` e encerrar (`src/App.jsx:243-287`).
- **RECOMENDAÇÃO — Arquivos envolvidos:** `src/App.jsx` e `src/App.css`, onde controles e dimensões estão definidos (`src/App.jsx:243-287`, `src/App.css:88-185`).

#### 5. Exibir histórico útil, frequência e volume semanal — esforço M

- **FATO — Problema:** o histórico é mínimo, invisível e duplicável (`src/App.jsx:121-132`).
- **RISCO — Impacto:** o app não mostra consistência nem distribuição de estímulo por grupo, porque não lê o histórico nem registra séries realizadas (`src/App.jsx:121-132`, `src/App.jsx:179-358`).
- **RECOMENDAÇÃO — Solução:** após o registro por série, calcular sessões/semana, séries concluídas por grupo e PRs recentes; tornar a conclusão idempotente (`src/data.js:150-159`, `src/App.jsx:121-132`).
- **RECOMENDAÇÃO — Arquivos envolvidos:** `src/App.jsx`, `src/data.js` e módulo novo de histórico, usando os grupos já definidos na ficha (`src/data.js:150-159`, `src/App.jsx:121-132`).

### Quick wins — menos de 1 hora cada

- **RECOMENDAÇÃO:** gerar `AAAA-MM-DD` com componentes locais em vez de `toISOString()` (`src/App.jsx:8-10`).
- **RECOMENDAÇÃO:** impedir duplicata no histórico e concluir a sessão automaticamente quando o último exercício for marcado (`src/App.jsx:121-132`, `src/App.jsx:140-143`).
- **RECOMENDAÇÃO:** pedir confirmação antes de resetar e não apagar dieta junto com treino sem explicar (`src/App.jsx:134-138`, `src/App.jsx:284-286`).
- **RECOMENDAÇÃO:** aumentar checkbox e botões de carga para pelo menos 44 px de altura/área tocável (`src/App.css:90-102`, `src/App.css:148-158`).
- **RECOMENDAÇÃO:** corrigir a semana `0/6` em 1º de janeiro (`src/data.js:184-195`).
- **RECOMENDAÇÃO:** comprimir/substituir o fundo de aproximadamente 736 KB e testar o blur em celular modesto (`src/App.css:32-38`, `src/App.css:65-80`).

### Riscos críticos

- **RISCO CRÍTICO — Integridade por data:** após 21h em Fortaleza, a chave UTC pode antecipar o dia e misturar marcações entre treinos diferentes (`src/App.jsx:8-10`, `src/App.jsx:20-23`, `src/App.jsx:73-91`).
- **RISCO CRÍTICO — Durabilidade:** todo o histórico depende de `localStorage`, sem backup/exportação; limpar o site ou trocar de aparelho perde os dados (`src/App.jsx:25-34`, `src/App.jsx:128-131`).
- **RISCO CRÍTICO — Adequação ao objetivo:** o modelo atual não armazena o estímulo executado; continuar adicionando gráficos ou gamificação antes de séries/carga/reps apenas decoraria dados insuficientes (`src/App.jsx:73-78`, `src/App.jsx:243-262`).

### Depois — não fazer agora

- **RECOMENDAÇÃO:** gráficos avançados e comparações por período, somente após haver histórico confiável (`src/App.jsx:128-131`).
- **RECOMENDAÇÃO:** medidas corporais, fotos e metas de peso; esses dados não fazem parte do estado atual (`src/App.jsx:73-86`).
- **RECOMENDAÇÃO:** editor completo de rotinas e biblioteca rica; primeiro validar a ficha pessoal (`src/data.js:13-179`).
- **RECOMENDAÇÃO:** login, backend e sincronização em nuvem; primeiro endurecer o modo local (`src/App.jsx:25-34`).
- **RECOMENDAÇÃO:** streaks, notificações e gamificação; primeiro garantir que concluir sessão seja confiável (`src/App.jsx:121-132`).

### Próximo passo único

**RECOMENDAÇÃO:** implementar uma única sessão de treino versionada, local e retomável, com IDs estáveis e registro por série de carga, reps e RIR. Isso desbloqueia imediatamente a comparação com a última sessão, progressão, PRs, volume e histórico sem exigir backend; nenhum desses recursos é confiável com o estado atual (`src/data.js:13-179`, `src/App.jsx:73-91`, `src/App.jsx:243-287`).
