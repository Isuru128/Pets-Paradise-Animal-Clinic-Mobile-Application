import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rawUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://pets-paradise-mobile-application-ba.vercel.app').trim();
const cleanUrl = rawUrl.replace(/\/+$/, '');
export const API_URL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;

const API = axios.create({
    baseURL: API_URL
});

API.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;
