// =======================
// PurpleMath - lógica principal do jogo
// Arquivo: script.js
// Responsabilidades: estado do jogo, fases, lições, progresso e UI
// =======================
// ESTADO GLOBAL
// =======================
let xp = Number(localStorage.getItem("xp")) || 0
let currentChallengeIndex = 0
let activeChallenges = []
let collection = JSON.parse(localStorage.getItem("collection")) || []
const sounds = {
  correct: new Audio("assets/sound-correct.mp3"),
  wrong: new Audio("assets/sound-wrong.mp3"),
  transition: new Audio("assets/sound-transition.mp3"),
  reward: new Audio("assets/sound-reward.mp3")
}
const READ_TIME = 1800 // ms → 1.8 segundos (ajuste se quiser)
const LONG_READ_TIME = 2500 // ms → 2.5 segundos (ajuste se quiser)
const introScreen = document.getElementById("introScreen")
const introText = document.getElementById("introText")
const introBtn = document.getElementById("introBtn")
const introDino = document.getElementById("introDino")
const collectionScreen = document.getElementById("collectionScreen")
const cardGrid = document.getElementById("cardGrid")
const cardDetail = document.getElementById("cardDetail")
const rewardOverlay = document.getElementById("rewardOverlay")
const rewardImg = document.getElementById("rewardImg")
const rewardTitle = document.getElementById("rewardTitle")
const rewardBtn = document.getElementById("rewardBtn")

window.addEventListener('load', () => {
  // restaura progresso por fase (se houver)
  Object.values(phases).forEach(phase => {
    const saved = JSON.parse(localStorage.getItem(`progress-${phase.id}`))
    if (saved) phase.progress = saved
  })

  // restaura a fase ativa (se salva) ou inicia em 'terra'
  const savedPhaseId = localStorage.getItem('currentPhaseId')
  if (savedPhaseId && phases[savedPhaseId]) {
    currentPhase = phases[savedPhaseId]
  } else {
    currentPhase = phases.terra
  }

  // sincroniza guia e tema
  setGuide(currentPhase.guide, currentPhase.guide)

  // render inicial
  renderProgress()
  renderPhaseBar()
  renderSidebar()
  enterPhase(currentPhase.id)
})

document.getElementById("collectionBtn").onclick = openCollection

// =======================
// LIÇÕES — FASE 1 (DINO)
// =======================
let guide = {
  name: "dino",
  img: document.getElementById("dinoImg"),
  prefix: "dino",
  set(expression) {
    this.img.src = `assets/${this.prefix}-${expression}.png`
    this.img.classList.remove("dino-react")
    void this.img.offsetWidth
    this.img.classList.add("dino-react")
  }
}

const dinoSpeech = {
  introPhase:`
    Oi neném! Eu sou o Spike 💜  
    Eu vou te acompanhar nessa aventura pela matemática.
    Sei que sou um dragão, mas serei seu guia na ilha dos dinossauros hehehe.
    Vamos aprender juntos?
    E também vamos ganhar umas coisinhas legais pelo caminho! 😉`,
  map: "Que tal começar uma lição? 💜",
  correct: [
    "Issooo! Mandou muito bem ✨",
    "Eu sabia que você ia conseguir!",
    "Aprender assim é mais gostoso 😄"
  ],
  wrong: [
    "Tudo bem errar 💜 tenta de novo!",
    "Sem pressa, eu tô aqui!",
    "Quase! Você é boa!."
  ],
  progress: {
    start: [
      "Ei, você já começou! Isso é o mais importante 💜",
      "Primeiro passo dado! Estou orgulhoso de você. ✨"
    ],
    middle: [
      "Olha só quanto você já avançou! 🚀",
      "Você está pegando o jeito, hein?",
      "Tá vendo como matemática pode ser mais leve? 😄"
    ],
    almost: [
      "Uau! Parabéns você chegou até o aqui! 🏁",
      "Eu sabia que você ia conseguir! ✨",
      "Você chegou muito longe, parabéns! 🎉"
    ]
  },
  finishLesson: "Uau! Lição completa 🎉",
  endPhase:`
    Uau! Você mandou muito bem! 🎉  
    Estou orgulhoso de você.
    Matemática fica muito mais fácil quando a gente vai com calma.
    Preparada para a próxima aventura?`
}

const whaleSpeech = {
  introPhase: `
    Olá... 🌊  
    Eu sou a Baleia Jubarte 🐋  
    No oceano, tudo tem ritmo, calma e profundidade.
    Vamos aprender matemática no nosso tempo?
    `,
  map: "Que tal começar uma lição? 💜",
  correct: [
    "Muito bem... você sentiu o ritmo 🌊",
    "Excelente! Vamos seguir a corrente."
  ],
  wrong: [
    "Tudo bem... vamos tentar de novo com calma.",
    "Sem pressa. O oceano ensina paciência."
  ],
  progress: {
    start: [
      "Ei, você já começou! Isso é o mais importante 💜",
      "Primeiro passo dado! Estou orgulhoso de você. ✨"
    ],
    middle: [
      "Olha só quanto você já avançou! 🚀",
      "Você está pegando o jeito, hein?",
      "Tá vendo como matemática pode ser mais leve? 😄"
    ],
    almost: [
      "Uau! Parabéns você chegou até o aqui! 🏁",
      "Eu sabia que você ia conseguir! ✨",
      "Você chegou muito longe, parabéns! 🎉"
    ]
  },
  finishLesson: "Você navegou muito bem por essa lição 🌊",
  endPhase: "Que jornada linda pelo oceano... Estou orgulhosa de você 🐋💜"
}

