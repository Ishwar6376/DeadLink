import { useState } from "react";
import useTheme from "../hooks/useTheme";
import { Link } from "react-router-dom";

export function Navbar() {
  const [theme, toggleTheme] = useTheme();
  const [animating, setAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = () => {
    setAnimating(true);
    setTimeout(() => {
      toggleTheme();
      setAnimating(false);
    }, 400);
  };

  return (
    <div className="relative">
      {/* Overlay animation */}
      {animating && <div className="animate-slide-left"></div>}

      {/* Navbar */}
      <nav className="flex justify-between items-center p-2 bg-bg text-text shadow-md transition-colors duration-300">
        <h1 className=" font-bold">Short.ly</h1>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-text no-underline hover:text-primary transition-colors duration-200">Home</Link>
          <Link to="/Analysis" className="text-text no-underline hover:text-primary transition-colors duration-200">Analysis</Link>
          <Link to="/About" className="text-text no-underline hover:text-primary transition-colors duration-200">About</Link>
          <button
            onClick={handleToggle}
            className="ml-4 px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors duration-200"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
        <div className="md:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg
              className="w-6 h-6 text-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden flex flex-col bg-bg text-text p-4 border-t border-border shadow-md transition-colors duration-300">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-text no-underline hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/Analysis"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-text no-underline hover:text-primary transition-colors duration-200"
          >
            Analysis
          </Link>
          <Link
            to="/About"
            onClick={() => setMenuOpen(false)}
            className="py-2 text-text no-underline hover:text-primary transition-colors duration-200"
          >
            About
          </Link>
          <button
            onClick={() => {
              handleToggle();
              setMenuOpen(false);
            }}
            className="mt-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors duration-200"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      )}
    </div>
  );
}
