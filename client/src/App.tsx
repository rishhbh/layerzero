import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import UrlSummarizer from './pages/UrlSummarizer';
import DocSummarizer from './pages/DocSummarizer';

function App() {
  return (
    <AuthProvider>
      <CustomCursor />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard/url" replace />} />
              <Route path="url" element={<UrlSummarizer />} />
              <Route path="doc" element={<DocSummarizer />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" toastOptions={{
        style: {
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fafafa',
        }
      }} />
    </AuthProvider>
  );
}

export default App;