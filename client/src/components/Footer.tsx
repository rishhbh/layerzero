import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
        <div className="flex items-center">
          <span className="font-heading font-normal text-xl tracking-tight text-foreground">layerzero</span>
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
          <a href="https://github.com/rishhbh/layerzero" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
        
        <div className="text-xs text-muted-foreground font-sans">
          &copy; {new Date().getFullYear()} layerzero. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
