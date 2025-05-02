import React, { useState, useEffect, useCallback } from 'react';
import { X, Minimize2, RefreshCw } from 'lucide-react';
import './retro-ui.css';

interface CodeGuessWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

// Dictionary of programming terms for the game
const PROGRAMMING_TERMS = [
  // Python terms
  "print", "while", "class", "input", "range", "break", "yield", "async", "await", "dict", "tuple", "list", "float", "index", 
  // C++ terms
  "const", "scanf", "union", "using", "throw", "short", "catch", "array", "auto", "final", "inline", "void", "bool", "char", 
  // General programming terms
  "stack", "queue"];

// Maximum number of guesses allowed
const MAX_GUESSES = 6;

const CodeGuessWindow: React.FC<CodeGuessWindowProps> = ({ onClose, onMinimize, isActive }) => {
  // The current word that needs to be guessed
  const [targetWord, setTargetWord] = useState<string>("");
  // Current guess input
  const [currentGuess, setCurrentGuess] = useState<string>("");
  // Array of previous guesses
  const [guesses, setGuesses] = useState<string[]>([]);
  // Array of feedback for each guess
  const [feedbacks, setFeedbacks] = useState<string[][]>([]);
  // State to track if player has won
  const [gameWon, setGameWon] = useState<boolean>(false);
  // State to track if player has lost
  const [gameLost, setGameLost] = useState<boolean>(false);
  // State to track invalid submissions
  const [invalidGuess, setInvalidGuess] = useState<boolean>(false);
  // State to track game stats
  const [stats, setStats] = useState<{
    gamesPlayed: number;
    gamesWon: number;
    currentStreak: number;
    maxStreak: number;
  }>({ gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 });

  // Initialize stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('codeGuessStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Update stats in localStorage when they change
  useEffect(() => {
    localStorage.setItem('codeGuessStats', JSON.stringify(stats));
  }, [stats]);

  // Generate a new word when the game starts or is reset
  useEffect(() => {
    if (!targetWord) {
      newGame();
    }
  }, [targetWord]);

  // Function to start a new game
  const newGame = () => {
    // Pick a random word from the list
    const newWord = PROGRAMMING_TERMS[Math.floor(Math.random() * PROGRAMMING_TERMS.length)];
    setTargetWord(newWord);
    setCurrentGuess("");
    setGuesses([]);
    setFeedbacks([]);
    setGameWon(false);
    setGameLost(false);
    console.log('New word:', newWord); // For debugging purposes
  };

  // Function to reset the game with a new word
  const resetGame = () => {
    newGame();
  };

  // Function to check if a guess is valid (right length and is a programming term)
  const isValidGuess = (guess: string): boolean => {
    if (guess.length !== targetWord.length) {
      return false;
    }
    // Could add a check against a dictionary of valid terms if needed
    return true;
  };

  // Function to calculate feedback for a guess
  const calculateFeedback = (guess: string): string[] => {
    const feedback: string[] = Array(guess.length).fill("gray");
    const targetCopy = targetWord.split('');
    const guessCopy = guess.split('');
    
    // First check for exact matches (green)
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] === targetCopy[i]) {
        feedback[i] = "green";
        targetCopy[i] = ''; // Mark as used
        guessCopy[i] = ''; // Mark as used
      }
    }
    
    // Then check for misplaced letters (yellow)
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] && targetCopy.includes(guessCopy[i])) {
        feedback[i] = "yellow";
        const index = targetCopy.indexOf(guessCopy[i]);
        targetCopy[index] = ''; // Mark as used
      }
    }
    
    return feedback;
  };

  // Function to handle submitting a guess
  const submitGuess = () => {
    const guess = currentGuess.toLowerCase();
    
    if (!isValidGuess(guess)) {
      setInvalidGuess(true);
      setTimeout(() => setInvalidGuess(false), 2000);
      return;
    }
    
    setGuesses([...guesses, guess]);
    const feedback = calculateFeedback(guess);
    setFeedbacks([...feedbacks, feedback]);
    setCurrentGuess("");
    
    // Check if the game is won
    if (guess === targetWord) {
      setGameWon(true);
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + 1,
        currentStreak: stats.currentStreak + 1,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1)
      };
      setStats(newStats);
    } 
    // Check if the game is lost
    else if (guesses.length + 1 >= MAX_GUESSES) {
      setGameLost(true);
      const newStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon,
        currentStreak: 0,
        maxStreak: stats.maxStreak
      };
      setStats(newStats);
    }
  };

  // Handler for key presses
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !gameWon && !gameLost) {
      submitGuess();
    }
  };

  // Calculate remaining empty guess rows
  const emptyRows = MAX_GUESSES - guesses.length;

  return (
    <div className={`retroWindow ${isActive ? 'active' : ''}`}>
      <div className="windowTitleBar">
        <div className="windowTitle">CodeGuess</div>
        <div className="windowControls">
          <button onClick={onMinimize} className="controlButton minimizeButton">
            <Minimize2 size={14} />
          </button>
          <button onClick={onClose} className="controlButton closeButton">
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="windowContent codeGuessContent" style={{ backgroundColor: '#1e1e1e', color: '#ffffff', padding: '15px' }}>
        <div className="game-container">
          <h2 className="game-title">CodeGuess</h2>
          <p className="game-subtitle">Guess the programming term!</p>
          
          {/* Game board */}
          <div className="guess-board">
            {/* Previous guesses */}
            {guesses.map((guess, guessIndex) => (
              <div key={guessIndex} className="guess-row">
                {guess.split('').map((letter, letterIndex) => (
                  <div 
                    key={letterIndex} 
                    className={`guess-tile ${feedbacks[guessIndex][letterIndex]}`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            ))}
            
            {/* Current guess (if game is still active) */}
            {!gameWon && !gameLost && (
              <div className="guess-row current">
                {currentGuess.split('').map((letter, index) => (
                  <div key={index} className="guess-tile">{letter}</div>
                ))}
                {/* Empty tiles to fill the row */}
                {Array(targetWord.length - currentGuess.length).fill(null).map((_, index) => (
                  <div key={index + currentGuess.length} className="guess-tile empty"></div>
                ))}
              </div>
            )}
            
            {/* Empty rows for remaining guesses */}
            {!gameWon && !gameLost && Array(emptyRows - (currentGuess ? 1 : 0)).fill(null).map((_, rowIndex) => (
              <div key={rowIndex + guesses.length + 1} className="guess-row">
                {Array(targetWord.length).fill(null).map((_, tileIndex) => (
                  <div key={tileIndex} className="guess-tile empty"></div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Input area */}
          {!gameWon && !gameLost ? (
            <div className="input-area">
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toLowerCase())}
                onKeyDown={handleKeyDown}
                maxLength={targetWord.length}
                placeholder={`Enter a ${targetWord.length}-letter term`}
                className="guess-input"
                autoFocus
              />
              <button className="submit-button" onClick={submitGuess}>Guess</button>
            </div>
          ) : (
            <div className="game-result">
              {gameWon && (
                <div className="win-message">
                  <h3>Congratulations!</h3>
                  <p>You guessed the term: <strong>{targetWord}</strong></p>
                  <p>It took you {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}.</p>
                </div>
              )}
              {gameLost && (
                <div className="lose-message">
                  <h3>Game Over</h3>
                  <p>The term was: <strong>{targetWord}</strong></p>
                </div>
              )}
              <button className="reset-button" onClick={resetGame}>
                <RefreshCw size={16} /> Play Again
              </button>
            </div>
          )}
          
          {invalidGuess && (
            <div className="error-message">
              Please enter a valid {targetWord.length}-letter term
            </div>
          )}
          
          {/* Game statistics */}
          <div className="game-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.gamesPlayed}</div>
              <div className="stat-label">Played</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%
              </div>
              <div className="stat-label">Win %</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label">Streak</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.maxStreak}</div>
              <div className="stat-label">Max</div>
            </div>
          </div>
          
          <div className="game-instructions">
            <p>Guess the programming term in 6 tries.</p>
            <ul>
              <li><span className="example-tile green">A</span> means the letter is in the correct spot.</li>
              <li><span className="example-tile yellow">B</span> means the letter is in the word but in the wrong spot.</li>
              <li><span className="example-tile gray">C</span> means the letter is not in the word.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGuessWindow;
