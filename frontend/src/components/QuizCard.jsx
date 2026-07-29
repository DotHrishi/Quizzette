import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccessTime, Quiz, Close, ArrowForward, Bolt, EmojiEvents } from "@mui/icons-material";

const QuizCard = ({ quiz }) => {
  const [open, setOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinQuiz = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/quiz/${codeInput}`);
          const data = await res.json();

          if (!res.ok) {
              throw new Error(data.message || "Failed to join quiz");
          }

          // Verify the code actually belongs to this specific quiz card
          if (data.quiz.id !== quiz.id) {
              throw new Error("Invalid access code for this specific quiz.");
          }

          // Quiz code is valid
          setOpen(false);
          navigate(`/takeQuiz/${codeInput}`);
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <>
      <div className="group relative h-full w-full">
        {/* Main Card Content */}
        <div className="relative h-full bg-white dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 border-b-8 border-r-8 border-b-blue-600 border-r-blue-600 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 rounded-xl">
            
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-50" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full p-6">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="px-3 py-1 rounded-full bg-green-100 border border-green-100">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Active</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-3 line-clamp-2">
                    {quiz.topic}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-2">
                    Test your knowledge and skills on the topic of {quiz.topic} with this customized {quiz.difficulty} difficulty assessment.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700/50 flex items-center gap-3">
                        <AccessTime className="text-blue-600 dark:text-blue-400 w-4 h-4" fontSize="small" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{quiz.duration || 15} Mins</span>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700/50 flex items-center gap-3">
                        <Quiz className="text-green-600 dark:text-green-400 w-4 h-4" fontSize="small" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{quiz.num_questions} Qs</span>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    <button
                        onClick={() => setOpen(true)}
                        className="w-full rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 p-4 font-bold text-md transition-all hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                    >
                        Start Assessment
                        <ArrowForward className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                    <button
                        onClick={() => navigate(`/leaderboard/${quiz.quiz_code}`)}
                        className="w-full rounded-xl bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/30 p-3 font-semibold text-sm transition-all hover:bg-yellow-400 hover:text-yellow-900 dark:hover:bg-yellow-500 dark:hover:text-black active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <EmojiEvents fontSize="small" />
                        Leaderboard
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          
          <div className="relative w-full max-w-md overflow-hidden border-b-8 border-r-8 border-b-blue-600 border-r-blue-600 bg-white dark:bg-neutral-900 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="relative p-8">
                  <button
                      onClick={() => setOpen(false)}
                      className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                      <Close fontSize="small" />
                  </button>

                  <div className="mb-8">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                          <Bolt />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to Start?</h2>
                      <p className="text-gray-500 text-sm">Enter your unique access code to begin the assessment.</p>
                  </div>

                  <form onSubmit={handleJoinQuiz}>
                      <div className="space-y-4 mb-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Access Code</label>
                              <input 
                                  type="text" 
                                  value={codeInput}
                                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                                  placeholder="XXXXXX" 
                                  maxLength={6}
                                  className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-center tracking-widest text-lg placeholder:text-gray-400"
                                  autoFocus
                                  required
                              />
                          </div>
                      </div>
                      
                      {error && (
                          <div className="mb-4 text-center text-red-600 font-semibold text-sm">
                              {error}
                          </div>
                      )}

                      <div className="flex gap-3">
                          <button
                              type="button"
                              onClick={() => setOpen(false)}
                              className="flex-1 px-4 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              disabled={loading}
                              className={`flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                          >
                              {loading ? "Checking..." : "Begin"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizCard;
