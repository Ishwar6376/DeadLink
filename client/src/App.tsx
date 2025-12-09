import './index.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import { Navbar } from './components/Navbar';
import RedirectPage from './pages/Redirect';
import Auth from './pages/login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/login" element={<Auth />} />
          {/* catch-all for any short link or slug paths (e.g. /abc123 or /custom/abc) */}
          <Route path="/*" element={<RedirectPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;


