import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REDIRECT_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'https://barber-dashboard-14.preview.emergentagent.com';
const AUTH_URL = 'https://auth.emergentagent.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (token) {
        global.authToken = token;
        const response = await api.get('/auth/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      await AsyncStorage.removeItem('session_token');
      global.authToken = null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    try {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const redirectUrl = `${REDIRECT_URL}/auth-callback`;
      const authUrl = `${AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const sessionId = url.hash.replace('#session_id=', '');
        
        if (sessionId) {
          const response = await api.post('/auth/session', null, {
            params: { session_id: sessionId }
          });
          
          const { user: userData, session_token } = response.data;
          await AsyncStorage.setItem('session_token', session_token);
          global.authToken = session_token;
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('session_token');
      global.authToken = null;
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
