import { apiClient } from "@/lib/axios";

const apiService = {
    get: async <T>(url: string, params?: Record<string, unknown>) => {
        const response = await apiClient.get<T>(url, { params });
        return response.data;
    },
    post: async <T, B = unknown>(url: string, body?: B) => {
        const response = await apiClient.post<T>(url, body);
        return response.data;
    },
    put: async <T, B = unknown>(url: string, body?: B) => {
        const response = await apiClient.put<T>(url, body);
        return response.data;
    },
    patch: async <T, B = unknown>(url: string, body?: B) => {
        const response = await apiClient.patch<T>(url, body);
        return response.data;
    },
    delete: async <T>(url: string) => {
        const response = await apiClient.delete<T>(url);
        return response.data;
    },
};

export default apiService;
