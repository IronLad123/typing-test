const TEST_TIME = 30;

const state = {
  words: [],
  chars: [],

  charIndex: 0,
  results: [],

  running: false,
  finished: false,

  startTime: null,
  timer: TEST_TIME,
  interval: null
};

const wordsEl = document.getElementById("words");
const caretEl = document.getElementById("caret");

const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");

const resultEl = document.getElementById("result");

function getRandomSentence() {

  return SENTENCES[
    Math.floor(Math.random() * SENTENCES.length)
  ];

}

function loadWords() {

  const sentence = getRandomSentence();

  state.words = sentence.split(" ");

  renderWords();

}

function renderWords() {

  wordsEl.innerHTML = "";

  const fragment =
    document.createDocumentFragment();

  state.words.forEach(word => {

    const wordEl =
      document.createElement("div");

    wordEl.className = "word";

    for (const char of word) {

      const span =
        document.createElement("span");

      span.className = "char";
      span.textContent = char;

      wordEl.appendChild(span);

    }

    const space =
      document.createElement("span");

    space.className = "char";
    space.innerHTML = "&nbsp;";

    wordEl.appendChild(space);

    fragment.appendChild(wordEl);

  });

  wordsEl.appendChild(fragment);

  state.chars =
    [...document.querySelectorAll(".char")];

  activateChar(0);

  requestAnimationFrame(moveCaret);

}

function activateChar(index) {

  const prev =
    document.querySelector(".active");

  if (prev) {
    prev.classList.remove("active");
  }

  if (state.chars[index]) {
    state.chars[index]
      .classList.add("active");
  }

}

function moveCaret() {

  const active =
    document.querySelector(".active");

  if (!active) return;

  const rect =
    active.getBoundingClientRect();

  const parent =
    wordsEl.getBoundingClientRect();

  caretEl.style.left =
    `${rect.left - parent.left}px`;

  caretEl.style.top =
    `${rect.top - parent.top}px`;

}

function startTest() {

  if (state.running) return;

  state.running = true;

  state.startTime = Date.now();

  state.interval = setInterval(() => {

    state.timer--;

    timeEl.textContent = state.timer;

    updateStats();

    if (state.timer <= 0) {
      finishTest();
    }

  }, 1000);

}

function updateStats() {

  const correct =
    state.results.filter(Boolean).length;

  const total =
    state.results.length;

  const elapsed =
    TEST_TIME - state.timer;

  const minutes =
    elapsed > 0
      ? elapsed / 60
      : 1 / 60;

  const wpm =
    Math.round((correct / 5) / minutes);

  const accuracy =
    total
      ? Math.round((correct / total) * 100)
      : 100;

  wpmEl.textContent = wpm;
  accEl.textContent = accuracy;

}

function finishTest() {

  clearInterval(state.interval);

  state.running = false;
  state.finished = true;

  updateStats();

  resultEl.style.display = "block";

  resultEl.textContent =
    `${wpmEl.textContent} WPM · ${accEl.textContent}% Accuracy`;

}

function restart() {

  clearInterval(state.interval);

  state.charIndex = 0;
  state.results = [];

  state.running = false;
  state.finished = false;

  state.startTime = null;
  state.timer = TEST_TIME;

  timeEl.textContent = TEST_TIME;
  wpmEl.textContent = "0";
  accEl.textContent = "100";

  resultEl.style.display = "none";

  loadWords();

}

function handleBackspace() {

  if (state.charIndex <= 0) return;

  state.charIndex--;

  state.results.pop();

  const current =
    state.chars[state.charIndex];

  current.classList.remove(
    "correct",
    "incorrect"
  );

  activateChar(state.charIndex);

  moveCaret();

}

function handleTyping(key) {

  const current =
    state.chars[state.charIndex];

  if (!current) {
    finishTest();
    return;
  }

  const expected =
    current.innerText === "\u00A0"
      ? " "
      : current.innerText;

  const correct =
    key === expected;

  current.classList.remove(
    "correct",
    "incorrect"
  );

  current.classList.add(
    correct
      ? "correct"
      : "incorrect"
  );

  state.results.push(correct);

  state.charIndex++;

  activateChar(state.charIndex);

  moveCaret();

}

document.addEventListener("keydown", e => {

  if (e.key === "Tab") {

    e.preventDefault();

    restart();

    return;

  }

  if (state.finished) return;

  if (e.key === "Backspace") {

    e.preventDefault();

    handleBackspace();

    return;

  }

  if (
    e.key.length !== 1 &&
    e.key !== " "
  ) {
    return;
  }

  if (!state.running) {
    startTest();
  }

  handleTyping(e.key);

});

loadWords();