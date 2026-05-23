export interface User {
  id: number;
  username: string;
  role?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  message?: string;
  username?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
