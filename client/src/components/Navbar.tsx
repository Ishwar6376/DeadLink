import { useState } from "react";
import { Menu, X, Sun, Moon, Home, BarChart3, Info } from "lucide-react";

interface NavbarProps {
  theme?: "dark" | "light";
  onThemeToggle?: () => void;
}

export function Navbar({ theme = "dark", onThemeToggle }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "About", href: "/about", icon: Info },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/40 border-b border-slate-700/50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="text-3xl font-black tracking-tighter bg-linear-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Short.ly
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="group relative px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-linear-to-r from-blue-400 to-purple-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-purple-500 hover:bg-slate-700/50 transition-all duration-200 hidden md:flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-700 hover:border-purple-400 hover:bg-slate-800/50 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-purple-300" />
            ) : (
              <Menu className="w-5 h-5 text-blue-300" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur border-t border-slate-700/50 px-6 py-4 space-y-2 animate-in fade-in duration-200">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={closeMenu}
              className=" px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-3"
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          ))}

          {/* Mobile Theme Toggle */}
          <button
            onClick={() => {
              onThemeToggle?.();
              closeMenu();
            }}
            className="w-full mt-4 px-4 py-3 rounded-lg border border-slate-700 hover:border-purple-400 hover:bg-slate-800/50 transition-all duration-200 flex items-center gap-3 text-sm font-medium text-slate-300"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-yellow-400" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                Dark Mode
              </>
            )}
          </button>
        </div>
      )}
    </header>
  );
}