/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle(src) {
  const copy = [...src];

  const length = copy.length;
  for (let i = 0; i < length; i++) {
    const x = copy[i];
    const y = Math.floor(Math.random() * length);
    const z = copy[y];
    copy[i] = z;
    copy[y] = x;
  }

  if (typeof src === "string") {
    return copy.join("");
  }

  return copy;
}

// 1. Constants
const ORIGINAL_WORDS = [
  "apple",
  "banana",
  "orange",
  "cherry",
  "grape",
  "mango",
  "peach",
  "melon",
  "lemon",
  "berry",
];
const MAX_STRIKES = 3;
const INITIAL_PASSES = 3;

// 2. Load game progress from localStorage, or initialize if none exists
const savedCurrentWord = localStorage.getItem("scramble_currentWord");

let initialWords = [];
let initialCurrentWord = "";
let initialScrambledWord = "";
let initialPoints = 0;
let initialStrikes = 0;
let initialPasses = INITIAL_PASSES;
let initialMessage = "";
let initialMessageType = "";

if (savedCurrentWord !== null) {
  // Load existing progress
  initialWords = JSON.parse(localStorage.getItem("scramble_words") || "[]");
  initialCurrentWord = savedCurrentWord;
  initialScrambledWord = localStorage.getItem("scramble_scrambledWord") || "";
  initialPoints = parseInt(localStorage.getItem("scramble_points") || "0", 10);
  initialStrikes = parseInt(
    localStorage.getItem("scramble_strikes") || "0",
    10,
  );
  initialPasses = parseInt(localStorage.getItem("scramble_passes") || "3", 10);
  initialMessage = localStorage.getItem("scramble_message") || "";
  initialMessageType = localStorage.getItem("scramble_messageType") || "";
} else {
  // Initialize new game
  const shuffled = shuffle(ORIGINAL_WORDS);
  initialCurrentWord = shuffled[0];
  initialWords = shuffled.slice(1);

  // Ensure scrambled word is different from original
  let scrambled = shuffle(initialCurrentWord);
  while (scrambled === initialCurrentWord && initialCurrentWord.length > 1) {
    scrambled = shuffle(initialCurrentWord);
  }
  initialScrambledWord = scrambled;
}