const spidermanSpeech = {
  introPhase: `
    Ei! Eu sou o Homem-Aranha! 🕷️💙  
    Em Nova York, preciso calcular tudo: distâncias, ângulos, formas!
    Vamos aprender geometria enquanto salvo a cidade?
    Com grandes poderes vem grande matemática! 💪`,
  map: "Que tal começar mais uma aventura? 🕷️",
  correct: [
    "Excelente! Você é um herói! 💙",
    "Isso aí! Teia perfeita! 🕸️",
    "Muito bem! Nova York precisa de você!"
  ],
  wrong: [
    "Tente de novo, herói! 🕷️",
    "Errou, mas você consegue!",
    "Sem problema, estou aqui com você!"
  ],
  progress: {
    start: [
      "Ótimo! Você começou sua jornada heróica! 💙",
      "Primeiro passo para se tornar um grande herói!"
    ],
    middle: [
      "Olha só como você está aprendendo! 🕸️",
      "Você está ficando rápido como uma aranha!",
      "Nova York vê seu progresso!"
    ],
    almost: [
      "Quase lá, herói! 🎯",
      "Você é incrível! 🦸",
      "Parabéns! Você está salvando o dia! 🌃"
    ]
  },
  finishLesson: "Lição completada! Você é um gênio! 🕷️💙",
  endPhase: "Parabéns, herói! Você conquistou Nova York! 🌃✨"
}

