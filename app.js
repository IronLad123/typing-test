

const WORD_BANK = [
  "time","world","people","system","keyboard","typing","speed",
  "random","focus","internet","signal","offline","design",
  "performance","simple","future","computer","screen","practice",
  "javascript","mobile","smooth","browser","creative","engine",
  "coding","instant","restart","accuracy","challenge","dynamic",
  "network","power","silent","window","monitor","science",
  "generation","natural","modern","development","energy","typing"
];

const state = {
  words: [],
  charIndex: 0,
  results: [],
  running: false,
  finished: false,
  startTime: null,
  timer: 30,
  interval: null
};

const wordsEl = document.getElementById("words");
const caretEl = document.getElementById("caret");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const timeEl = document.getElementById("time");
const resultEl = document.getElementById("result");

function randomWords(count=40){
  let arr = [];

  for(let i=0;i<count;i++){
    const random =
      WORD_BANK[Math.floor(Math.random()*WORD_BANK.length)];

    arr.push(random);
  }

  return arr;
}

async function loadWords(){

  if(navigator.onLine){

    try{

      // Placeholder AI sentence simulation
      const aiSentence =
        "the internet provides fast typing practice for focused users who enjoy smooth minimal experiences";

      state.words = aiSentence.split(" ");

    }catch{
      state.words = randomWords();
    }

  }else{
    state.words = randomWords();
  }

  renderWords();
}

function renderWords(){

  wordsEl.innerHTML = "";

  state.words.forEach(word=>{

    const wordDiv = document.createElement("div");
    wordDiv.className = "word";

    word.split("").forEach(char=>{

      const span = document.createElement("span");
      span.className = "char";
      span.innerText = char;

      wordDiv.appendChild(span);

    });

    const space = document.createElement("span");
    space.className = "char";
    space.innerHTML = "&nbsp;";

    wordDiv.appendChild(space);

    wordsEl.appendChild(wordDiv);

  });

  activateChar(0);

  setTimeout(moveCaret,50);
}

function getAllChars(){
  return document.querySelectorAll(".char");
}

function activateChar(index){

  document.querySelectorAll(".active")
    .forEach(el=>el.classList.remove("active"));

  const chars = getAllChars();

  if(chars[index]){
    chars[index].classList.add("active");
  }
}

function moveCaret(){

  const active = document.querySelector(".active");

  if(!active) return;

  const rect = active.getBoundingClientRect();
  const parent = wordsEl.getBoundingClientRect();

  caretEl.style.left =
    (rect.left - parent.left) + "px";

  caretEl.style.top =
    (rect.top - parent.top) + "px";
}

function startTest(){

  state.running = true;
  state.startTime = Date.now();

  state.interval = setInterval(()=>{

    state.timer--;

    timeEl.innerText = state.timer;

    updateStats();

    if(state.timer <= 0){
      finishTest();
    }

  },1000);

}

function updateStats(){

  const correct =
    state.results.filter(r=>r===true).length;

  const total =
    state.results.length;

  const minutes =
    (30 - state.timer)/60 || 1/60;

  const wpm =
    Math.round((correct/5)/minutes);

  const accuracy =
    total
      ? Math.round((correct/total)*100)
      : 100;

  wpmEl.innerText = wpm;
  accEl.innerText = accuracy;
}

function finishTest(){

  clearInterval(state.interval);

  state.finished = true;
  state.running = false;

  resultEl.style.display = "block";

  resultEl.innerHTML =
    `Finished — ${wpmEl.innerText} WPM · ${accEl.innerText}% Accuracy`;

}

function restart(){

  clearInterval(state.interval);

  state.charIndex = 0;
  state.results = [];
  state.running = false;
  state.finished = false;
  state.startTime = null;
  state.timer = 30;

  timeEl.innerText = "30";
  wpmEl.innerText = "0";
  accEl.innerText = "100";

  resultEl.style.display = "none";

  loadWords();
}

document.addEventListener("keydown",(e)=>{

  if(e.key === "Tab"){
    e.preventDefault();
    restart();
    return;
  }

  if(state.finished) return;

  const chars = getAllChars();
  const current = chars[state.charIndex];

  if(!current) return;

  if(!state.running){
    startTest();
  }

  if(e.key.length !== 1 && e.key !== " "){
    return;
  }

  const expected =
    current.innerText === "\u00A0"
      ? " "
      : current.innerText;

  if(e.key === expected){

    current.classList.add("correct");
    state.results.push(true);

  }else{

    current.classList.add("incorrect");
    state.results.push(false);

  }

  current.classList.remove("active");

  state.charIndex++;

  activateChar(state.charIndex);

  moveCaret();

});

loadWords();

