import './index.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import  Home  from './pages/Home';
import { Navbar } from './components/Navbar';
import RedirectPage from "./pages/Redirect"
import Auth from './pages/login';
import Dashboard from './pages/Dashboard';
 function App() {
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      <BrowserRouter>
          <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Dashboard />} />
           <Route path=":id" element={<RedirectPage />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;


