// =======================
// ESTADO GLOBAL
// =======================
let xp = Number(localStorage.getItem("xp")) || 0
let currentLessonIndex = Number(localStorage.getItem("lessonIndex")) || 0
let currentChallengeIndex = 0
let completedLessons =
  JSON.parse(localStorage.getItem("completedLessons")) || []
let activeChallenges = []
let collection = JSON.parse(localStorage.getItem("collection")) || []
const sounds = {
  correct: new Audio("assets/sound-correct.mp3"),
  wrong: new Audio("assets/sound-wrong.mp3"),
  transition: new Audio("assets/sound-transition.mp3")
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

document.getElementById("collectionBtn").onclick = openCollection

// =======================
// LIÇÕES — FASE 1 (DINO)
// =======================
const dino = {
  img: document.getElementById("dinoImg"),
  set(expression) {
    this.img.src = `assets/dino-${expression}.png`
    this.img.classList.remove("dino-react")
    void this.img.offsetWidth // restart animation
    this.img.classList.add("dino-react")
  }
}

const dinoSpeech = {
  introPhase:`
    Oi neném! Eu sou o Spike 💜  
    Eu vou te acompanhar nessa aventura pela matemática.
    Sei que sou um dragão, mas serei seu guia na ilha dos dinossauros hehehe.
    Vamos aprender juntos?
    E também vamos ganhar uns coisas legais pelo caminho! 😉`,
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

const lessons = [
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

const cards = {
  contagem: {
    id: "t-rex",
    title: "Tyrannosaurus Rex",
    image: "assets/cards/t-rex.png",
    fact: "O T-Rex tinha cerca de 60 dentes afiados. Vamos contar quantos aparecem na imagem!"
  },

  soma: {
    id: "triceratops",
    title: "Triceratops",
    image: "assets/cards/triceratops.png",
    fact: "O Triceratops tinha 3 chifres. Se juntarmos 2 Triceratops, quantos chifres teremos ao todo?"
  },

  subtracao: {
    id: "stegosaurus",
    title: "Stegosaurus",
    image: "assets/cards/stegosaurus.png",
    fact: "O Stegosaurus tinha 17 placas nas costas. Se 5 forem escondidas, quantas ainda podemos ver?"
  },

  multiplicacao: {
    id: "velociraptor",
    title: "Velociraptor",
    image: "assets/cards/velociraptor.png",
    fact: "Velociraptores caçavam em grupos de 4. Se houverem 3 grupos, quantos dinossauros são ao todo?"
  },

  divisao: {
    id: "brachiosaurus",
    title: "Brachiosaurus",
    image: "assets/cards/brachiosaurus.png",
    fact: "O Brachiosaurus podia comer até 400 kg de plantas por dia. Se dividir igualmente em 4 partes, quanto fica cada uma?"
  }
}

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
  localStorage.setItem("lessonIndex", currentLessonIndex)
  localStorage.setItem(
    "completedLessons",
    JSON.stringify(completedLessons)
  )
  localStorage.setItem(
    "collection",
    JSON.stringify(collection)
  )
}

function saveCollection() {
  localStorage.setItem("collection", JSON.stringify(collection))
}

function rewardCard(lessonId) {
  const card = cards[lessonId]
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
  const percent = (currentLessonIndex / lessons.length) * 100
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
    <small>🦖 Progresso da Ilha dos Dinossauros</small>
  `
}

function renderSidebar() {
  const sidebar = document.getElementById("sidebar")

  sidebar.innerHTML = `
    <h3>🦖 Fase 1: Dinosauros</h3>
    ${lessons
      .map((lesson, index) => {
        const isDone = completedLessons.includes(lesson.id)
        const isLocked = index > currentLessonIndex

        return `
          <div
            class="lesson-item
              ${isDone ? "lesson-done" : ""}
              ${isLocked ? "lesson-locked" : ""}"
            onclick="${
              !isLocked ? `goToLesson(${index})` : ""
            }"
          >
            ${lesson.title}
            ${isDone ? " ✅" : ""}
            ${isLocked ? " 🔒" : ""}
          </div>
        `
      })
      .join("")}
    <button onclick="resetProgress()" style="margin-top:20px; background:#f65c5c; font-size:14px; font-weight:normal; height:auto;">
      Redefinir Progresso
    </button>
  `
}

function goToLesson(index) {
  currentLessonIndex = index
  currentChallengeIndex = 0
  saveProgress()
  startPhase()
  sidebar.classList.remove("mobile-open")
}

function getProgressLevel() {
  const total = lessons.length
  const done = completedLessons.length
  const ratio = done / total

  if (ratio <= 0.34) return "start"
  if (ratio <= 0.75) return "middle"
  return "almost"
}

function commentProgress() {
  const level = getProgressLevel()
  const lines = dinoSpeech.progress[level]
  const message = lines[Math.floor(Math.random() * lines.length)]

  const expression =
    level === "almost" ? "win" : "happy"

  dino.set(expression)
  setSpeech(message)
}

function resetProgress() {
  if (confirm("Tem certeza que deseja redefinir seu progresso? O jogo será reiniciado.")) {
    xp = 0
    currentLessonIndex = 0
    completedLessons = []
    collection = []
    saveProgress()
    location.reload()
  }
}

function showPhaseScreen({ text, button, expression, onConfirm }) {
  introText.textContent = text
  introBtn.textContent = button
  introDino.src = `assets/dino-${expression}.png`

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

// =======================
// MAPA
// =======================
function startPhase() {
  if (currentLessonIndex === 0) {
    showPhaseScreen({
      text: dinoSpeech.introPhase,
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
  currentChallengeIndex = 0

  if (completedLessons.length > 0) {
    commentProgress()
  }

  if (currentLessonIndex >= lessons.length) {
    setSpeech(dinoSpeech.map)
    playSound("transition")
    document.getElementById("screen").className = "fade"
    document.getElementById("screen").innerHTML = `
      <h2>🎉 FASE 1 COMPLETA! PARABÉNS 👏</h2>
      <p>🦖 Spike está orgulhoso de você 💜</p>
      <p>😄 Você é muito boa em fazer contas</p>
      <p>🐋 Oceano desbloqueado em breve...</p>
    `
    dino.set("win")
    showPhaseScreen({
      text: dinoSpeech.endPhase,
      button: "Continuar",
      expression: "win"
    })
    return
  }

  dino.set("idle")
  setSpeech(dinoSpeech.map)
  playSound("transition")
  document.getElementById("screen").className = "fade"
  document.getElementById("screen").innerHTML = `
    <h2>🗺️ Ilha dos Dinossauros</h2>
    <p>${lessons[currentLessonIndex].title}</p>
    <button onclick="startLesson()">Começar</button>
  `
}

// =======================
// LIÇÃO
// =======================
function startLesson() {
  currentChallengeIndex = 0
  const lesson = lessons[currentLessonIndex]
  activeChallenges = getRandomChallenges(lesson.challenges, 5)
  renderChallenge()
}

function renderChallenge() {
  const challenge = activeChallenges[currentChallengeIndex]

  dino.set("idle")
  setSpeech(lessons[currentLessonIndex].story)
  document.getElementById("screen").className = "fade"
  document.getElementById("screen").innerHTML = `
    <h2>${challenge.question}</h2>
    <div id="optionsButons">
    ${challenge.options
      .map(
        opt => `
        <button onclick="checkAnswer(${opt})">
          ${opt}
        </button>
      `
      )
      .join("")}
    </div>
    <p id="feedback" style="margin-top:10px;"></p>
  `
}

function checkAnswer(option) {
  const lesson = lessons[currentLessonIndex]
  const challenge = activeChallenges[currentChallengeIndex]
  const feedback = document.getElementById("feedback")

  if (option === challenge.answer) {
    playSound("correct")
    dino.set("happy")
    setSpeech(
      dinoSpeech.correct[
        Math.floor(Math.random() * dinoSpeech.correct.length)
      ]
    )

    currentChallengeIndex++

    if (currentChallengeIndex >= activeChallenges.length) {
      xp += lesson.xp

      if (!completedLessons.includes(lesson.id)) {
        completedLessons.push(lesson.id)
      }

      currentLessonIndex = Math.max(
        currentLessonIndex,
        lessons.findIndex(l => l.id === lesson.id) + 1
      )

      saveProgress()
      renderProgress()
      renderPhaseBar()
      renderSidebar()

      dino.set("win")
      showCongratsMessage(
        dinoSpeech.finishLesson,
        () => {
          commentProgress()
          rewardCard(lesson.id)
          setTimeout(startPhase, LONG_READ_TIME)
        }
      )
    } else {
      showCongratsMessage(
        dinoSpeech.correct[
          Math.floor(Math.random() * dinoSpeech.correct.length)
        ],
        renderChallenge
      )
    }
  } else {
    playSound("wrong")
    dino.set("sad")
    setSpeech(
      dinoSpeech.wrong[
        Math.floor(Math.random() * dinoSpeech.wrong.length)
      ]
    )
  }
}

// =======================
// INICIALIZAÇÃO
// =======================
renderProgress()
renderPhaseBar()
renderSidebar()
startPhase ()

