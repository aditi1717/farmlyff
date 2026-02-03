import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useCartStore from '../store/useCartStore';
import useUserStore from '../store/useUserStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`${API_URL}/users/profile`, {
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser({ ...data, id: data._id });
                    localStorage.setItem('farmlyf_current_user', JSON.stringify({ ...data, id: data._id }));
                } else {
                    setUser(null);
                    localStorage.removeItem('farmlyf_current_user');
                }
            } catch (error) {
                console.error("Auth status check failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {

        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = { ...data, id: data._id }; 
                setUser(userObj);
                localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));
                toast.success('Logged in successfully!');
                return { success: true };
            } else {
                toast.error(data.message || 'Login failed');
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error('Network error, please try again');
            return { success: false, message: 'Network error, please try again' };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                 const userObj = { ...data, id: data._id };
                 setUser(userObj);
                 localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));
                 toast.success('Account created successfully!');
                 return { success: true };
            } else {
                 toast.error(data.message || 'Signup failed');
                 return { success: false, message: data.message || 'Signup failed' };
            }
        } catch (error) {
             console.error("Signup Error:", error);
             toast.error('Network error, please try again');
             return { success: false, message: 'Network error, please try again' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/users/logout`, { method: 'POST', credentials: 'include' });
            toast.success('Logged out successfully');
        } catch (error) {
            console.error("Logout error:", error);
            toast.error('Logout failed');
        }
        
        // Clear Zustand Stores
        if (user) {
            useCartStore.getState().clearCart(user.id);
            useUserStore.getState().clearUserPrefs(user.id);
        }

        setUser(null);
        localStorage.removeItem('farmlyf_current_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
