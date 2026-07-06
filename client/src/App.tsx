import './index.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import { Navbar } from './components/Navbar';
import RedirectPage from './pages/Redirect';
import Auth from './pages/login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <BrowserRouter>
        <Navbar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/login" element={<Auth />} />
            {/* catch-all for any short link or slug paths (e.g. /abc123 or /custom/abc) */}
            <Route path="/*" element={<RedirectPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;


