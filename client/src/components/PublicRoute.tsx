import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PublicRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return null;
    return user ? <Navigate to="/dashboard/url" replace /> : <Outlet />;
};
