import { useState } from "react";
import { Menu, X, Home, BarChart3, Info } from "lucide-react";
import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton } from "@clerk/clerk-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "About", href: "/about", icon: Info },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/40 border-b border-slate-800/50">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <a
          href="/"
          className="text-3xl font-black tracking-tighter bg-linear-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Short.ly
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="group relative px-1 py-2 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/80 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </a>
          ))}

          {/* Clerk Auth Buttons */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5 text-purple-300" /> : <Menu className="w-5 h-5 text-blue-300" />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur border-t border-slate-800/60 px-6 py-4 space-y-2 animate-in fade-in duration-200">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={closeMenu}
              className="px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 transition flex items-center gap-3"
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          ))}

          {/* Auth Section */}
          <div className="pt-4 flex flex-col gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full px-4 py-3 rounded-lg bg-blue-600 text-sm font-medium hover:bg-blue-700 transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="w-full px-4 py-3 rounded-lg bg-purple-600 text-sm font-medium hover:bg-purple-700 transition">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  );
}
