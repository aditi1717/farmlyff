import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { useAuth } from '../../../context/AuthContext';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    // Check if user is logged in AND is an admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="bg-[#fcfcfc] min-h-screen">
            <AdminSidebar />
            <div className="pl-72 flex flex-col min-h-screen">
                <AdminHeader />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
