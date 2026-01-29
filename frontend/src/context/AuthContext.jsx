import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users/profile', {
                    headers: { 'Content-Type': 'application/json' },
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
        // Admin Backdoor
        if (email === 'admin@farmlyf.com' && password === 'admin') {
            const adminUser = { id: 'admin_01', name: 'Super Admin', email, role: 'admin' };
            setUser(adminUser);
            localStorage.setItem('farmlyf_current_user', JSON.stringify(adminUser));
            return { success: true };
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const userObj = { ...data, id: data._id }; 
                setUser(userObj);
                localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: 'Network error, please try again' };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                 const userObj = { ...data, id: data._id };
                 setUser(userObj);
                 localStorage.setItem('farmlyf_current_user', JSON.stringify(userObj));
                 return { success: true };
            } else {
                 return { success: false, message: data.message || 'Signup failed' };
            }
        } catch (error) {
             console.error("Signup Error:", error);
             return { success: false, message: 'Network error, please try again' };
        }
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:5000/api/users/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout error:", error);
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
