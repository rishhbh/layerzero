import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-2 text-primary">
          <img src="/logo.png" alt="LayerZero Logo" className="h-5 w-5 object-cover rounded-sm" />
          <span className="font-heading font-semibold tracking-tight text-foreground">LayerZero</span>
        </div>
        <div className="flex space-x-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          <a href="https://github.com/rishhbh/layerzero" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LayerZero. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