// 3. React App Component
function App() {
  // --- State Variables ---
  const [words, setWords] = React.useState(initialWords);
  const [currentWord, setCurrentWord] = React.useState(initialCurrentWord);
  const [scrambledWord, setScrambledWord] =
    React.useState(initialScrambledWord);
  const [points, setPoints] = React.useState(initialPoints);
  const [strikes, setStrikes] = React.useState(initialStrikes);
  const [passes, setPasses] = React.useState(initialPasses);
  const [guess, setGuess] = React.useState("");
  const [message, setMessage] = React.useState(initialMessage);
  const [messageType, setMessageType] = React.useState(initialMessageType);

  // --- Save state to localStorage on state changes ---
  React.useEffect(() => {
    localStorage.setItem("scramble_words", JSON.stringify(words));
    localStorage.setItem("scramble_currentWord", currentWord);
    localStorage.setItem("scramble_scrambledWord", scrambledWord);
    localStorage.setItem("scramble_points", points.toString());
    localStorage.setItem("scramble_strikes", strikes.toString());
    localStorage.setItem("scramble_passes", passes.toString());
    localStorage.setItem("scramble_message", message);
    localStorage.setItem("scramble_messageType", messageType);
  }, [
    words,
    currentWord,
    scrambledWord,
    points,
    strikes,
    passes,
    message,
    messageType,
  ]);

  // Check if game is over
  const isGameOver =
    strikes >= MAX_STRIKES || (!currentWord && words.length === 0);

  // --- Handle guess submit ---
  const handleGuessSubmit = (event) => {
    event.preventDefault(); // Prevent page refresh

    // Normalize input
    const trimmedGuess = guess.trim().toLowerCase();
    const targetWord = currentWord.toLowerCase();

    if (trimmedGuess === "") {
      setMessage("Please enter a word!");
      setMessageType("error");
      return;
    }

    if (trimmedGuess === targetWord) {
      // Guess is correct
      const newPoints = points + 1;
      setPoints(newPoints);
      setMessage(
        `Correct! "${currentWord.toUpperCase()}" is the right word! 🎉`,
      );
      setMessageType("success");

      // Load next word if available
      if (words.length > 0) {
        const nextWord = words[0];
        const remainingWords = words.slice(1);

        // Scramble next word
        let nextScrambled = shuffle(nextWord);
        while (nextScrambled === nextWord && nextWord.length > 1) {
          nextScrambled = shuffle(nextWord);
        }

        setWords(remainingWords);
        setCurrentWord(nextWord);
        setScrambledWord(nextScrambled);
      } else {
        // Game over (no words left)
        setCurrentWord("");
        setScrambledWord("");
      }
    } else {
      // Guess is incorrect
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setMessage(`Incorrect! "${guess}" is not correct. Try again! ❌`);
      setMessageType("error");

      if (newStrikes >= MAX_STRIKES) {
        // Game over (max strikes reached)
        setMessage(
          `Game Over! You reached the maximum strikes (${MAX_STRIKES}).`,
        );
      }
    }

    // Clear input
    setGuess("");
  };

  // --- Handle word skip (pass) ---
  const handlePassClick = () => {
    if (passes <= 0) {
      return;
    }

    const newPasses = passes - 1;
    setPasses(newPasses);
    setMessage("Word skipped!");
    setMessageType("success");
    setGuess("");

    // Load next word if available
    if (words.length > 0) {
      const nextWord = words[0];
      const remainingWords = words.slice(1);

      let nextScrambled = shuffle(nextWord);
      while (nextScrambled === nextWord && nextWord.length > 1) {
        nextScrambled = shuffle(nextWord);
      }

      setWords(remainingWords);
      setCurrentWord(nextWord);
      setScrambledWord(nextScrambled);
    } else {
      // Game over (no words left)
      setCurrentWord("");
      setScrambledWord("");
    }
  };

  // --- Handle game restart ---
  const handleRestartClick = () => {
    // Reshuffle original word list
    const shuffled = shuffle(ORIGINAL_WORDS);
    const firstWord = shuffled[0];
    const remaining = shuffled.slice(1);

    let firstScrambled = shuffle(firstWord);
    while (firstScrambled === firstWord && firstWord.length > 1) {
      firstScrambled = shuffle(firstWord);
    }

    // Reset state
    setWords(remaining);
    setCurrentWord(firstWord);
    setScrambledWord(firstScrambled);
    setPoints(0);
    setStrikes(0);
    setPasses(INITIAL_PASSES);
    setMessage("New game started! Good luck!");
    setMessageType("success");
    setGuess("");
  };

  return (
    <div className="app-layout">
      <div className="game-container">
        <h1 className="game-title">👾 Word Scramble</h1>
        <div className="status-board">
          <div className="status-card">
            <span className="status-label">Score</span>
            <span className="status-value">{points}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Strikes</span>
            <span className="status-value">
              {strikes} / {MAX_STRIKES}
            </span>
          </div>
          <div className="status-card">
            <span className="status-label">Passes Left</span>
            <span className="status-value">
              {passes} / {INITIAL_PASSES}
            </span>
          </div>
        </div>
        {/* Game Area */}
        {isGameOver ? (
          // Game over screen
          <div className="game-over-screen">
            <h2>Game Over! 🎮</h2>
            <p className="final-score">
              Your Final Score: <strong>{points}</strong> points
            </p>
            {strikes >= MAX_STRIKES ? (
              <p className="game-over-reason">
                You got too many strikes ({strikes}). Better luck next time!
              </p>
            ) : (
              <p className="game-over-reason">
                Congratulations! You successfully played all the words!
              </p>
            )}
            <button className="restart-btn" onClick={handleRestartClick}>
              Play Again 🔄
            </button>
          </div>
        ) : (
          // Active gameplay screen
          <div className="game-play-area">
            <div className="scrambled-word-box">
              <span className="scrambled-word">{scrambledWord}</span>
            </div>

            <form onSubmit={handleGuessSubmit} className="guess-form">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                className="guess-input"
                autoFocus
              />
              <button type="submit" className="submit-btn">
                Guess 🚀
              </button>
            </form>

            {/* Action Buttons: Pass and Reset */}
            <div className="action-buttons">
              <button
                onClick={handlePassClick}
                disabled={passes === 0}
                className="pass-btn"
              >
                Pass Word ⏩
              </button>
              <button onClick={handleRestartClick} className="reset-btn">
                Reset Game 🔄
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback message outside the main game container */}
      {message && (
        <div className={`message-banner ${messageType}`}>{message}</div>
      )}
    </div>
  );
}

// 4. Render React component to page
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container);
root.render(<App />);
