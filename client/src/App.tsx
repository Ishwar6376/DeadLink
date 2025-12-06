import './index.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import  Home  from './pages/Home';
import { Navbar } from './components/Navbar';
import RedirectPage from "./pages/Redirect"


function App() {
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      <BrowserRouter>
          <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path=":id" element={<RedirectPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;


