import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import { Moon, Sun, Menu, X } from "lucide-react";

export function Navbar() {
  const [theme, toggleTheme] = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-blue-400"
      : "text-slate-300 hover:text-purple-400";

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/70 border-b border-slate-700 shadow-lg shadow-blue-500/10">
      <nav className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-black tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Short.ly
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {["/", "/Analysis", "/About"].map((path, index) => (
            <Link
              key={path}
              to={path}
              className={`relative transition-all duration-300 ${
                isActive(path)
              }`}
            >
              {["Home", "Analysis", "About"][index]}
              {location.pathname === path && (
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-blue-400 to-purple-400"></span>
              )}
            </Link>
          ))}

          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-700 hover:border-purple-400 bg-slate-900 hover:bg-slate-800 transition-all"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
          </button>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg border border-slate-700 hover:border-purple-400"
        >
          {menuOpen ? <X className="text-purple-300" /> : <Menu className="text-blue-300" />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="backdrop-blur bg-slate-950/90 border-t border-slate-700 px-5 py-6 space-y-4">

          {["/", "/Analysis", "/About"].map((path, index) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={`block text-lg ${
                isActive(path)
              }`}
            >
              {["Home", "Analysis", "About"][index]}
            </Link>
          ))}

          <button
            onClick={() => {
              toggleTheme();
              setMenuOpen(false);
            }}
            className="mt-4 flex items-center gap-2 px-3 py-2 border border-slate-700 rounded-md hover:border-purple-400 hover:bg-slate-800 transition-all"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-yellow-400" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-400" /> Dark Mode
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
