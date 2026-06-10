export interface LoginData {
    email: string;
    password: string;
}
export interface LoginResponse {
    access_token: string;
    admin: {
        id: string;
        email: string;
        name: string | null;
    };
}
export interface Admin {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}
export declare const authApi: {
    login: (data: LoginData) => any;
    getProfile: () => any;
};
//# sourceMappingURL=auth.d.ts.map