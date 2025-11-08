import type { UserResponse } from "./user";

export interface LoginResponse {
    jwtToken: string;
    jwtIssuedAt: string;
    jwtExpirationTime: string;
    username: string;
    role: string;
    userResponse: UserResponse;
}

export interface LoginRequest {
    email: string;
    password: string;
}