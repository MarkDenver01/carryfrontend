export interface UserResponse {
    userId: number;
    userName: string;
    email: string;
    createdAt: string;
    profileUrl: string;
    accountStatus: string;
}

export interface UserRequest {
    userName: string;
    email: string;
    role: string;
    password: string;
}