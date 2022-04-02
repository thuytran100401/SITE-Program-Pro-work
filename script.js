// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var pattern = [];  // will be randomly generated 
var length = 9;
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0; //keeping track of guesses
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var numMistakes = 0; // variable to track the number of mistakes



// a function for randomly generating the pattern
function randomPattern() {
  // new random pattern;
  for (let i = 0; i < length; i++) {
    pattern[i] = randomNumber(1,8);
  }
  
  // generate random number between 1 and 8
  function randomNumber(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  numMistakes = 0;
  
  // new pattern
  randomPattern();

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 500,
  6: 550,
  7: 570,
  8: 600,
};

function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}

function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}

function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

// Playing a single clue
function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

// Playing a sequence of clues
function playClueSequence() {
  guessCounter = 0;
  clueHoldTime -= 65;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
  
}


// Checking the user's response - Win/loss notifications
function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function winGame() {
  stopGame();
  alert("Game Over. You won!");
}

// Handling guesses - the guess function
function guess(btn) {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }

  // add game logic here
  // if guess is correct
  if (btn == pattern[guessCounter]) {
    // if turn is over
    if (guessCounter == progress) {
      progress++;
      // if this is the last game => win
      if (progress == pattern.length) {
        winGame();
        return;        
      }
      playClueSequence();
    // if turn is not over => increment guessCounter
    } else {
      guessCounter++;
    }
  
  // check for how many mistakes they had made
  } else if (numMistakes < 2) {
    numMistakes++;
    alert("Wrong! Number of Mistakes: " + numMistakes + "\nNumber of Attemp Left: " + (3 - numMistakes));
    playClueSequence();
    
  // guess is wrong => lose game
  } else {
    loseGame();
    return;
  }
}
