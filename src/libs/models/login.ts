import type { UserResponse } from "./user";

export interface LoginResponse {
    jwtToken: string;
    username: string;
    role: string;
    userResponse: UserResponse;
}

export interface LoginRequest {
    username: string;
    password: string;
}