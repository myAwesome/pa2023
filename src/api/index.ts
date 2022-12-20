import axios from 'axios';
const http = axios.create({
  baseURL: 'http://localhost:3033',
});

http.interceptors.request.use(
  (config) => {
    if (config.url !== '/authentication') {
      (config.headers || {})['Authorization'] = `Bearer ${localStorage.getItem(
        'access_token',
      )}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const apiLogin = async (email: string, password: string) => {
  const { data } = await http.post('/authentication', {
    email,
    password,
    strategy: 'local',
  });
  if (data.accessToken) {
    localStorage.setItem('access_token', data.accessToken);
  }
};

export const apiGetAuth = () => http.get('/users/me');

export const apiRegister = (email: string, password: string) =>
  http.post('/users', { email, password });
