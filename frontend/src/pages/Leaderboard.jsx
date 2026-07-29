import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { EmojiEvents, AccessTime, ArrowBack, Refresh } from "@mui/icons-material";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function formatTime(seconds) {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? "0" : ""}${s}s`;
}

function getRankStyle(rank) {
  if (rank === 1) return { badge: "bg-yellow-400 text-yellow-900", row: "bg-yellow-50 dark:bg-yellow-900/10" };
  if (rank === 2) return { badge: "bg-gray-300 text-gray-800", row: "bg-gray-50 dark:bg-neutral-800/40" };
  if (rank === 3) return { badge: "bg-amber-600 text-white", row: "bg-amber-50 dark:bg-amber-900/10" };
  return { badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", row: "bg-white dark:bg-neutral-900" };
}

function RankIcon({ rank }) {
  if (rank === 1) return <EmojiEvents className="text-yellow-500" fontSize="small" />;
  if (rank === 2) return <EmojiEvents className="text-gray-400" fontSize="small" />;
  if (rank === 3) return <EmojiEvents className="text-amber-600" fontSize="small" />;
  return null;
}

export default function Leaderboard() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/quiz/${code}/leaderboard`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load leaderboard");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [code]);

  return (
    <div className="bg-gray-50 dark:bg-neutral-950 min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="grow container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-3 transition-colors"
            >
              <ArrowBack fontSize="small" />
              Back
            </button>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Leaderboard
            </h1>
            {data && (
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
                {data.topic}{" "}
                <span className="font-mono text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 ml-2">
                  {code}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-sm text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            <Refresh fontSize="small" className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500 animate-pulse">Loading rankings...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white dark:bg-neutral-900 border border-red-400 border-r-8 border-b-8 p-10 text-center">
            <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-[#000dff] text-green-300 font-bold rounded-sm"
            >
              Go Home
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data?.leaderboard?.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 border border-blue-600 border-r-8 border-b-8 p-16 text-center">
            <EmojiEvents sx={{ fontSize: 64 }} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No entries yet</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to complete this quiz and claim the top spot!
            </p>
            <button
              onClick={() => navigate(`/takeQuiz/${code}`)}
              className="mt-6 px-8 py-3 bg-[#000dff] text-green-300 font-bold rounded-sm hover:scale-105 transition-transform"
            >
              Take Quiz Now
            </button>
          </div>
        )}

        {/* Leaderboard table */}
        {!loading && !error && data?.leaderboard?.length > 0 && (
          <>
            {/* Top 3 podium cards */}
            {data.leaderboard.length >= 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[1, 0, 2].map((podiumIdx) => {
                  const entry = data.leaderboard[podiumIdx];
                  if (!entry) return <div key={podiumIdx} />;
                  const styles = getRankStyle(Number(entry.rank));
                  const isFirst = Number(entry.rank) === 1;
                  return (
                    <div
                      key={entry.id}
                      className={`border border-r-4 border-b-4 p-5 text-center transition-all
                        ${isFirst
                          ? "border-yellow-400 sm:scale-105 sm:-mt-4 shadow-lg"
                          : "border-gray-300 dark:border-neutral-600"}
                        ${styles.row}`}
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-lg mb-3 ${styles.badge}`}>
                        {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                      </div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white truncate">{entry.player_name}</p>
                      <p className="text-3xl font-black text-[#000dff] dark:text-blue-400 mt-1">{entry.score}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">correct</p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-gray-500 dark:text-gray-400 text-sm">
                        <AccessTime fontSize="inherit" />
                        <span>{formatTime(entry.time_taken_seconds)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full rankings table */}
            <div className="bg-white dark:bg-neutral-900 border border-blue-600 border-r-8 border-b-8 overflow-hidden">
              <div className="bg-[#000dff] text-green-300 px-6 py-4 flex items-center gap-2">
                <EmojiEvents fontSize="small" />
                <span className="font-bold uppercase tracking-wider text-sm">All Rankings</span>
                <span className="ml-auto font-mono text-xs opacity-70">{data.leaderboard.length} entries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-700 text-left">
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Rank</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Score</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Time Taken</th>
                      <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaderboard.map((entry, idx) => {
                      const styles = getRankStyle(Number(entry.rank));
                      return (
                        <tr
                          key={entry.id}
                          className={`border-b border-gray-100 dark:border-neutral-800 transition-colors hover:brightness-95 ${styles.row}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-sm text-xs font-black ${styles.badge}`}>
                                {entry.rank}
                              </span>
                              <RankIcon rank={Number(entry.rank)} />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                            {entry.player_name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-black text-[#000dff] dark:text-blue-400 text-base">
                              {entry.score}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
                              <AccessTime fontSize="inherit" className="text-gray-400" />
                              {formatTime(entry.time_taken_seconds)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400 dark:text-gray-500 text-xs">
                            {entry.submitted_at
                              ? new Date(entry.submitted_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate(`/takeQuiz/${code}`)}
                className="px-8 py-3 bg-[#000dff] text-green-300 font-bold rounded-sm hover:scale-105 transition-transform"
              >
                Take Quiz Again
              </button>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
