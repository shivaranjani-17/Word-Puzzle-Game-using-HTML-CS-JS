const puzzleElement = document.getElementById("puzzle");
const wordListElement = document.getElementById("word-list");
const timeElement = document.getElementById("time");
const scoreElement = document.getElementById("score");
const changeBtn = document.getElementById("change-btn");
const hintBtn = document.getElementById("hint-btn");
const restartBtn = document.getElementById("restart-btn");
const finishBtn = document.getElementById("finish-btn");
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const closePopupBtn = document.getElementById("close-popup");

let currentPuzzleIndex = 0;
let foundWords = [];
let score = 0;
let timeLeft = 120;
let timerInterval;
let selectedLetters = [];
let isDragging = false;

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Puzzle combinations (20 sets)
const puzzles = [
  {
    words: ["apple", "banana", "cherry"],
  },
  {
    words: ["orange", "grape", "melon"],
  },
  {
    words: ["tiger", "lion", "zebra"],
  },
  {
    words: ["india", "china", "japan"],
  },
  {
    words: ["html", "css", "javascript"],
  },
];

// <<< PASTE HERE >>>

const GRID_SIZE = 10;

function generatePuzzle(words) {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(""),
  );

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: -1, dc: 1 },
  ];

  words.forEach((word) => {
    let placed = false;

    while (!placed) {
      const dir = directions[Math.floor(Math.random() * directions.length)];

      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      let fits = true;

      for (let i = 0; i < word.length; i++) {
        const r = row + dir.dr * i;
        const c = col + dir.dc * i;

        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
          fits = false;
          break;
        }

        if (grid[r][c] !== "" && grid[r][c] !== word[i].toUpperCase()) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          const r = row + dir.dr * i;
          const c = col + dir.dc * i;

          grid[r][c] = word[i].toUpperCase();
        }

        placed = true;
      }
    }
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return grid;
}

// Initialize the game
function initGame() {
  currentPuzzleIndex = Math.floor(Math.random() * puzzles.length);
  foundWords = [];
  score = 0;
  timeLeft = 120;
  selectedLetters = [];
  updateScore();
  renderPuzzle();
  startTimer();
}

// Render the puzzle grid
function renderPuzzle() {
  const puzzle = puzzles[currentPuzzleIndex];

  puzzle.grid = generatePuzzle(puzzle.words);

  puzzleElement.innerHTML = "";

  puzzle.grid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellElement = document.createElement("div");

      cellElement.textContent = cell;
      cellElement.dataset.row = rowIndex;
      cellElement.dataset.col = colIndex;

      // Mouse drag
      cellElement.addEventListener("mousedown", () =>
        startSelection(cellElement),
      );

      cellElement.addEventListener("mouseenter", () => {
        if (isDragging) {
          continueSelection(cellElement);
        }
      });

      cellElement.addEventListener("mouseup", finishSelection);

      // 👇 ADD THIS HERE
      cellElement.addEventListener("click", () => {
        addLetter(cellElement);
        checkSelectedLetters();
      });

      // Mobile
      cellElement.addEventListener("touchstart", () =>
        startSelection(cellElement),
      );

      cellElement.addEventListener("touchmove", () =>
        continueSelection(cellElement),
      );

      cellElement.addEventListener("touchend", finishSelection);

      puzzleElement.appendChild(cellElement);
    });
  });

  renderWordList();
}

function startSelection(cell) {
  isDragging = true;

  clearSelection();

  selectedLetters = [];

  addLetter(cell);
}

function continueSelection(cell) {
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  const alreadySelected = selectedLetters.some(
    (l) => l.row === row && l.col === col,
  );

  if (!alreadySelected) {
    addLetter(cell);
  }
}

function finishSelection() {
  isDragging = false;

  checkSelectedLetters();
}

function addLetter(cell) {
  cell.classList.add("selected");

  selectedLetters.push({
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col),
    letter: cell.textContent,
  });
}

function clearSelection() {
  document.querySelectorAll(".selected").forEach((cell) => {
    cell.classList.remove("selected");
  });
}

// Render the word list
function renderWordList() {
  const puzzle = puzzles[currentPuzzleIndex];
  wordListElement.innerHTML = "";
  puzzle.words.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    if (foundWords.includes(word)) {
      li.style.textDecoration = "line-through";
    }
    wordListElement.appendChild(li);
  });
}

// Update the score
function updateScore() {
  scoreElement.textContent = score;
}

// Start the timer
function startTimer() {
  clearInterval(timerInterval); // Clear any existing timer
  timerInterval = setInterval(() => {
    timeLeft--;
    timeElement.textContent = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showPopup("Time's up. You've lost!");
    }
  }, 1000);
}

// Show a popup message
function showPopup(message) {
  popupMessage.textContent = message;
  popup.style.display = "flex";
}

// Close the popup
closePopupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});

// Change button functionality
changeBtn.addEventListener("click", () => {
  currentPuzzleIndex = (currentPuzzleIndex + 1) % puzzles.length;
  initGame();
});

// Hint button functionality
hintBtn.addEventListener("click", () => {
  const puzzle = puzzles[currentPuzzleIndex];
  const nextWord = puzzle.words.find((word) => !foundWords.includes(word));
  if (nextWord) {
    alert(`Hint: The first letter of the next word is "${nextWord[0]}"`);
  }
});

// Restart button functionality
restartBtn.addEventListener("click", () => {
  foundWords = [];
  score = 0;
  timeLeft = 120;
  updateScore();
  renderPuzzle();
  startTimer();
});

// Finish button functionality
finishBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  if (foundWords.length === puzzles[currentPuzzleIndex].words.length) {
    showPopup("You've won!!!");
  } else {
    showPopup("You've lost!");
  }
});

// Check if the selected letters form a word
function checkSelectedLetters() {
  const puzzle = puzzles[currentPuzzleIndex];

  const word = selectedLetters
    .map((l) => l.letter)
    .join("")
    .toLowerCase();

  const reverse = word.split("").reverse().join("");

  if (puzzle.words.includes(word) || puzzle.words.includes(reverse)) {
    const correctWord = puzzle.words.includes(word) ? word : reverse;

    if (!foundWords.includes(correctWord)) {
      foundWords.push(correctWord);

      score++;

      updateScore();

      renderWordList();

      selectedLetters.forEach((letter) => {
        const cell = document.querySelector(
          `[data-row="${letter.row}"][data-col="${letter.col}"]`,
        );

        cell.classList.remove("selected");
        cell.classList.add("found");
      });
    }

    selectedLetters = [];

    if (foundWords.length === puzzle.words.length) {
      clearInterval(timerInterval);

      showPopup("You've Won!");
    }
  } else {
    clearSelection();

    selectedLetters = [];
  }
}

// Initialize the game on page load
initGame();
