import axios from "axios";

// Base API URL for backend Express server
const API_BASE_URL = "https://pluscare-q7cx.onrender.com/api";
// const API_BASE_URL = "http://localhost:5000/api";

// Create Axios Instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach JWT Token if available in localStorage
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                if (parsedUser && parsedUser.token) {
                    config.headers.Authorization = `Bearer ${parsedUser.token}`;
                }
            } catch (e) {
                console.error("Error parsing user token:", e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth Service Endpoints
export const authService = {
    register: (userData) => api.post("/users/register", userData),
    login: (credentials) => api.post("/users/login", credentials),
    forgotPassword: (emailData) => api.post("/patient/forgot-password", emailData),
    getProfile: () => api.get("/users/profile"),
    getDoctors: () => api.get("/users/doctors"),
};

// Doctor Service Endpoints
export const doctorService = {
    getDoctors: () => api.get("/users/doctors"),
};

// Appointment Service Endpoints
export const appointmentService = {
    createAppointment: (data) => api.post("/appointments", data),
    getAppointments: () => api.get("/appointments"),
    getAppointmentById: (id) => api.get(`/appointments/${id}`),
    updateStatus: (id, statusData) => api.put(`/appointments/${id}/status`, statusData),
    deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

export const patientService = {
    getAppointments: (id) => api.get(`/appointments/patient/${id}`),
    getMedicalRecords: (id) => api.get(`/medical-records/patient/${id}`),
    getPrescriptions: (id) => api.get(`/prescriptions/patient/${id}`),
    getBills: (id) => api.get(`/billing/patient/${id}`),
};

// AI Service Endpoints
export const aiService = {
    chat: (messages) => api.post("/ai/chat", { messages }),
    triage: (symptom) => api.post("/ai/triage", { symptom }),
    bookSmartAppointment: (bookingData) => api.post("/ai/book", bookingData),
};

// Medical Record Service Endpoints (Doctor)
export const medicalRecordService = {
    getAssignedPatients: () => api.get("/medical-records/patients"),
    getDoctorRecords: () => api.get("/medical-records"),
    getPatientRecords: (patientId) => api.get(`/medical-records/patient/${patientId}`),
    getRecordById: (id) => api.get(`/medical-records/${id}`),
    createRecord: (recordData) => api.post("/medical-records", recordData),
    updateRecord: (id, recordData) => api.put(`/medical-records/${id}`, recordData),
};

// Services Module Endpoints
export const serviceApi = {
    getServices: (params) => api.get("/services", { params }),
    getCategories: () => api.get("/services/categories"),
    getServiceById: (id) => api.get(`/services/${id}`),
    createService: (data) => api.post("/services", data),
    updateService: (id, data) => api.put(`/services/${id}`, data),
    deleteService: (id) => api.delete(`/services/${id}`),
};

// Provider / Doctor Endpoints
export const providerApi = {
    getProviders: (params) => api.get("/providers", { params }),
    getProvidersByCategory: (category) =>
        api.get(`/providers/category/${encodeURIComponent(category)}`),
    getProviderById: (id) => api.get(`/providers/${id}`),
    getProviderAvailability: (id, date) =>
        api.get(`/providers/${id}/availability`, { params: { date } }),
    upsertProvider: (data) => api.post("/providers", data),
};

// Booking Endpoints
export const serviceBookingApi = {
    createBooking: (bookingData) => api.post("/bookings", bookingData),
    getUserBookings: () => api.get("/bookings/user"),
    getProviderBookings: () => api.get("/bookings/provider"),
    getAllBookings: (params) => api.get("/bookings", { params }),
    updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
    cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
    sendReceipt: (id) => api.post(`/bookings/${id}/send-receipt`),
    getReceipt: (id) => api.get(`/bookings/${id}/receipt`),
};

// Review Endpoints
export const reviewApi = {
    createReview: (reviewData) => api.post("/reviews", reviewData),
    getServiceReviews: (serviceId) => api.get(`/reviews/service/${serviceId}`),
    getProviderReviews: (providerId) => api.get(`/reviews/provider/${providerId}`),
};

// Notification Endpoints
export const notificationApi = {
    getNotifications: () => api.get("/notifications"),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// Admin Stats
export const adminServiceStatsApi = {
    getStats: () => api.get("/admin/stats/services"),
};

export default api;
