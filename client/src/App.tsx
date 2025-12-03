import './index.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
function App() {
  return (
    <div className='h-screen w-screen overflow-hidden'>
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
