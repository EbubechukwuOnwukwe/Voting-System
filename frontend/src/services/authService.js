import api from './api';

const saveSession = (data) => {
  if (data.tokens) {
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

const authService = {
  async register(data) { const r = await api.post('/auth/register/', data); saveSession(r.data); return r.data; },
  async login(data) { const r = await api.post('/auth/login/', data); saveSession(r.data); return r.data; },
  async requestPasswordReset(email) { return (await api.post('/auth/password-reset/', {email})).data; },
  async confirmPasswordReset(uid, token, data) { return (await api.post(`/auth/password-reset/${uid}/${token}/`, data)).data; },
  logout() { localStorage.clear(); },
  getCurrentUser() { const v=localStorage.getItem('user'); return v ? JSON.parse(v) : null; },
  isAuthenticated() { return !!localStorage.getItem('access_token'); },
};
export default authService;
