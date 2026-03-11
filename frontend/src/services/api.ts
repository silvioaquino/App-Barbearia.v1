/*import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@barbershop_api_url';

/**
 * Gets the stored custom API URL (set by user in server config screen)
 *
export async function getStoredApiUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves a custom API URL to AsyncStorage
 *
export async function setStoredApiUrl(url: string | null): Promise<void> {
  try {
    if (url) {
      await AsyncStorage.setItem(STORAGE_KEY, url);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Determines the API base URL based on environment:
 * - Web: Uses relative path /api (proxy handles routing)
 * - Mobile: Uses stored custom URL > EXPO_PUBLIC_LOCAL_API_URL > EXPO_PUBLIC_BACKEND_URL
 *
function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    console.log('📡 Using relative API URL: /api');
    return '/api';
  }

  const localApiUrl = process.env.EXPO_PUBLIC_LOCAL_API_URL;
  if (localApiUrl) {
    console.log('📡 Using LOCAL API URL:', localApiUrl);
    return `${localApiUrl}/api`;
  }
  
  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
                     process.env.EXPO_PUBLIC_BACKEND_URL ||
                     'https://agendacorte-6.preview.emergentagent.com';
  
  console.log('📡 Using API URL:', backendUrl);
  return `${backendUrl}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Initializes the API client with the stored custom URL (for mobile)
 * Call this on app startup
 *
export async function initApiUrl(): Promise<void> {
  if (Platform.OS === 'web') return;
  
  const storedUrl = await getStoredApiUrl();
  if (storedUrl) {
    const newBase = `${storedUrl}/api`;
    api.defaults.baseURL = newBase;
    console.log('📡 Loaded stored API URL:', newBase);
  }
}

/**
 * Updates the API base URL dynamically (for mobile server config)
 *
export function updateApiBaseUrl(serverUrl: string): void {
  const newBase = `${serverUrl}/api`;
  api.defaults.baseURL = newBase;
  console.log('📡 Updated API URL to:', newBase);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = (global as any).authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      (global as any).authToken = null;
    }
    return Promise.reject(error);
  }
);

export default api;*/




import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@barbershop_api_url';

/**
 * Gets the stored custom API URL (set by user in server config screen)
 */
export async function getStoredApiUrl(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves a custom API URL to AsyncStorage
 */
export async function setStoredApiUrl(url: string | null): Promise<void> {
  try {
    if (url) {
      await AsyncStorage.setItem(STORAGE_KEY, url);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Determines the API base URL based on environment:
 * - Web: Uses backend URL from env
 * - Mobile: Uses stored URL > LOCAL_API_URL > BACKEND_URL
 */
function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    // Para web, usa a URL do backend do .env
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';
    console.log('🌐 Web using backend URL:', backendUrl);
    const cleanUrl = backendUrl.replace(/\/$/, '');
    return `${cleanUrl}/api`;
  }

  // PARA MOBILE - PRIORIDADE:
  // 1. URL customizada salva pelo usuário (já tratada no initApiUrl)
  // 2. LOCAL_API_URL do .env (para desenvolvimento)
  // 3. BACKEND_URL do .env (produção)
  
  // Primeiro, verifica se tem URL local configurada no .env
  const localApiUrl = process.env.EXPO_PUBLIC_LOCAL_API_URL;
  if (localApiUrl) {
    console.log('📱 Mobile using LOCAL API URL:', localApiUrl);
    // Garante que não tenha barra no final
    const cleanUrl = localApiUrl.replace(/\/$/, '');
    return `${cleanUrl}/api`;
  }
  
  // Fallback para produção
  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 
                     process.env.EXPO_PUBLIC_BACKEND_URL ||
                     'https://barber-manager-26.preview.emergentagent.com';
  
  console.log('📱 Mobile using BACKEND URL (fallback):', backendUrl);
  const cleanUrl = backendUrl.replace(/\/$/, '');
  return `${cleanUrl}/api`;
}

// Cria a instância do axios com a URL base
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Initializes the API client with the stored custom URL (for mobile)
 * Call this on app startup
 */
export async function initApiUrl(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('🌐 Web mode - using URL:', api.defaults.baseURL);
    return;
  }
  
  // Tenta carregar URL salva pelo usuário
  const storedUrl = await getStoredApiUrl();
  if (storedUrl) {
    const cleanUrl = storedUrl.replace(/\/$/, '');
    const newBase = `${cleanUrl}/api`;
    api.defaults.baseURL = newBase;
    console.log('📦 Loaded STORED API URL:', newBase);
  } else {
    // Se não tem URL salva, usa a do ambiente
    console.log('📦 Using ENV API URL:', api.defaults.baseURL);
  }
}

/**
 * Updates the API base URL dynamically (for mobile server config)
 */
export function updateApiBaseUrl(serverUrl: string): void {
  const cleanUrl = serverUrl.replace(/\/$/, '');
  const newBase = `${cleanUrl}/api`;
  api.defaults.baseURL = newBase;
  console.log('🔄 Updated API URL to:', newBase);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log da requisição em desenvolvimento
    if (__DEV__) {
      console.log('🚀 Request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        data: config.data,
      });
    }

    const token = (global as any).authToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (__DEV__) {
      console.log('✅ Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    // Log detalhado do erro em desenvolvimento
    if (__DEV__) {
      console.log('❌ Response Error:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
    }

    if (error.response?.status === 401) {
      (global as any).authToken = null;
    }
    return Promise.reject(error);
  }
);

// Função de utilidade para testar a conexão
export async function testApiConnection(): Promise<boolean> {
  try {
    console.log('🔄 Testing API connection to:', api.defaults.baseURL);
    
    // Tenta acessar a raiz da API ou um endpoint de health check
    const response = await api.get('/health', { timeout: 5000 });
    console.log('✅ API connection successful:', response.status);
    return true;
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    
    // Tenta sem o /api para testar a conexão base
    try {
      const baseUrl = api.defaults.baseURL?.replace(/\/api$/, '');
      console.log('🔄 Testing base URL connection:', baseUrl);
      
      const testResponse = await axios.get(`${baseUrl}/docs`, { timeout: 5000 });
      console.log('✅ Base URL connection successful:', testResponse.status);
      return true;
    } catch (baseError) {
      console.log('❌ Base URL connection failed:', baseError.message);
      return false;
    }
  }
}

export default api;
