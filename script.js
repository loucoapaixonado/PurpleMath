// =======================
// ESTADO GLOBAL
// =======================
let xp = Number(localStorage.getItem("xp")) || 0
let currentLessonIndex = Number(localStorage.getItem("lessonIndex")) || 0
let currentChallengeIndex = 0
let completedLessons =
  JSON.parse(localStorage.getItem("completedLessons")) || []
const sounds = {
  correct: new Audio("assets/sound-correct.mp3"),
  wrong: new Audio("assets/sound-wrong.mp3"),
  transition: new Audio("assets/sound-transition.mp3")
}
const READ_TIME = 1800 // ms → 1.8 segundos (ajuste se quiser)

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
  welcome: "Oi! Eu sou o Spike. Vamos aprender juntinhos?",
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
  finishLesson: "Uau! Lição completa 🎉",
  finishPhase: "Você completou tudo! Você é muito inteligente! 🦖💜"
}

const lessons = [
  {
    id: "dino_contar",
    title: "🦴 Contando fósseis",
    story: "Quantos ossos de dinossauro temos aqui 💜",
    challenges: [
      { question: "🦴 🦴 🦴", options: [2, 3, 4], answer: 3 },
      { question: "🦴 🦴", options: [1, 2, 3], answer: 2 },
      { question: "🦴 🦴 🦴 🦴", options: [3, 4, 5], answer: 4 }
    ],
    xp: 15
  },
  {
    id: "dino_soma",
    title: "➕ Juntando fósseis",
    story: "Achei mais ossos de dinossauro, vamos juntar tudo!",
    challenges: [
      { question: "Eu tinha 2 ossos, achei mais 1. <br><br> 🦴🦴 + 🦴 <br><br> Quantos ossos eu tenho agora?", options: [2, 3, 4], answer: 3 },
      { question: "Eu tinha 3 ossos, achei mais 2. <br><br> 🦴🦴🦴 + 🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [4, 5, 6], answer: 5 },
      { question: "Eu tinha 4 ossos, achei mais 3. <br><br> 🦴🦴🦴🦴 + 🦴🦴🦴 <br><br> Quantos ossos eu tenho agora?", options: [6, 7, 8], answer: 7 }
    ],
    xp: 20
  },
  {
    id: "dino_subtracao",
    title: "➖ Perdendo fósseis",
    story: "Ah não! Eu perdi alguns ossos de dinossauro!",
    challenges: [
      { question: "Eu tinha 5 ossos, perdi 1. <br><br> 🦴🦴🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 4, 5], answer: 4 },
      { question: "Eu tinha 6 ossos, perdi 2. <br><br> 🦴🦴❌🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 4, 5], answer: 4 },
      { question: "Eu tinha 7 ossos, perdi 3. <br><br> 🦴❌❌🦴🦴🦴❌ <br><br> Quantos ossos sobraram?", options: [3, 4, 5], answer: 4 }
    ],
    xp: 20
  },
  {
    id: "dino_multiplicacao",
    title: "✖️ Ninho de ovos",
    story: "Olha que legal! Encontrei alguns ninhos de dinossauros! 🥚",
    challenges: [
      { question: "Aqui tem 2 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [2, 4, 6], answer: 4 },
      { question: "Aqui tem 3 ninhos com 2 ovos em cada um.<br><br> [🥚🥚] [🥚🥚] [🥚🥚]<br><br>Quantos ovos temos?", options: [4, 6, 8], answer: 6 },
      { question: "Aqui tem 4 ninhos com 3 ovos em cada um.<br><br> [🥚🥚🥚] [🥚🥚🥚]<br>[🥚🥚🥚] [🥚🥚🥚]<br><br>Quantos ovos temos?", options: [9, 12, 15], answer: 12 }
    ],
    xp: 25
  },
  {
    id: "dino_divisao",
    title: "➗ Dividindo fósseis",
    story: "Humm, tem alguns ovos fora do ninho. Vamos colocar no lugar!",
    challenges: [
      { question: "Temos 4 ovos e 2 ninhos.<br><br>[🥚🥚] [🥚🥚]<br><br>Qantos ovos ficaram em cada ninho?", options: [1, 2, 3], answer: 2 },
      { question: "Temos 6 ovos e 3 ninhos.<br><br>[🥚🥚] [🥚🥚] [🥚🥚]<br><br>Qantos ovos ficaram em cada ninho?", options: [1, 2, 3], answer: 2 },
      { question: "Temos 8 ovos e 4 ninhos.<br><br>[🥚🥚] [🥚🥚] [🥚🥚] [🥚🥚]<br><br>Qantos ovos ficaram em cada ninho?", options: [1, 2, 3], answer: 2 }
    ],
    xp: 25
  }
]

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
  renderMap()

  sidebar.classList.remove("mobile-open")
}

function resetProgress() {
  if (confirm("Tem certeza que deseja redefinir seu progresso? O jogo será reiniciado.")) {
    xp = 0
    currentLessonIndex = 0
    completedLessons = []
    saveProgress()
    location.reload()
  }
}

// =======================
// MAPA
// =======================
function renderMap() {
  currentChallengeIndex = 0

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
    showCongratsMessage(dinoSpeech.finishPhase)
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
  renderChallenge()
}

function renderChallenge() {
  const lesson = lessons[currentLessonIndex]
  const challenge = lesson.challenges[currentChallengeIndex]

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
  const challenge = lesson.challenges[currentChallengeIndex]
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

    if (currentChallengeIndex >= lesson.challenges.length) {
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
        renderMap
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
renderMap()

