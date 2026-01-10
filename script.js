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

import { dinoSpeech, whaleSpeech, spidermanSpeech, tianaSpeech, yoongiSpeech } from './data/speeches.js'



import { terraLessons, oceanLessons, newyorkLessons, neworleansLessons, koreaLessons } from './data/lessons.js'



import { terraCards, oceanCards, newyorkCards, neworleansCards, koreaCards } from './data/cards.js'



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
  },

  neworleans: {
    id: "neworleans",
    name: "Nova Orleans 👑",
    guide: "tiana",
    lessons: neworleansLessons,
    cards: neworleansCards,
    progress: {
      completedLessons: [],
      currentLessonIndex: 0
    }
  },

  korea: {
    id: "korea",
    name: "Coreia 💙",
    guide: "yoongi",
    lessons: koreaLessons,
    cards: koreaCards,
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
      border-radius:12px;
      overflow:hidden;
      margin:10px 0;
    ">
      <div style="
        width:${percent}%;
        padding:6px;
        transition:0.4s;
      "></div>
    </div>
    <small>${currentPhase.name} — Progresso</small>
  `
} 

function isPhaseUnlocked(phaseId) {
  // regra simples: 'terra' sempre desbloqueada; 'oceano' desbloqueada quando 'terra' completa; 'newyork' quando 'oceano' completa; 'neworleans' quando 'newyork' completa; 'korea' quando 'neworleans' completa
  if (phaseId === 'terra') return true
  if (phaseId === 'oceano') return phases.terra.progress.currentLessonIndex >= phases.terra.lessons.length
  if (phaseId === 'newyork') return phases.oceano.progress.currentLessonIndex >= phases.oceano.lessons.length
  if (phaseId === 'neworleans') return phases.newyork.progress.currentLessonIndex >= phases.newyork.lessons.length
  if (phaseId === 'korea') return phases.neworleans.progress.currentLessonIndex >= phases.neworleans.lessons.length
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
  if (currentPhase.id === 'neworleans') speechObj = tianaSpeech
  if (currentPhase.id === 'korea') speechObj = yoongiSpeech
  
  const lines = (speechObj.progress && speechObj.progress[level]) ? speechObj.progress[level] : (dinoSpeech.progress[level] || [])
  if (!lines || !lines.length) return
  const message = lines[Math.floor(Math.random() * lines.length)]

  const expression = level === "almost" ? "win" : "happy"

  guide.set(expression)
  setSpeech(message)
}

function applyPhaseTheme(phaseId) {
  // remove todas as classes de tema
  document.body.classList.remove('theme-terra', 'theme-oceano', 'theme-newyork', 'theme-neworleans', 'theme-korea')
  
  // adiciona a classe de tema correspondente à fase
  if (phaseId === 'terra') document.body.classList.add('theme-terra')
  else if (phaseId === 'oceano') document.body.classList.add('theme-oceano')
  else if (phaseId === 'newyork') document.body.classList.add('theme-newyork')
  else if (phaseId === 'neworleans') document.body.classList.add('theme-neworleans')
  else if (phaseId === 'korea') document.body.classList.add('theme-korea')
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

  // aplica o tema de cores da fase
  applyPhaseTheme(phaseId)

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

function showGameCompletion() {
  playSound("reward")
  
  const legendaryCard = koreaCards.legendary
  
  // Mostra tela de parabéns do Yoongi
  setSpeech(`Parabéns! Você completou todas as fases e dominou a jornada matemática inteira! 🎉 Você é incrível pequena ✨`)
  guide.set("win")
  
  // Aguarda um pouco para mostrar a figurinha
  setTimeout(() => {
    // Cria overlay especial para a figurinha lendária
    const completionOverlay = document.createElement('div')
    completionOverlay.id = 'completionOverlay'
    completionOverlay.className = 'completion-overlay'
    completionOverlay.innerHTML = `
      <div class="legendary-card-container">
        <h2>✨ FIGURINHA LENDÁRIA ✨</h2>
        <div class="legendary-card-3d">
          <div class="legendary-card-face legendary-card-front" style="background-image: url('${legendaryCard.image}')"></div>
          <div class="legendary-card-face legendary-card-back"></div>
        </div>
        <h3>${legendaryCard.title}</h3>
        <p>${legendaryCard.fact}</p>
        <button onclick="closeLegendaryCard()">Coletar e Finalizar</button>
      </div>
    `
    document.body.appendChild(completionOverlay)
    
    // Adiciona a figurinha à coleção
    if (!collection.find(c => c.id === legendaryCard.id)) {
      collection.push(legendaryCard)
      saveCollection()
    }
  }, LONG_READ_TIME)
}

function closeLegendaryCard() {
  const overlay = document.getElementById('completionOverlay')
  if (overlay) overlay.remove()
}

// =======================
// MAPA
// =======================
function startPhase() {
  let speechSet = dinoSpeech
  if (currentPhase.id === 'oceano') speechSet = whaleSpeech
  if (currentPhase.id === 'newyork') speechSet = spidermanSpeech
  if (currentPhase.id === 'neworleans') speechSet = tianaSpeech
  if (currentPhase.id === 'korea') speechSet = yoongiSpeech

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
  if (currentPhase.id === 'neworleans') speechSet = tianaSpeech
  if (currentPhase.id === 'korea') speechSet = yoongiSpeech
  
  currentChallengeIndex = 0

  if (currentPhase.progress.completedLessons.length > 0) {
    commentProgress()
  }

  if (currentPhase.progress.currentLessonIndex >= currentPhase.lessons.length) {
    setSpeech(speechSet.map)
    playSound("transition")
    document.getElementById("screen").className = "fade"
    document.getElementById("screen").innerHTML = `
      <button onclick="enterPhase('terra'); goToLesson(0)">Voltar ao início</button>
      `
    guide.set("win")
    // permite transição para a próxima fase quando prevista (ex: terra -> oceano -> newyork -> neworleans -> korea)
    let nextPhaseId = null
    if (currentPhase.id === 'terra') nextPhaseId = 'oceano'
    else if (currentPhase.id === 'oceano') nextPhaseId = 'newyork'
    else if (currentPhase.id === 'newyork') nextPhaseId = 'neworleans'
    else if (currentPhase.id === 'neworleans') nextPhaseId = 'korea'
    
    if (nextPhaseId) {
      let endPhaseText = dinoSpeech.endPhase
      if (currentPhase.id === 'oceano') endPhaseText = whaleSpeech.endPhase
      if (currentPhase.id === 'newyork') endPhaseText = spidermanSpeech.endPhase
      if (currentPhase.id === 'neworleans') endPhaseText = tianaSpeech.endPhase
      if (currentPhase.id === 'korea') endPhaseText = yoongiSpeech.endPhase
      
      showPhaseScreen({
        text: endPhaseText,
        button: "Continuar",
        expression: "win",
        onConfirm: () => enterPhase(nextPhaseId)
      })
    } else if (currentPhase.id === 'korea') {
      // Última fase - mostra tela final com figurinha lendária
      setTimeout(() => showGameCompletion(), LONG_READ_TIME)
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
  if (guide.name === 'tiana') speechSet = tianaSpeech
  if (guide.name === 'yoongi') speechSet = yoongiSpeech

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
// Expõe para o escopo global (window) as funções que são referenciadas via
// onclick em HTML (inline) ou em HTML gerado por template strings. Isso
// é necessário porque, com ES modules, funções locais do módulo não ficam
// automaticamente disponíveis como variáveis globais.
;
window.enterPhase = enterPhase
window.goToLesson = goToLesson
window.startLesson = startLesson
window.checkAnswer = checkAnswer
window.resetProgress = resetProgress
window.closeCollection = closeCollection
window.closeCard = closeCard
window.closeLegendaryCard = closeLegendaryCard

// A inicialização agora ocorre no handler de 'load' para garantir que o DOM e o localStorage
// já estejam prontos antes de sincronizar o estado da aplicação.


