import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);

            if (data.role === 'Super Admin') {
                navigate('/admin');
            } else if (data.role === 'Doctor') {
                navigate('/doctor');
            } else if (data.role === 'Receptionist') {
                navigate('/receptionist');
            }
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const registerUser = async (name, email, password, role) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);

            if (data.role === 'Super Admin') {
                navigate('/admin');
            } else if (data.role === 'Doctor') {
                navigate('/doctor');
            } else if (data.role === 'Receptionist') {
                navigate('/receptionist');
            }
            return data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, registerUser, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
