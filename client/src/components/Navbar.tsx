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
          <a href="https://github.com/rishhbh" target="_blank" rel="noreferrer" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 transition-all duration-150 ease-out">
            GitHub
          </a>
          {user ? (
            <div className="flex items-center space-x-3">
              {/* Desktop only: username + continue button */}
              <span className="text-sm font-medium text-foreground hidden md:block">
                {user.name.split(' ')[0]}
              </span>
              <Link
                to="/dashboard/url"
                className="hidden md:block text-sm font-heading font-bold bg-primary py-2 px-3 rounded-none text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
              >
                Continue to Dashboard
              </Link>
              {/* Mobile only: compact dashboard icon */}
              <Link
                to="/dashboard/url"
                className="md:hidden h-8 w-8 bg-primary rounded-none flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Layers className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center space-x-1 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-heading font-bold bg-primary py-2 px-3 rounded-none text-primary-foreground hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-150 ease-out"
              >
                Let's Go
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;