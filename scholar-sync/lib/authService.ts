import apiService from "@/lib/apiService";

export type UserLoginDto = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access_token: string;
};

const authService = {
    login: async (payload: UserLoginDto) => {
        return apiService.post<LoginResponse, UserLoginDto>(
            "/auth/login",
            payload
        );
    },
};

export default authService;
