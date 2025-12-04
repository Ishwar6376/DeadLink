import './index.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import  Home  from './pages/Home';
import { Navbar } from './components/Navbar';
function App() {
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      <BrowserRouter>
          <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
