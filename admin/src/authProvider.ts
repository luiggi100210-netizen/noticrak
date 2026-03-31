import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const authProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email: username,
        password,
      });
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.usuario));
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(
        new Error(error?.response?.data?.error || 'Credenciales inválidas')
      );
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: (error: any) => {
    const status = error?.status || error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return Promise.resolve({
        id: user.id,
        fullName: user.nombre,
        avatar: user.avatar,
      });
    } catch {
      return Promise.reject();
    }
  },

  getPermissions: () => {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
      return Promise.resolve(user.rol || 'periodista');
    } catch {
      return Promise.resolve('periodista');
    }
  },
};

export default authProvider;
