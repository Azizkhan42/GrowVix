import { useState } from 'react';
import api from '../services/api';
import { AuthContext } from './context';

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updatePlan = async (plan) => {
    try {
      const { data } = await api.put('/auth/plan', { plan });
      const updatedUser = { ...user, plan: data.plan };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update plan';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}