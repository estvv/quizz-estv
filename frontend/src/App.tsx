import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';
import { CategoryPage } from './pages/CategoryPage';
import { LessonPage } from './pages/LessonPage';
import { FlashcardSessionPage } from './pages/FlashcardSessionPage';
import { QuizSessionPage } from './pages/QuizSessionPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/category/:id/lesson" element={<LessonPage />} />
          <Route path="/category/:id/flashcards" element={<FlashcardSessionPage />} />
          <Route path="/quiz" element={<QuizSessionPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
