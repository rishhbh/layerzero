import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full glass-surface">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-primary hover:scale-105 active:scale-95 transition-all duration-150 ease-out">
          <Layers className="h-6 w-6" />
          <span className="font-heading font-bold text-xl tracking-tight text-foreground">LayerZero</span>
        </Link>
        <div className="flex items-center sm:space-x-16 xs:space-x-2">
          <Link to="/about" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-150 ease-out">
            About
          </Link>
          <a href="https://github.com/render-thevoid" target="_blank" rel="noreferrer" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-150 ease-out">
            GitHub
          </a>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-150 ease-out">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center space-x-1 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hidden md:block hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-150 ease-out">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-heading font-bold bg-primary py-2 px-3 rounded-none text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
              >
                Let's Go
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;