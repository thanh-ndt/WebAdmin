import api from './axiosConfig';

export const getAdminNotifications = (page = 1, limit = 20) => {
    return api.get(`/notifications?page=${page}&limit=${limit}`);
};

export const markNotificationAsRead = (id) => {
    return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
    return api.put('/notifications/mark-all-read');
};
