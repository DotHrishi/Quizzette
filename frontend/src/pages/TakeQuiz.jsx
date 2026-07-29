import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AccessTime, CheckCircle, Cancel, EmojiEvents, Person } from "@mui/icons-material";

export default function TakeQuiz() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [quizDetails, setQuizDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: "A" }
  
  // Views: 'landing', 'active', 'results'
  const [view, setView] = useState('landing');
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [results, setResults] = useState(null);
  const startTimeRef = useRef(null); // tracks when quiz was started
  const [timeTaken, setTimeTaken] = useState(0); // elapsed seconds at submission
  const [playerName, setPlayerName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.username || "";
    } catch {
      return "";
    }
  });
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Initial load
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quiz/${code}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load quiz");
        }

        setQuizDetails(data.quiz);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [code]);

  // Timer logic
  useEffect(() => {
    if (view === 'active' && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleConfirmSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [view, timeLeft]);

  const startQuiz = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quiz/${code}/questions`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch questions");
      
      setQuestions(data.questions);
      setTimeLeft(quizDetails.duration * 60); // Convert minutes to seconds
      startTimeRef.current = Date.now(); // record start time
      setView('active');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmSubmit(false);

    // Calculate time taken
    const elapsed = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : quizDetails?.duration * 60 || 0;
    setTimeTaken(elapsed);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quiz/${code}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          playerName: playerName.trim(),
          timeTaken: elapsed,
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit quiz");

      setResults(data);
      setView('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Called when user wants to submit — if no name yet, show the name prompt first
  const handleAttemptSubmit = () => {
    if (!playerName.trim()) {
      setNameInput("");
      setShowNamePrompt(true);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const handleNamePromptConfirm = () => {
    if (!nameInput.trim()) return; // name is required
    setPlayerName(nameInput.trim());
    setShowNamePrompt(false);
    setShowConfirmSubmit(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading && view === 'landing') {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold animate-pulse text-blue-600">Loading Quiz...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-10 max-w-lg w-full text-center border border-red-500 border-r-8 border-b-8 shadow-xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cancel sx={{ fontSize: 40 }} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Quiz Not Found</h2>
            <p className="text-gray-600 mb-8 text-lg bg-red-50 p-4 rounded-sm border border-red-200">
              {error}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-[#000dff] text-green-300 font-bold rounded-sm hover:-translate-y-1 hover:shadow-lg transition-all w-full"
            >
              Return Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      
      <div className="grow container mx-auto px-4 py-8 max-w-7xl">
        
        {/* LANDING VIEW */}
        {view === 'landing' && quizDetails && (
          <div className="bg-white p-8 border border-blue-600 border-r-8 border-b-8 mt-10 text-center animate-in fade-in zoom-in-95 duration-300">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-black via-[#183fa0] to-[#1900ff] text-transparent bg-clip-text">Ready to Begin?</h1>
              <div className="inline-block bg-blue-50 text-blue-800 px-6 py-2 rounded-sm font-mono text-2xl font-bold tracking-widest mb-8 border border-blue-200">
                  {code}
              </div>
              
              <div className="text-left bg-gray-50 border border-gray-200 p-6 rounded-sm mb-8 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{quizDetails.topic}</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-700 text-lg">
                    <div className="flex flex-col"><span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Difficulty</span> <span className="capitalize font-medium">{quizDetails.difficulty}</span></div>
                    <div className="flex flex-col"><span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Questions</span> <span className="font-medium">{quizDetails.num_questions}</span></div>
                    <div className="flex flex-col"><span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Duration</span> <span className="font-medium">{quizDetails.duration} Minutes</span></div>
                    <div className="flex flex-col"><span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Created By</span> <span className="font-medium">{quizDetails.created_by}</span></div>
                </div>
              </div>

              <div className="bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 p-4 mb-8 text-left max-w-3xl mx-auto rounded-r-sm">
                <p className="font-semibold mb-1">Important Instructions:</p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>The timer will start immediately once you click begin.</li>
                  <li>Do not refresh the page, or your progress will be lost.</li>
                  <li>The quiz will automatically submit when time is up.</li>
                </ul>
              </div>

              <button
                 onClick={startQuiz}
                 disabled={loading}
                 className="px-10 py-3 text-green-300 text-lg font-semibold rounded-sm bg-[#000dff] transform transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Preparing...' : 'Start Quiz Now'}
              </button>
          </div>
        )}

        {/* ACTIVE QUIZ VIEW */}
        {view === 'active' && questions.length > 0 && (
          <div className="flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
            {/* Main Quiz Area */}
            <div className="flex-1 bg-white border border-blue-600 border-r-8 border-b-8 flex flex-col h-full">
              {/* Header / Timer */}
              <div className="bg-[#000dff] text-green-300 p-5 flex justify-between items-center">
                <div className="font-bold text-xl tracking-wide">
                  Question {currentQuestionIdx + 1} <span className="text-white/70 font-medium text-base">of {questions.length}</span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold bg-white/20 px-5 py-2 rounded-sm backdrop-blur-sm ${timeLeft < 60 ? 'animate-pulse text-red-100 bg-red-500/50' : ''}`}>
                  <AccessTime fontSize="small" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Question Body */}
              <div className="p-8 flex-1">
                <div className="mb-10 min-h-[100px] flex items-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed">
                    {questions[currentQuestionIdx].question_text}
                  </h2>
                </div>

                <div className="space-y-4">
                  {questions[currentQuestionIdx].options && Object.entries(questions[currentQuestionIdx].options).map(([key, value]) => {
                    const isSelected = answers[questions[currentQuestionIdx].id] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectOption(questions[currentQuestionIdx].id, key)}
                        className={`w-full text-left p-5 rounded-sm border-2 transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/50 shadow-md transform scale-[1.01]' 
                            : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center font-bold text-lg transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {key}
                          </div>
                          <span className={`text-lg md:text-xl ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700 font-medium'}`}>
                            {value}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Navigation */}
              <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
                <button
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-8 py-3 text-lg font-semibold bg-gray-200 text-gray-700 border border-gray-300 rounded-sm hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                {currentQuestionIdx === questions.length - 1 ? (
                  <button
                    onClick={handleAttemptSubmit}
                    disabled={isSubmitting}
                    className="px-10 py-3 text-lg font-semibold text-white bg-green-600 rounded-sm hover:bg-green-700 transition-all disabled:opacity-70 flex items-center gap-2"
                  >
                    Finish Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-10 py-3 text-lg font-semibold text-green-300 bg-[#000dff] rounded-sm hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-300"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Legend */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="sticky top-8 bg-white border border-blue-600 border-r-8 border-b-8">
                <div className="bg-[#000dff] text-green-300 p-4 text-center font-bold tracking-wider uppercase text-sm">
                  Questions Overview
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6 text-sm justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-green-500 border border-green-600"></div>
                      <span className="text-gray-600 font-medium">Attempted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-white border-2 border-gray-300"></div>
                      <span className="text-gray-600 font-medium">Unattempted</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    {questions.map((q, idx) => {
                      const isAttempted = !!answers[q.id];
                      const isCurrent = idx === currentQuestionIdx;
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIdx(idx)}
                          className={`
                            h-12 w-full font-bold flex items-center justify-center text-base transition-all rounded-sm
                            ${isAttempted 
                              ? 'bg-green-100 text-green-700 border-2 border-green-500 hover:bg-green-200' 
                              : 'bg-white text-gray-500 border-2 border-gray-200 hover:border-gray-400'}
                            ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : ''}
                          `}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleAttemptSubmit}
                      disabled={isSubmitting}
                      className="w-full py-3 font-semibold text-lg text-red-600 bg-red-50 hover:bg-red-100 rounded-sm border border-red-200 transition-colors"
                    >
                      Submit Quiz Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {view === 'results' && results && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            {/* Score Header */}
            <div className="bg-white p-10 mb-8 border border-blue-600 border-r-8 border-b-8 text-center relative overflow-hidden">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Quiz Completed!</h2>
              <p className="text-gray-500 mb-8 text-lg">Here is how you performed on {quizDetails?.topic}</p>
              
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-7xl font-black text-[#000dff] drop-shadow-sm">{results.score}</div>
                  <div className="text-gray-400 font-semibold uppercase tracking-widest mt-2">Score</div>
                </div>
                <div className="text-5xl font-light text-gray-300">/</div>
                <div className="text-center">
                  <div className="text-7xl font-black text-gray-800">{results.total}</div>
                  <div className="text-gray-400 font-semibold uppercase tracking-widest mt-2">Total</div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 max-w-md mx-auto">
                <div className="bg-[#000dff] h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(results.score / results.total) * 100}%` }}></div>
              </div>
              <div className="text-sm font-semibold text-gray-500">
                {Math.round((results.score / results.total) * 100)}% Accuracy
              </div>

              {/* Time taken + player name */}
              <div className="flex justify-center gap-6 mt-6 flex-wrap">
                {timeTaken > 0 && (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-sm text-gray-600 text-sm font-semibold">
                    <AccessTime fontSize="small" className="text-blue-500" />
                    Time: {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                  </div>
                )}
                {playerName && (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-sm text-gray-600 text-sm font-semibold">
                    <Person fontSize="small" className="text-green-500" />
                    {playerName}
                  </div>
                )}
              </div>

              {/* Leaderboard CTA */}
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/leaderboard/${code}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-sm transition-all hover:scale-105"
                >
                  <EmojiEvents fontSize="small" />
                  View Leaderboard
                </button>
              </div>
            </div>

            {/* Detailed Answers Section */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6 pl-2 border-l-4 border-blue-600">Detailed Review</h3>
            <div className="space-y-6">
              {results.results.map((res, idx) => (
                <div key={res.id} className={`bg-white rounded-sm p-6 border border-b-4 border-x-gray-200 border-t-gray-200 ${res.isCorrect ? 'border-b-green-500' : 'border-b-red-500'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="mt-1">
                      {res.isCorrect 
                        ? <CheckCircle className="text-green-500" fontSize="large" /> 
                        : <Cancel className="text-red-500" fontSize="large" />}
                    </div>
                    <div className="w-full">
                      <h4 className="text-lg font-bold text-gray-800 mb-2">
                        {idx + 1}. {res.question}
                      </h4>
                      
                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {res.options && Object.entries(res.options).map(([key, value]) => {
                          let bgColor = "bg-gray-50 border-gray-200 text-gray-600";
                          let dotColor = "bg-gray-200";
                          
                          if (key === res.correctAnswer) {
                            bgColor = "bg-green-50 border-green-500 text-green-900 shadow-sm";
                            dotColor = "bg-green-500 text-white";
                          } else if (key === res.userAnswer && !res.isCorrect) {
                            bgColor = "bg-red-50 border-red-300 text-red-900";
                            dotColor = "bg-red-500 text-white";
                          }

                          return (
                            <div key={key} className={`p-4 rounded-sm border flex items-start gap-3 transition-all ${bgColor}`}>
                               <div className={`w-6 h-6 rounded-sm flex-shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${dotColor}`}>
                                {key}
                              </div>
                              <span className="text-sm font-medium">{value}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {res.explanation && (
                        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <strong className="text-blue-800 text-sm uppercase tracking-wider block mb-1">Explanation</strong>
                          <p className="text-blue-900 text-sm leading-relaxed">{res.explanation}</p>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 mb-20 text-center flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => navigate(`/leaderboard/${code}`)}
                className="inline-flex items-center gap-2 px-8 py-4 text-yellow-900 text-lg font-semibold rounded-sm bg-yellow-400 hover:bg-yellow-500 transform transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <EmojiEvents />
                View Leaderboard
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-4 text-green-300 text-lg font-semibold rounded-sm bg-[#000dff] transform transition-transform duration-300 ease-in-out hover:scale-110"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* NAME PROMPT MODAL — name is required to submit */}
        {showNamePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200" />
            <div className="relative w-full max-w-md bg-white border border-blue-600 border-r-8 border-b-8 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Person /> Enter Your Name
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                Your name is required to appear on the leaderboard before submitting.
              </p>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNamePromptConfirm()}
                maxLength={40}
                placeholder="e.g. Alex"
                className={`w-full border-2 outline-none rounded-sm px-4 py-3 text-lg font-medium mb-1 transition-colors ${
                  nameInput.trim() === "" && nameInput !== ""
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
                autoFocus
              />
              {nameInput !== "" && nameInput.trim() === "" && (
                <p className="text-red-500 text-xs mb-4">Name cannot be blank spaces.</p>
              )}
              {nameInput.trim() === "" && nameInput === "" && (
                <p className="text-gray-400 text-xs mb-4">A name is required to submit.</p>
              )}
              <div className="mt-4">
                <button
                  onClick={handleNamePromptConfirm}
                  disabled={!nameInput.trim()}
                  className="w-full px-4 py-3 font-semibold text-green-300 bg-[#000dff] hover:bg-blue-800 rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue to Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION MODEL */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setShowConfirmSubmit(false)}
            />
            
            <div className="relative w-full max-w-md bg-white border border-blue-600 border-r-8 border-b-8 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Quiz?</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Are you sure you want to finalize and submit your answers? You will not be able to change them.
                </p>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setShowConfirmSubmit(false)}
                        className="flex-1 px-4 py-3 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                    >
                        Keep Working
                    </button>
                    <button
                        onClick={() => {
                          setShowConfirmSubmit(false);
                          handleConfirmSubmit();
                        }}
                        className="flex-1 px-4 py-3 font-semibold text-green-300 bg-[#000dff] hover:bg-blue-800 rounded-sm transition-colors"
                    >
                        Yes, Submit
                    </button>
                </div>
            </div>
          </div>
        )}

      </div>
      {view !== 'active' && <Footer />}

    </div>
  );
}
