import axios from 'axios';
const http = axios.create({
  baseURL: 'http://localhost:3033',
});

export const apiLogin = (email: string, password: string) =>
  http.post('/authentication', { email, password, strategy: 'local' });

export const apiGetAuth = () => http.get('/users');

export const apiRegister = (email: string, password: string) =>
  http.post('/users', { email, password });
