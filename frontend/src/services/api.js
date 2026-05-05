import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const userService = {
  login: (email, password) => api.get('/users').then(res => res.data.find(u => u.email === email)), // Mock login
  getUsers: () => api.get('/users').then(res => res.data),
  createUser: (data) => api.post('/users', data).then(res => res.data),
};

export const productService = {
  getProducts: () => api.get('/products').then(res => res.data),
  createOrder: (data) => api.post('/orders', data).then(res => res.data),
};

export const leadService = {
  getLeads: () => api.get('/leads').then(res => res.data),
  createLead: (data) => api.post('/leads', data).then(res => res.data),
  updateLead: (id, data) => api.patch(`/leads/${id}`, data).then(res => res.data),
  getHistory: (id) => api.get(`/lead-history/${id}`).then(res => res.data),
};

export const contractService = {
  getContract: (id) => api.get(`/contracts/${id}`).then(res => res.data),
  sendOtp: (id) => api.post(`/contracts/${id}/send-otp`).then(res => res.data),
  verifyOtp: (id, otp) => api.post(`/contracts/${id}/verify`, { otp }).then(res => res.data),
};

export default api;