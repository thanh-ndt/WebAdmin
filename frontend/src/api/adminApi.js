import api from './axiosConfig';

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getMonthlyRevenue = () => api.get('/dashboard/monthly-revenue');
export const getRevenueDetails = (year, month) => api.get(`/dashboard/revenue-details/${year}/${month}`);

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
export const getVehicleStats = () => api.get('/vehicles/stats');

// Brands
export const getBrands = () => api.get('/brands');
export const createBrand = (data) => api.post('/brands', data);
export const updateBrand = (id, data) => api.put(`/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/brands/${id}`);
export const getBrandStats = () => api.get('/brands/stats');

// Vehicle Models
export const getVehicleModels = () => api.get('/vehicle-models');
export const createVehicleModel = (data) => api.post('/vehicle-models', data);
export const updateVehicleModel = (id, data) => api.put(`/vehicle-models/${id}`, data);
export const deleteVehicleModel = (id) => api.delete(`/vehicle-models/${id}`);
export const getVehicleModelStats = () => api.get('/vehicle-models/stats');

// Appointments
export const getAppointments = (params) => api.get('/appointments', { params });
export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}/status`, { status });
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const getAppointmentStats = () => api.get('/appointments/stats');

// Chat
export const getChatRooms = () => api.get('/chats');
export const getMessages = (roomId, params) =>
  api.get(`/chats/${roomId}/messages`, { params });
export const sendMessage = (roomId, data) =>
  api.post(`/chats/${roomId}/messages`, data);

// Users
export const getUserStats = () => api.get('/users/stats');
export const getUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Orders
export const getOrderStats = () => api.get('/orders/stats');
export const getOrders = (params) => api.get('/orders', { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Reviews
export const getReviewStats = () => api.get('/reviews/stats');
export const getReviews = (params) => api.get('/reviews', { params });
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Promotions
export const getPromotions = () => api.get('/promotions/all');
export const createPromotion = (data) => api.post('/promotions', data);
export const updatePromotion = (id, data) => api.put(`/promotions/${id}`, data);
export const deletePromotion = (id) => api.delete(`/promotions/${id}`);

export default api;