const terraLessons = [
  {
    id: "contagem",
    title: "🦴 Contando fósseis",
    story: "Quantos ossos de dinossauro temos aqui 💜",
    challenges: [
      { question: "🦴 ", options: [2, 3, 1], answer: 1 },
      { question: "🦴 🦴", options: [1, 2, 3], answer: 2 },
      { question: "🦴 🦴 🦴 ", options: [3, 4, 5], answer: 3 },
      { question: "🦴 🦴 🦴 🦴", options: [3, 4, 5], answer: 4 },
      { question: "🦴 🦴 🦴 🦴 🦴", options: [5, 6, 4], answer: 5 },
      { question: "🦴 🦴 🦴 🦴 🦴 🦴", options: [3, 6, 5], answer: 6 },
      { question: "🦴 🦴 🦴 🦴 🦴 🦴 🦴", options: [7, 4, 2], answer: 7 },
      { question: "🦴 🦴 🦴 🦴 🦴 🦴 🦴 🦴", options: [10, 8, 5], answer: 8 },
      { question: "🦴 🦴 🦴 🦴 🦴 🦴 🦴 🦴 🦴", options: [9, 2, 5], answer: 9 },
      { question: "🦴 🦴 🦴 🦴 🦴 🦴 🦴 🦴 🦴 🦴", options: [1, 4, 10], answer: 10 }
    ],
    xp: 15
  },
  {
    id: "soma",
    title: "➕ Juntando fósseis",
    story: "Achei mais ossos de dinossauro, vamos juntar tudo!",
    challenges: [
      { question: "Eu tinha 2 ossos, achei mais 1. <br><br> 🦴🦴 + 🦴 <br><br> Quantos ossos eu tenho agora?", options: [2, 3, 4], answer: 3 },
      { question: "Eu tinha 3 ossos, achei mais 2. <br><br> 🦴🦴🦴 + 🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [4, 5, 6], answer: 5 },
      { question: "Eu tinha 4 ossos, achei mais 3. <br><br> 🦴🦴🦴🦴 + 🦴🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [6, 7, 8], answer: 7 },
      { question: "Eu tinha 2 ossos, achei mais 2. <br><br> 🦴🦴 + 🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [2, 3, 4], answer: 4 },
      { question: "Eu tinha 1 ossos, achei mais 4. <br><br> 🦴 + 🦴🦴🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [2, 5, 4], answer: 5 },
      { question: "Eu tinha 5 ossos, achei mais 5. <br><br> 🦴🦴🦴🦴🦴 + 🦴🦴🦴🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [7, 3, 10], answer: 10 },
      { question: "Eu tinha 2 ossos, achei mais 5. <br><br> 🦴🦴 + 🦴🦴🦴🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [7, 6, 4], answer: 7 },
      { question: "Eu tinha 3 ossos, achei mais 6. <br><br> 🦴🦴🦴 + 🦴🦴🦴🦴🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [1, 5, 9], answer: 9 },
      { question: "Eu tinha 6 ossos, achei mais 1. <br><br> 🦴🦴🦴🦴🦴🦴 + 🦴 <br><br> Quantos ossos eu tenho agora?", options: [5, 7, 4], answer: 7 },
      { question: "Eu tinha 7 ossos, achei mais 2. <br><br> 🦴🦴🦴🦴🦴🦴🦴 + 🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [9, 10, 6], answer: 9 }
    ],
    xp: 20
  },
  {
    id: "subtracao",
    title: "➖ Perdendo fósseis",
    story: "Ah não! Eu perdi alguns ossos de dinossauro!",
    challenges: [
      { question: "Eu tinha 5 ossos, perdi 1. <br><br> 🦴🦴🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 4, 5], answer: 4 },
      { question: "Eu tinha 6 ossos, perdi 2. <br><br> 🦴🦴❌🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 4, 5], answer: 4 },
      { question: "Eu tinha 7 ossos, perdi 3. <br><br> 🦴❌❌🦴🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 4, 5], answer: 4 },
      { question: "Eu tinha 9 ossos, perdi 3. <br><br> 🦴❌🦴🦴❌🦴🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [6, 4, 5], answer: 6 },
      { question: "Eu tinha 5 ossos, perdi 3. <br><br> ❌❌🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 8, 2], answer: 2 },
      { question: "Eu tinha 4 ossos, perdi 2. <br><br> 🦴❌🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 2, 1], answer: 2 },
      { question: "Eu tinha 9 ossos, perdi 5. <br><br> ❌🦴❌❌🦴❌🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [4, 7, 5], answer: 4 },
      { question: "Eu tinha 7 ossos, perdi 4. <br><br> 🦴❌❌🦴❌🦴❌ <br><br> Quantos ossos sobraram?", options: [2, 4, 3], answer: 3 },
      { question: "Eu tinha 2 ossos, perdi 1. <br><br> 🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 6, 1], answer: 1 },
      { question: "Eu tinha 8 ossos, perdi 2. <br><br> 🦴🦴❌🦴🦴🦴❌🦴 <br><br> Quantos ossos sobraram?", options: [6, 3, 9], answer: 6 }
    ],
    xp: 20
  },
  {
    id: "multiplicacao",
    title: "✖️ Ninho de ovos",
    story: "Olha que legal! Encontrei alguns ninhos de dinossauros! 🥚",
    challenges: [
    { question: "Aqui tem 2 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [2, 4, 6], answer: 4 },
    { question: "Aqui tem 3 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [4, 6, 8], answer: 6 },
    { question: "Aqui tem 4 ninhos com 3 ovos em cada um.<br><br> [🥚🥚🥚] [🥚🥚🥚]<br>[🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos temos?", options: [12, 15, 9], answer: 12 },
    { question: "Aqui tem 5 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚] [🥚🥚]<br>[🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [12, 8, 10], answer: 10 },
    { question: "Aqui tem 3 ninhos com 3 ovos em cada um.<br><br> [🥚🥚🥚] [🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos temos?", options: [6, 9, 12], answer: 9 },
    { question: "Aqui tem 6 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚] [🥚🥚]<br>[🥚🥚] [🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [12, 8, 14], answer: 12 },
    { question: "Aqui tem 4 ninhos com 4 ovos em cada um.<br><br> [🥚🥚🥚🥚] [🥚🥚🥚🥚]<br>[🥚🥚🥚🥚] [🥚🥚🥚🥚]<br><br>Quantos ovos temos?", options: [12, 11, 16], answer: 16 },
    { question: "Aqui tem 2 ninhos com 5 ovos em cada um.<br><br> [🥚🥚🥚🥚🥚]<br>[🥚🥚🥚🥚🥚]<br><br>Quantos ovos temos?", options: [8, 10, 12], answer: 10 },
    { question: "Aqui tem 7 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚] [🥚🥚] [🥚🥚]<br>[🥚🥚] [🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [14, 12, 16], answer: 14 },
    { question: "Aqui tem 5 ninhos com 3 ovos em cada um.<br><br> [🥚🥚🥚] [🥚🥚🥚] [🥚🥚🥚]<br>[🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos temos?", options: [12, 10, 15], answer: 15 }
  ],
    xp: 25
  },
  {
    id: "divisao",
    title: "➗ Dividindo fósseis",
    story: "Humm, tem alguns ovos fora do ninho. Vamos colocar no lugar!",
    challenges: [
      { question: "Temos 4 ovos e 2 ninhos.<br><br>[🥚🥚] [🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [1, 2, 3], answer: 2 },
      { question: "Temos 6 ovos e 3 ninhos.<br><br>[🥚🥚] [🥚🥚] [🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [1, 3, 2], answer: 2 },
      { question: "Temos 8 ovos e 4 ninhos.<br><br>[🥚🥚] [🥚🥚]<br>[🥚🥚] [🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [2, 1, 3], answer: 2 },
      { question: "Temos 10 ovos e 5 ninhos.<br><br>[🥚🥚] [🥚🥚] [🥚🥚]<br>[🥚🥚] [🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [1, 2, 3], answer: 2 },
      { question: "Temos 12 ovos e 6 ninhos.<br><br>[🥚🥚] [🥚🥚] [🥚🥚]<br>[🥚🥚] [🥚🥚] [🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [3, 1, 2], answer: 2 },
      { question: "Temos 9 ovos e 3 ninhos.<br><br>[🥚🥚🥚] [🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [2, 3, 4], answer: 3 },
      { question: "Temos 12 ovos e 4 ninhos.<br><br>[🥚🥚🥚] [🥚🥚🥚]<br>[🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [2, 5, 3], answer: 3 },
      { question: "Temos 15 ovos e 5 ninhos.<br><br>[🥚🥚🥚] [🥚🥚🥚] [🥚🥚🥚]<br>[🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [3, 6, 4], answer: 3 },
      { question: "Temos 16 ovos e 4 ninhos.<br><br>[🥚🥚🥚🥚] [🥚🥚🥚🥚]<br>[🥚🥚🥚🥚] [🥚🥚🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [3, 1, 4], answer: 4 },
      { question: "Temos 18 ovos e 6 ninhos.<br><br>[🥚🥚🥚] [🥚🥚🥚] [🥚🥚🥚]<br>[🥚🥚🥚] [🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos ficaram em cada ninho?", options: [3, 8, 1], answer: 3 }
    ],
    xp: 25
  }
]

const oceanLessons = [
  {
    id: "fractions-intro",
    title: "Partes do Oceano",
    story: "Entendendo frações com a baleia jubarte",
    challenges: [
      {question: "A baleia comeu 1 de 2 cardumes iguais. Isso representa:",options: ["1/3", "1/2", "2/1"],answer: "1/2"},
      {question: "Se o oceano fosse dividido em 4 partes iguais, uma parte seria:",options: ["1/2", "1/4", "4/1"],answer: "1/4"},
      {question: "A jubarte nadou 3 partes de um total de 5. Qual fração?",options: ["3/5", "5/3", "2/5"],answer: "3/5"},
      {question: "Qual fração representa metade de um coral?",options: ["1/3", "1/2", "2/4"],answer: "1/2"},
      {question: "2 pedaços de um total de 8 peixes é:",options: ["2/8", "1/4", "4/8"],answer: "2/8"}
    ],
    xp: 50
  },
  {
    id: "fractions-equivalent",
    title: "Frações Equivalentes",
    story: "Porções diferentes, mesmo tamanho",
    challenges: [
      {question: "2/4 do oceano é o mesmo que:",options: ["1/2", "3/4", "4/2"],answer: "1/2"},
      {question: "A jubarte nadou 3/6 do percurso. Isso equivale a:",options: ["1/2", "2/3", "6/3"],answer: "1/2"},
      {question: "Qual é equivalente a 1/2?",options: ["2/4", "3/6", "4/8"],answer: "2/4"},
      {question: "4/8 dos peixes é o mesmo que:",options: ["1/2", "1/4", "2/8"],answer: "1/2"},
      {question: "Frações equivalentes representam:",options: ["Quantidades diferentes","O mesmo valor","Valores maiores"],answer: "O mesmo valor"}
    ],
    xp: 30
  },
  {
    id: "decimal-intro",
    title: "Decimais no Oceano",
    story: "Frações em forma decimal",
    challenges: [
      {question: "1/2 em decimal é:",options: ["0.5", "0.2", "1.2"],answer: "0.5"},
      {question: "A jubarte nadou 0.5 do percurso. Isso é:",options: ["1/4", "1/2", "2/5"],answer: "1/2"},
      {question: "0.25 representa:",options: ["1/2", "1/4", "3/4"],answer: "1/4"},
      {question: "Qual decimal representa metade?",options: ["0.2", "0.5", "0.75"],answer: "0.5"},
      {question: "1/10 em decimal é:",options: ["0.1", "1.0", "0.01"],answer: "0.1"}
    ],
    xp: 40
  },
  {
    id: "decimal-comparison",
    title: "Comparando Decimais",
    story: "Quem nadou mais?",
    challenges: [
      {question: "0.7 é maior que 0.5?",options: ["Sim", "Não"],answer: "Sim"},
      {question: "Qual é maior?",options: ["0.3", "0.8", "0.5"],answer: "0.8"},
      {question: "0.25 é menor que 0.5?",options: ["Sim", "Não"],answer: "Sim"},
      {question: "Qual percurso é maior?",options: ["0.6", "0.4"],answer: "0.6"},
      {question: "A jubarte nadou mais em:",options: ["0.9", "0.1"],answer: "0.9"}
    ],
    xp: 35
  },
  {
    id: "fraction-decimal",
    title: "Frações + Decimais",
    story: "Traduzindo o oceano",
    challenges: [
      {question: "Qual fração representa 0.5?",options: ["1/2", "1/4", "2/5"],answer: "1/2"},
      {question: "0.25 corresponde a:",options: ["1/4", "1/2", "3/4"],answer: "1/4"},
      {question: "A jubarte nadou 3/4. Em decimal isso é:",options: ["0.75", "0.25", "0.5"],answer: "0.75"},
      {question: "0.1 equivale a:",options: ["1/10", "1/2", "1/5"],answer: "1/10"},
      {question: "Qual par está correto?",options: ["1/2 = 0.5", "1/4 = 0.4", "3/4 = 0.34"],answer: "1/2 = 0.5"}
    ],
    xp: 60
  }
]

const newyorkLessons = [
  {
    id: "discounts",
    title: "Descontos em NY",
    story: "Lojas oferecem descontos e o herói precisa calcular rápido.",
    challenges: [
      { question: "Um item de 100 com 50% de desconto custa:", options: [50, 75, 25], answer: 50 },
      { question: "20% de desconto significa pagar:", options: ["80%", "20%", "100%"], answer: "80%" },
      { question: "Um ingresso de 200 com 25% off vira:", options: [150, 175, 100], answer: 150 },
      { question: "10% de 50 é:", options: [5, 10, 15], answer: 5 },
      { question: "Metade do preço é:", options: ["50%", "25%", "75%"], answer: "50%" }
    ],
    xp: 10
  },
  {
    id: "shapes-intro",
    title: "Formas de Nova York",
    story: "Os prédios de Nova York têm muitas formas!",
    challenges: [
      {question: "Um prédio tem 4 lados iguais e 4 ângulos retos. É um:",options: ["Triângulo", "Quadrado", "Círculo"],answer: "Quadrado"},
      {question: "Quantos lados tem um triângulo?",options: ["3", "4", "5"],answer: "3"},
      {question: "Um círculo tem quantos vértices?",options: ["0", "1", "∞"],answer: "0"},
      {question: "Um pentágono tem quantos lados?",options: ["4", "5", "6"],answer: "5"},
      {question: "Qual forma tem 6 lados iguais?",options: ["Quadrado", "Triângulo", "Hexágono"],answer: "Hexágono"}
    ],
    xp: 50
  },
  {
    id: "perimeter",
    title: "Perímetro das Ruas",
    story: "Homem-Aranha precisa medir as ruas de Nova York!",
    challenges: [
      {question: "Um quadrado tem lado de 5m. Qual é o perímetro?",options: ["10m", "15m", "20m"],answer: "20m"},
      {question: "Um retângulo tem 6m de comprimento e 4m de largura. Perímetro?",options: ["10m", "20m", "24m"],answer: "20m"},
      {question: "Um triângulo com lados 3, 4 e 5. Perímetro?",options: ["7", "9", "12"],answer: "12"},
      {question: "Um quadrado com perímetro 16m tem lado de:",options: ["2m", "4m", "8m"],answer: "4m"},
      {question: "Um retângulo 8m x 2m tem perímetro de:",options: ["10m", "16m", "20m"],answer: "20m"}
    ],
    xp: 55
  },
  {
    id: "area",
    title: "Área dos Prédios",
    story: "Calculando o espaço dos prédios para proteger!",
    challenges: [
      {question: "Um quadrado com lado 5m tem área de:",options: ["10m²", "20m²", "25m²"],answer: "25m²"},
      {question: "Um retângulo 6m x 4m tem área de:",options: ["10m²", "24m²", "48m²"],answer: "24m²"},
      {question: "Um triângulo com base 8m e altura 6m tem área de:",options: ["14m²", "24m²", "48m²"],answer: "24m²"},
      {question: "Um quadrado com área 36m² tem lado de:",options: ["4m", "6m", "9m"],answer: "6m"},
      {question: "Um retângulo 10m x 5m tem área de:",options: ["15m²", "30m²", "50m²"],answer: "50m²"}
    ],
    xp: 60
  },
  {
    id: "angles",
    title: "Ângulos nas Construções",
    story: "Os ângulos dos prédios ajudam Homem-Aranha a se mover!",
    challenges: [
      {question: "Quantos graus tem um ângulo reto?",options: ["45°", "90°", "180°"],answer: "90°"},
      {question: "Quanto é a soma dos ângulos de um triângulo?",options: ["90°", "180°", "360°"],answer: "180°"},
      {question: "Quanto é a soma dos ângulos de um quadrado?",options: ["180°", "270°", "360°"],answer: "360°"},
      {question: "Um ângulo agudo é menor que:",options: ["45°", "90°", "180°"],answer: "90°"},
      {question: "Dois ângulos retos formam um ângulo de:",options: ["90°", "180°", "270°"],answer: "180°"}
    ],
    xp: 55
  }
]

const terraCards = {
  contagem: {
    id: "t-rex",
    title: "Tiranossauro Rex",
    image: "assets/cards/t-rex.png",
    fact: "O T-Rex tinha cerca de 60 dentes afiados. É muito dente pra contar!"
  },

  soma: {
    id: "triceratops",
    title: "Triceratops",
    image: "assets/cards/triceratops.png",
    fact: "O Triceratops tinha 3 chifres. Se juntássemos 2 Triceratops, teríamos 6 chifres!"
  },

  subtracao: {
    id: "stegosaurus",
    title: "Estegossauro",
    image: "assets/cards/stegosaurus.png",
    fact: "O Estegossauro tinha 17 placas nas costas. Se 5 fossem escondidas, ele teria apenas 12!"
  },

  multiplicacao: {
    id: "velociraptor",
    title: "Velociraptor",
    image: "assets/cards/velociraptor.png",
    fact: "Se Velociraptores caçavam em grupos de 4. Então 3 grupos teriam 12 deles!"
  },

  divisao: {
    id: "brachiosaurus",
    title: "Braquiossauro",
    image: "assets/cards/brachiosaurus.png",
    fact: "O Braquiossauro podia comer até 400 kg de plantas por dia. Se ele dividisse com três filhotes, cada um comeria 100 kg!"
  }
}

const oceanCards = {
  "fractions-intro": {
    id: "jubarte-portion",
    title: "Baleia Jubarte — Partes do Oceano",
    image: "assets/cards/jubarte-1.png",
    fact: "Uma jubarte pode passar metade do dia se alimentando. Metade = 1/2 = 0.5!"
  },

  "fractions-equivalent": {
    id: "jubarte-equivalent",
    title: "Baleia Jubarte — Mesmo Tamanho",
    image: "assets/cards/jubarte-2.png",
    fact: "2/4 do oceano é o mesmo que 1/2. A jubarte não liga para a forma, mas para a quantidade!"
  },

  "decimal-intro": {
    id: "jubarte-decimal",
    title: "Baleia Jubarte — Medidas Precisas",
    image: "assets/cards/jubarte-3.png",
    fact: "Cientistas usam decimais para medir o tempo e distância que a jubarte nada no oceano."
  },

  "decimal-comparison": {
    id: "jubarte-compare",
    title: "Baleia Jubarte — Quem Nadou Mais?",
    image: "assets/cards/jubarte-4.png",
    fact: "0.8 é maior que 0.5. A jubarte sempre escolhe o maior caminho quando quer explorar!"
  },
  
  "fraction-decimal": {
    id: "jubarte-translate",
    title: "Baleia Jubarte — Dois Mundos",
    image: "assets/cards/jubarte-5.png",
    fact: "Frações e decimais são só duas formas diferentes de mostrar a mesma coisa no oceano."
  }
}

const newyorkCards = {
  "discount": {
    id: "spider-discount",
    title: "Descontos Urbanos",
    image: "assets/cards/spiderman-1.png",
    fact: "Calcular descontos rápido é essencial até para heróis no dia a dia."
  },

  "shapes-intro": {
    id: "spider-shapes",
    title: "Homem-Aranha — Formas de Nova York",
    image: "assets/cards/spiderman-2.png",
    fact: "Os prédios de Nova York têm formas incríveis! Quadrados, retângulos e muito mais!"
  },

  "perimeter": {
    id: "spider-perimeter",
    title: "Homem-Aranha — Perímetro das Ruas",
    image: "assets/cards/spiderman-3.png",
    fact: "Para passar pelas ruas de Nova York, Homem-Aranha calcula o perímetro de cada quarteirão!"
  },

  "area": {
    id: "spider-area",
    title: "Homem-Aranha — Área dos Prédios",
    image: "assets/cards/spiderman-4.png",
    fact: "A área do teto de um prédio é crucial para o Homem-Aranha pousar com segurança! 🕷️"
  },

  "angles": {
    id: "spider-angles",
    title: "Homem-Aranha — Ângulos nas Construções",
    image: "assets/cards/spiderman-5.png",
    fact: "Os ângulos ajudam o Homem-Aranha a calcular o melhor caminho entre prédios!"
  }
}

const phases = {
  terra: {
    id: "terra",
    name: "Terra 🦖",
    guide: "dino",
    lessons: terraLessons,
    cards: terraCards,
    progress: {
      completedLessons: [],
      currentLessonIndex: 0
    }
  },

  oceano: {
    id: "oceano",
    name: "Oceano 🐋",
    guide: "whale",
    lessons: oceanLessons,
    cards: oceanCards,
    progress: {
      completedLessons: [],
      currentLessonIndex: 0
    }
  },

  newyork: {
    id: "newyork",
    name: "Nova York 🕷️",
    guide: "spider",
    lessons: newyorkLessons,
    cards: newyorkCards,
    progress: {
      completedLessons: [],
      currentLessonIndex: 0
    }
  }
}
let currentPhase = phases.terra

// =======================
// UTIL
// =======================
const menuToggle = document.getElementById("menuToggle")
const sidebar = document.getElementById("sidebar")

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("mobile-open")
})

function playSound(type) {
  sounds[type].currentTime = 0
  sounds[type].play()
}

function setGuide(name, prefix) {
  guide.name = name
  guide.prefix = prefix
  // atualiza imagem do guia para expressão padrão (idle)
  if (guide.img) {
    guide.img.src = `assets/${guide.prefix}-idle.png`
  }
} 

function setSpeech(text) {
  const speech = document.getElementById("speech")
  speech.innerText = text
}

function showCongratsMessage(message, callback) {
  setSpeech(message)

  const screen = document.getElementById("screen")
  screen.className = "fade"

  setTimeout(() => {
    if (callback) callback()
  }, READ_TIME)
}

function saveProgress() {
  localStorage.setItem("xp", xp)

  // salva progresso de todas as fases (garante que resetProgress persista corretamente)
  Object.values(phases).forEach(phase => {
    localStorage.setItem(
      `progress-${phase.id}`,
      JSON.stringify(phase.progress)
    )
  })

  // salva fase ativa
  localStorage.setItem("currentPhaseId", currentPhase.id)

  // Coleção é global
  localStorage.setItem(
    "collection",
    JSON.stringify(collection)
  )
}

function saveCollection() {
  localStorage.setItem("collection", JSON.stringify(collection))
}

function rewardCard(lessonId) {
  const card = (currentPhase.cards || {})[lessonId]
  if (!card) return

  if (!collection.find(c => c.id === card.id)) {
    collection.push(card)
    saveCollection()
  }
}

function renderProgress() {
  const level = Math.floor(xp / 50) + 1
  document.getElementById("progress").innerHTML = `
    ⭐ Nível ${level} &nbsp;&nbsp; 💜 XP: ${xp}
  `
}

function renderPhaseBar() {
  const total = Math.max(1, currentPhase.lessons.length)
  const percent = Math.round((currentPhase.progress.currentLessonIndex / total) * 100)
  document.getElementById("phaseBar").innerHTML = `
    <div style="
      background:#4c1d95;
      border-radius:12px;
      overflow:hidden;
      margin:10px 0;
    ">
      <div style="
        width:${percent}%;
        background:#a855f7;
        padding:6px;
        transition:0.4s;
      "></div>
    </div>
    <small>${currentPhase.name} — Progresso</small>
  `
} 

function isPhaseUnlocked(phaseId) {
  // regra simples: 'terra' sempre desbloqueada; 'oceano' desbloqueada quando 'terra' completa; 'newyork' quando 'oceano' completa
  if (phaseId === 'terra') return true
  if (phaseId === 'oceano') return phases.terra.progress.currentLessonIndex >= phases.terra.lessons.length
  if (phaseId === 'newyork') return phases.oceano.progress.currentLessonIndex >= phases.oceano.lessons.length
  return true
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar")

  sidebar.innerHTML = `
    <h3>Fases</h3>
    ${Object.keys(phases)
      .map(phaseId => {
        const phase = phases[phaseId]
        const unlocked = isPhaseUnlocked(phaseId)
        const isActive = currentPhase && currentPhase.id === phaseId

        return `
          <div class="phase-item ${isActive ? 'lesson-done' : ''} ${unlocked ? '' : 'lesson-locked'}" onclick="${unlocked ? `enterPhase('${phaseId}')` : ''}">
            ${phase.name} ${isActive ? ' ✅' : ''} ${unlocked ? '' : ' 🔒'}
          </div>

          <div class="phase-lessons">
            ${phase.lessons
              .map((lesson, index) => {
                const isDone = phase.progress.completedLessons.includes(lesson.id)
                const isLockedLesson = index > phase.progress.currentLessonIndex
                const finalLocked = !unlocked || isLockedLesson

                return `
                  <div class="lesson-item ${isDone ? 'lesson-done' : ''} ${finalLocked ? 'lesson-locked' : ''}" onclick="${!finalLocked ? `enterPhase('${phaseId}'); goToLesson(${index})` : ''}">
                    ${lesson.title}
                    ${isDone ? ' ✅' : ''}
                    ${finalLocked ? ' 🔒' : ''}
                  </div>
                `
              })
              .join("")}
          </div>
        `
      })
      .join("")}

    <button onclick="resetProgress()" id="resetBtn">
      Redefinir Progresso
    </button>
  `
} 

function goToLesson(index) {
  currentPhase.progress.currentLessonIndex = index
  currentChallengeIndex = 0
  saveProgress()
  startPhase()
  sidebar.classList.remove("mobile-open")
}

function getProgressLevel() {
  const total = currentPhase.lessons.length
  const done = currentPhase.progress.completedLessons.length
  const ratio = done / total

  if (ratio <= 0.34) return "start"
  if (ratio <= 0.75) return "middle"
  return "almost"
}

function commentProgress() {
  const level = getProgressLevel()
  // usa as falas de progresso do guia atual quando disponíveis
  let speechObj = dinoSpeech
  if (currentPhase.id === 'oceano') speechObj = whaleSpeech
  if (currentPhase.id === 'newyork') speechObj = spidermanSpeech
  
  const lines = (speechObj.progress && speechObj.progress[level]) ? speechObj.progress[level] : (dinoSpeech.progress[level] || [])
  if (!lines || !lines.length) return
  const message = lines[Math.floor(Math.random() * lines.length)]

  const expression = level === "almost" ? "win" : "happy"

  guide.set(expression)
  setSpeech(message)
}

function savePhaseProgress() {
  localStorage.setItem(
    `progress-${currentPhase.id}`,
    JSON.stringify(currentPhase.progress)
  )
}

function resetProgress() {
  if (confirm("Tem certeza que deseja redefinir seu progresso? O jogo será reiniciado.")) {
    xp = 0
    collection = []
    
    // Reseta progresso de todas as fases
    Object.values(phases).forEach(phase => {
      phase.progress.completedLessons = []
      phase.progress.currentLessonIndex = 0
    })
    
    // Volta para a fase inicial
    currentPhase = phases.terra
    
    saveProgress()
    location.reload()
  }
}

/**
 * Alterna para uma fase (por id) e sincroniza UI
 */
function enterPhase(phaseId) {
  currentPhase = phases[phaseId]

  setGuide(currentPhase.guide, currentPhase.guide)

  // atualiza a UI relacionada à fase
  renderSidebar()
  renderPhaseBar()
  renderProgress()

  // persiste a fase atual para evitar que, ao recarregar,
  // a tela de conclusão da fase anterior seja exibida
  saveProgress()

  startPhase()
} 

function showPhaseScreen({ text, button, expression, onConfirm }) {
  introText.textContent = text
  introBtn.textContent = button
  introDino.src = `assets/${guide.prefix}-${expression}.png`

  introScreen.style.display = "flex"

  introBtn.onclick = () => {
    introScreen.style.display = "none"
    if (onConfirm) onConfirm()
  }
}

function getRandomChallenges(allChallenges, amount = 5) {
  const shuffled = [...allChallenges]
    .sort(() => Math.random() - 0.5)

  return shuffled.slice(0, amount)
}

function openCollection() {
  cardGrid.innerHTML = ""

  collection.forEach(card => {
    const el = document.createElement("div")
    el.className = "card"
    el.innerHTML = `
      <img src="${card.image}">
      <p>${card.title}</p>
    `
    el.onclick = () => showCard(card)
    cardGrid.appendChild(el)
  })

  collectionScreen.style.display = "block"
}

function closeCollection() {
  collectionScreen.style.display = "none"
}

function showCard(card) {
  document.getElementById("cardImg").src = card.image
  document.getElementById("cardTitle").textContent = card.title
  document.getElementById("cardFact").textContent = card.fact

  cardDetail.style.display = "flex"
}

function closeCard() {
  cardDetail.style.display = "none"
}

function showReward(card, callback) {
  playSound("reward")
  rewardImg.src = card.image
  rewardTitle.textContent = card.title

  rewardOverlay.style.display = "flex"

  rewardBtn.onclick = () => {
    rewardOverlay.style.display = "none"
    if (callback) callback()
  }
}

// =======================
// MAPA
// =======================
function startPhase() {
  let speechSet = dinoSpeech
  if (currentPhase.id === 'oceano') speechSet = whaleSpeech
  if (currentPhase.id === 'newyork') speechSet = spidermanSpeech

  if (currentPhase.progress.currentLessonIndex === 0) {
    showPhaseScreen({
      text: speechSet.introPhase,
      button: "Começar aventura",
      expression: "idle",
      onConfirm: renderMap
    })
  } else {
    introScreen.style.display = "none"
    renderMap()
  }
} 

function renderMap() {
  let speechSet = dinoSpeech
  if (currentPhase.id === 'oceano') speechSet = whaleSpeech
  if (currentPhase.id === 'newyork') speechSet = spidermanSpeech
  
  currentChallengeIndex = 0

  if (currentPhase.progress.completedLessons.length > 0) {
    commentProgress()
  }

  if (currentPhase.progress.currentLessonIndex >= currentPhase.lessons.length) {
    setSpeech(speechSet.map)
    playSound("transition")
    document.getElementById("screen").className = "fade"
    document.getElementById("screen").innerHTML = `
      <h2>🎉 ${currentPhase.name} COMPLETA! PARABÉNS 👏</h2>
      <p>${guide.name === 'dino' ? '🦖 Spike está orgulhoso de você 💜' : (guide.name === 'spider' ? '🕷️ Homem-Aranha salvou Nova York com você! 💙' : '')}</p>
    `
    guide.set("win")
    // permite transição para a próxima fase quando prevista (ex: terra -> oceano -> newyork)
    let nextPhaseId = null
    if (currentPhase.id === 'terra') nextPhaseId = 'oceano'
    else if (currentPhase.id === 'oceano') nextPhaseId = 'newyork'
    
    if (nextPhaseId) {
      let endPhaseText = dinoSpeech.endPhase
      if (currentPhase.id === 'oceano') endPhaseText = whaleSpeech.endPhase
      
      showPhaseScreen({
        text: endPhaseText,
        button: "Continuar",
        expression: "win",
        onConfirm: () => enterPhase(nextPhaseId)
      })
    }
    return
  } 

  guide.set("idle")
  setSpeech(speechSet.map)
  playSound("transition")
  document.getElementById("screen").className = "fade"
  document.getElementById("screen").innerHTML = `
    <h2>🗺️ ${currentPhase.name}</h2>
    <p>${currentPhase.lessons[currentPhase.progress.currentLessonIndex].title}</p>
    <button onclick="startLesson()">Começar</button>
  `
}

// =======================
// LIÇÃO
// =======================
function startLesson() {
  currentChallengeIndex = 0
  const lesson = currentPhase.lessons[currentPhase.progress.currentLessonIndex]
  activeChallenges = getRandomChallenges(lesson.challenges, 5)
  renderChallenge()
} 

function renderChallenge() {
  const challenge = activeChallenges[currentChallengeIndex]
  if (!challenge) {
    // se não houver desafio (erro), volta para o mapa
    startPhase()
    return
  }

  const lesson = currentPhase.lessons[currentPhase.progress.currentLessonIndex]

  guide.set("idle")
  setSpeech(lesson.story)
  document.getElementById("screen").className = "fade"
  document.getElementById("screen").innerHTML = `
    <h2>${challenge.question}</h2>
    <div id="optionsButons">
    ${challenge.options
      .map(
        opt => `
        <button onclick='checkAnswer(${JSON.stringify(opt)})'>
          ${opt}
        </button>
      `
      )
      .join("")}
    </div>
  `
} 

/**
 * Verifica resposta selecionada para o desafio atual.
 * - Reproduz som e feedback
 * - Avança para o próximo desafio ou conclui a lição
 * - Atualiza XP, coleção e progresso da fase
 */
function checkAnswer(option) {
  const lessonIndex = currentPhase.progress.currentLessonIndex
  const lesson = currentPhase.lessons[lessonIndex]
  const challenge = activeChallenges[currentChallengeIndex]
  if (!challenge) return

  // escolhe o conjunto de falas dependendo do guia ativo
  let speechSet = dinoSpeech
  if (guide.name === 'whale') speechSet = whaleSpeech
  if (guide.name === 'spider') speechSet = spidermanSpeech

  if (option === challenge.answer) {
    playSound("correct")
    guide.set("happy")
    setSpeech(
      speechSet.correct[
        Math.floor(Math.random() * (speechSet.correct || dinoSpeech.correct).length)
      ]
    )

    currentChallengeIndex++

    // terminou a série de desafios da lição
    if (currentChallengeIndex >= activeChallenges.length) {
      xp += lesson.xp

      // marca como concluída (apenas uma vez)
      if (!currentPhase.progress.completedLessons.includes(lesson.id)) {
        currentPhase.progress.completedLessons.push(lesson.id)
      }

      // avança para a próxima lição quando aplicável
      currentPhase.progress.currentLessonIndex = Math.max(
        currentPhase.progress.currentLessonIndex,
        lessonIndex + 1
      )

      saveProgress()
      renderProgress()
      renderPhaseBar()
      renderSidebar()

      guide.set("win")

      // mensagem final e recompensa (se houver)
      showCongratsMessage(
        speechSet.finishLesson || dinoSpeech.finishLesson,
        () => {
          commentProgress()
          const card = (currentPhase.cards || {})[lesson.id]

          if (card) {
            // mostra a recompensa somente se ainda não foi coletada
            const alreadyCollected = collection.find(c => c.id === card.id)
            if (!alreadyCollected) {
              // mostra a recompensa; quando o usuário coletar, adicionamos à coleção
              showReward(card, () => {
                rewardCard(lesson.id)
                saveProgress()
                setTimeout(startPhase, LONG_READ_TIME)
              })
            } else {
              // já coletado — informa e volta ao mapa sem mostrar overlay
              setSpeech("Você já coletou essa figurinha! 🎉")
              setTimeout(startPhase, LONG_READ_TIME)
            }
          } else {
            setTimeout(startPhase, LONG_READ_TIME)
          }
        }
      )
    } else {
      // acerto, continua para próximo desafio
      showCongratsMessage(
        speechSet.correct[Math.floor(Math.random() * speechSet.correct.length)],
        renderChallenge
      )
    }
  } else {
    playSound("wrong")
    guide.set("sad")
    setSpeech(
      speechSet.wrong[Math.floor(Math.random() * speechSet.wrong.length)]
    )
  }
} 

// =======================
// INICIALIZAÇÃO
// =======================
// A inicialização agora ocorre no handler de 'load' para garantir que o DOM e o localStorage
// já estejam prontos antes de sincronizar o estado da aplicação.


