import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getDevApiUrl = () => {
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.manifest2?.extra?.expoClient?.hostUri ||
        Constants.manifest?.debuggerHost;

    const host = hostUri?.split(':')[0];

    return host ? `http://${host}:5000/api` : '';
};

export const API_URL = (__DEV__ && getDevApiUrl()) || process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

console.log('API URL =', API_URL);

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
