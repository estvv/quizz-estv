import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';
import { CategoryPage } from './pages/CategoryPage';
import { QuizSessionPage } from './pages/QuizSessionPage';
import { LoginPage } from './components/auth/LoginPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { AdminDashboard } from './components/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/quiz" element={<QuizSessionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
