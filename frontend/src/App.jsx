import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ViewQuizzes from './pages/ViewQuizzes';
import MakeQuizzes from './pages/MakeQuizzes';
import TakeQuiz from './pages/TakeQuiz';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/leaderboard/:code" element={<Leaderboard />} />

          {/* Protected — must be logged in */}
          <Route path="/giveQuizzes" element={
            <ProtectedRoute><ViewQuizzes /></ProtectedRoute>
          } />
          <Route path="/makeQuizzes" element={
            <ProtectedRoute><MakeQuizzes /></ProtectedRoute>
          } />
          <Route path="/takeQuiz/:code" element={
            <ProtectedRoute><TakeQuiz /></ProtectedRoute>
          } />
        </Routes>
      </Box>
    </>
  )
}

export default App
