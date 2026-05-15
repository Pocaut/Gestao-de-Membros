export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  tokenType: string;
  expiresInMinutes: number;
};

type ApiError = {
  message?: string;
  detail?: string;
  fieldErrors?: Record<string, string>;
};

const API_URL = 'http://localhost:8080/api/auth/login';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (response.ok) {
    return response.json();
  }

  const error = (await response.json().catch(() => ({
    message: 'Não foi possível autenticar.',
  }))) as ApiError;

  throw {
    ...error,
    message: error.message ?? error.detail ?? 'Não foi possível autenticar.',
  };
}
