import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full glass-surface border-b border-border">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center text-foreground group transition-opacity hover:opacity-85">
          <span className="font-heading font-normal text-2xl tracking-tight text-foreground">layerzero</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/about" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <a href="https://github.com/rishhbh/layerzero" target="_blank" rel="noreferrer" className="text-sm hidden md:block font-medium text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </a>
          
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground hidden md:block">
                {user.name.split(' ')[0]}
              </span>
              <Button
                asChild
                className="hidden md:inline-flex"
              >
                <Link to="/dashboard/url">
                  Dashboard
                </Link>
              </Button>
              <Link
                to="/dashboard/url"
                className="md:hidden h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-colors"
              >
                <Layers className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:block">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;