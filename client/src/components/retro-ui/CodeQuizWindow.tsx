import React, { useState, useEffect } from 'react';
import { pythonQuestions } from './quiz-data/python-questions';
import { cppQuestions } from './quiz-data/cpp-questions';
import './retro-ui.css';

interface Question {
  id: number;
  type: 'output' | 'error' | 'fix';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  options?: string[];
  correctAnswer: string | number;
  lineToFix?: number;
  explanation: string;
}

interface CodeQuizWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

const CodeQuizWindow: React.FC<CodeQuizWindowProps> = ({ onClose, onMinimize, isActive }) => {
  const [language, setLanguage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [gameState, setGameState] = useState<'language-select' | 'question' | 'feedback' | 'game-over'>('language-select');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const cartelMessages = [
    "Smart code keeps the authorities guessing.",
    "Even Gizbo's best fixers make mistakes. Learn from them.",
    "Debug like the authorities are watching.",
    "Knowledge is power, code is currency.",
    "The cartel rewards those who fix what's broken.",
    "Security through obscurity isn't enough. Fix your code.",
    "Sloppy code leads to unexpected visitors. Stay sharp.",
    "In the scrap market, only working code has value.",
    "Bugs are opportunities for those who can spot them.",
    "The difference between profit and prison? Proper debugging."
  ];

  useEffect(() => {
    if (language) {
      // Load questions based on language and shuffle them
      const allQuestions = language === 'python' ? pythonQuestions : cppQuestions;
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 30);
      setQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setScore(0);
      setGameState('question');
    }
  }, [language]);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
  };

  const checkAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    let isAnswerCorrect = false;

    if (currentQuestion.type === 'output' || currentQuestion.type === 'error') {
      // For multiple choice questions
      isAnswerCorrect = parseInt(userAnswer) === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'fix') {
      // For code fixing questions, compare after trimming whitespace
      isAnswerCorrect = userAnswer.trim() === currentQuestion.correctAnswer.toString().trim();
    }

    if (isAnswerCorrect) {
      setScore(score + 1);
      setFeedbackMessage(`CORRECT! +1 point added to your stash.\n\n"${cartelMessages[Math.floor(Math.random() * cartelMessages.length)]}" -Gizbo`);
    } else {
      let correctAnswerText = '';
      if (currentQuestion.type === 'output') {
        correctAnswerText = `The correct answer was: ${currentQuestion.options?.[currentQuestion.correctAnswer as number - 1]}`;
      } else if (currentQuestion.type === 'error') {
        correctAnswerText = `The correct answer was: line ${currentQuestion.correctAnswer}`;
      } else {
        correctAnswerText = `The correct answer was: ${currentQuestion.correctAnswer}`;
      }
      setFeedbackMessage(`INCORRECT!\n${correctAnswerText}\n\n"${cartelMessages[Math.floor(Math.random() * cartelMessages.length)]}"`); 
    }

    setIsCorrect(isAnswerCorrect);
    setGameState('feedback');
    setShowExplanation(false);
  };

  const nextQuestion = () => {
    setUserAnswer('');
    
    if (currentQuestionIndex >= questions.length - 1) {
      setGameState('game-over');
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setGameState('question');
    }
  };

  const restartGame = () => {
    setLanguage(null);
    setScore(0);
    setGameState('language-select');
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const renderLanguageSelect = () => {
    return (
      <div className="code-quiz-content">
        <div className="code-quiz-header">
          <pre className="ascii-header">
{`╔═══════════ BUGHUNT ════════════╗
║                                      ║
║  Choose your language:               ║
║  [1] Python                          ║
║  [2] C++                             ║
║                                      ║
╚══════════════════════════════════════╝`}
          </pre>
        </div>
        <div className="code-quiz-body">
          <p className="cartel-quote">"Debug for the cartel, earn your keep." -Gizbo</p>
          <div className="language-buttons">
            <button className="retro-button" onClick={() => handleLanguageSelect('python')}>Python</button>
            <button className="retro-button" onClick={() => handleLanguageSelect('cpp')}>C++</button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (questions.length === 0) return <div>Loading questions...</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="code-quiz-content">
        <div className="code-quiz-header">
          <h2>CHALLENGE {currentQuestionIndex + 1}/{questions.length}</h2>
          <p>DIFFICULTY: {currentQuestion.difficulty}</p>
          <p>TYPE: {currentQuestion.type === 'output' ? 'Predict Output' : 
                  currentQuestion.type === 'error' ? 'Find Error' : 'Fix Code'}</p>
          <p>SCORE: {score}</p>
        </div>

        <div className="code-quiz-body">
          {currentQuestion.type === 'output' && (
            <>
              <p>What will the following code output?</p>
              <pre className="code-block">
                <div className="line-numbers">
                  {currentQuestion.code.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="code-content">{currentQuestion.code}</div>
              </pre>
              <div className="answer-options">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="answer-option">
                    <input 
                      type="radio" 
                      id={`option-${index}`} 
                      name="answer" 
                      value={index + 1} 
                      checked={userAnswer === (index + 1).toString()}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    />
                    <label htmlFor={`option-${index}`}>[{index + 1}] {option}</label>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentQuestion.type === 'error' && (
            <>
              <p>Which line contains the error?</p>
              <pre className="code-block">
                <div className="line-numbers">
                  {currentQuestion.code.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="code-content">{currentQuestion.code}</div>
              </pre>
              <div className="answer-input">
                <label>Line number: </label>
                <input 
                  type="number" 
                  value={userAnswer} 
                  onChange={(e) => setUserAnswer(e.target.value)}
                  min={1}
                  max={currentQuestion.code.split('\n').length}
                />
              </div>
            </>
          )}

          {currentQuestion.type === 'fix' && (
            <>
              <p>Fix line {currentQuestion.lineToFix} by typing the correct code:</p>
              <pre className="code-block">
                <div className="line-numbers">
                  {currentQuestion.code.split('\n').map((_, i) => (
                    <div 
                      key={i} 
                      className={i+1 === currentQuestion.lineToFix ? 'highlighted-line' : ''}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="code-content">
                  {currentQuestion.code.split('\n').map((line, i) => (
                    <div 
                      key={i} 
                      className={i+1 === currentQuestion.lineToFix ? 'highlighted-line' : ''}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </pre>
              <div className="answer-input">
                <label>Corrected line {currentQuestion.lineToFix}: </label>
                <input 
                  type="text" 
                  value={userAnswer} 
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the fixed code here..."
                />
              </div>
            </>
          )}

          <div className="quiz-buttons">
            <button className="retro-button" onClick={checkAnswer}>Submit Answer</button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedback = () => {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="code-quiz-content">
        <div className={`code-quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <pre>{feedbackMessage}</pre>
          
          <div className="feedback-buttons">
            <button className="retro-button" onClick={toggleExplanation}>
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </button>
            <button className="retro-button" onClick={nextQuestion}>Next Challenge</button>
          </div>

          {showExplanation && (
            <div className="explanation">
              <h3>Explanation:</h3>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGameOver = () => {
    return (
      <div className="code-quiz-content">
        <div className="code-quiz-header">
          <pre className="ascii-header">
{`╔═════════ BUGHUNT RESULTS ═════════╗
║                                ║
║     BUGS SQUASHED: ${score.toString().padStart(2, ' ')}/${questions.length}    ║
║                                ║
╚════════════════════════════════════╝`}
          </pre>
        </div>
        <div className="code-quiz-body">
          <p className="cartel-message">
            {score >= questions.length * 0.8 ? 
              "Impressive work. Gizbo will be adding you to his inner circle." :
              score >= questions.length * 0.6 ? 
              "You've got potential. The cartel can use fixers like you." :
              score >= questions.length * 0.4 ? 
              "Not bad, but you need more practice to survive in this business." :
              "Disappointing. Back to the scrapheap for more training."}
          </p>
          <div className="game-over-buttons">
            <button className="retro-button" onClick={restartGame}>New Game</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`window code-quiz-window ${isActive ? 'active' : ''}`}>
      <div className="window-header">
        <div className="window-title">BugHunt</div>
        <div className="window-controls">
          <button className="window-minimize" onClick={onMinimize}>_</button>
          <button className="window-close" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="window-content">
        {gameState === 'language-select' && renderLanguageSelect()}
        {gameState === 'question' && renderQuestion()}
        {gameState === 'feedback' && renderFeedback()}
        {gameState === 'game-over' && renderGameOver()}
      </div>
    </div>
  );
};

export default CodeQuizWindow;
