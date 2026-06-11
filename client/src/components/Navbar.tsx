import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-primary">
          <Layers className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight text-foreground">LayerZero</span>
        </Link>
        <div className="flex items-center sm:space-x-16 xs:space-x-2">
          <Link to="/about" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <a href="https://github.com/render-thevoid" target="_blank" rel="noreferrer" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </a>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hidden md:block hover:text-foreground transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-linear-to-r from-black/2 via-primary to-black/10 text-background hover:bg-primary-hover p-2 px-3 rounded-md transition-colors"
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