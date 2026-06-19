import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, FileText, Link as LinkIcon, LogOut, User } from 'lucide-react';
import { cn } from '../lib/utils';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="h-screen overflow-hidden flex bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Layers className="h-6 w-6 text-primary mr-2" />
          <span className="font-heading font-bold text-xl tracking-tight">LayerZero</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink
            to="/dashboard/url"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-none transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <LinkIcon className="h-5 w-5" />
            <span>URL Summarizer</span>
          </NavLink>
          <NavLink
            to="/dashboard/doc"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2 rounded-none transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <FileText className="h-5 w-5" />
            <span>Doc Summarizer</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 w-full rounded-none text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
 
       {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-end px-6">
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex flex-col items-end">
              <span className="font-medium text-foreground">{user?.name || 'User'}</span>
              <span className="text-muted-foreground text-xs">{user?.email || ''}</span>
            </div>
            <div className="h-8 w-8 rounded-none bg-primary/20 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
