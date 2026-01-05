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
const dinoSpeech = {
  welcome: "Oi! Eu sou o Dino 🦖 Vamos aprender juntinhos?",
  map: "Escolhe uma lição! Eu vou te ajudar 💜",
  correct: [
    "Issooo! Mandou muito bem ✨",
    "Eu sabia que você conseguia!",
    "Aprender assim é mais gostoso 😄"
  ],
  wrong: [
    "Tudo bem errar 💜 tenta de novo!",
    "Sem pressa, eu tô aqui!",
    "Quase! Vamos juntos."
  ],
  finishLesson: "Uau! Lição completa 🎉",
  finishPhase: "Você completou toda a ilha! 🦖💜"
}

const lessons = [
  {
    id: "dino_contar",
    title: "🦴 Contando fósseis",
    story: "🦖 Dino está contando seus fósseis roxos 💜",
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
    story: "🦖 Dino encontrou mais fósseis e juntou tudo!",
    challenges: [
      { question: "2 + 1", options: [2, 3, 4], answer: 3 },
      { question: "3 + 2", options: [4, 5, 6], answer: 5 },
      { question: "4 + 3", options: [6, 7, 8], answer: 7 }
    ],
    xp: 20
  },
  {
    id: "dino_subtracao",
    title: "➖ Emprestando fósseis",
    story: "🦖 Dino emprestou fósseis para um amigo 🦕",
    challenges: [
      { question: "5 - 1", options: [3, 4, 5], answer: 4 },
      { question: "6 - 2", options: [3, 4, 5], answer: 4 },
      { question: "7 - 3", options: [3, 4, 5], answer: 4 }
    ],
    xp: 20
  },
  {
    id: "dino_multiplicacao",
    title: "✖️ Caixas de ovos",
    story: "🦖 Dino organizou ovos em caixas 🥚",
    challenges: [
      { question: "2 caixas com 2 ovos", options: [2, 4, 6], answer: 4 },
      { question: "3 caixas com 2 ovos", options: [4, 6, 8], answer: 6 },
      { question: "4 caixas com 3 ovos", options: [9, 12, 15], answer: 12 }
    ],
    xp: 25
  },
  {
    id: "dino_divisao",
    title: "➗ Dividindo fósseis",
    story: "🦖 Dino dividiu fósseis entre amigos!",
    challenges: [
      { question: "4 fósseis para 2 dinos", options: [1, 2, 3], answer: 2 },
      { question: "6 fósseis para 3 dinos", options: [1, 2, 3], answer: 2 },
      { question: "8 fósseis para 4 dinos", options: [1, 2, 3], answer: 2 }
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
    <h3>🦖 Fase 1</h3>
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
  `
}

function goToLesson(index) {
  currentLessonIndex = index
  currentChallengeIndex = 0
  saveProgress()
  renderMap()

  sidebar.classList.remove("mobile-open")
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
      <h2>🎉 FASE 1 COMPLETA!</h2>
      <p>🦖 Dino está orgulhoso de você 💜</p>
      <p>🐋 Oceano desbloqueado em breve...</p>
    `
    showCongratsMessage(dinoSpeech.finishPhase)
    return
  }

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

  setSpeech(lessons[currentLessonIndex].story)
  document.getElementById("screen").className = "fade"
  document.getElementById("screen").innerHTML = `
    <h2>${challenge.question}</h2>

    ${challenge.options
      .map(
        opt => `
        <button onclick="checkAnswer(${opt})">
          ${opt}
        </button>
      `
      )
      .join("")}

    <p id="feedback" style="margin-top:10px;"></p>
  `
}

function checkAnswer(option) {
  const lesson = lessons[currentLessonIndex]
  const challenge = lesson.challenges[currentChallengeIndex]
  const feedback = document.getElementById("feedback")

  if (option === challenge.answer) {
    playSound("correct")
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

