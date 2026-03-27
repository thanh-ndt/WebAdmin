import api from './axiosConfig';

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// Vehicles
export const getVehicles = (params) => api.get('/vehicles', { params });
export const getVehicleById = (id) => api.get(`/vehicles/${id}`);
export const createVehicle = (formData) =>
  api.post('/vehicles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateVehicle = (id, formData) =>
  api.put(`/vehicles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Brands
export const getBrands = () => api.get('/brands');
export const createBrand = (data) => api.post('/brands', data);
export const updateBrand = (id, data) => api.put(`/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/brands/${id}`);

// Vehicle Models
export const getVehicleModels = () => api.get('/vehicle-models');

// Appointments
export const getAppointments = (params) => api.get('/appointments', { params });
export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// Chat
export const getChatRooms = () => api.get('/chats');
export const getMessages = (roomId, params) =>
  api.get(`/chats/${roomId}/messages`, { params });
export const sendMessage = (roomId, data) =>
  api.post(`/chats/${roomId}/messages`, data);

// Users
export const getUserStats  = ()         => api.get('/users/stats');
export const getUsers      = (params)   => api.get('/users', { params });
export const getUserById   = (id)       => api.get(`/users/${id}`);
export const updateUser    = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser    = (id)       => api.delete(`/users/${id}`);

export default api;
