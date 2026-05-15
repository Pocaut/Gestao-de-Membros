export type Member = {
  id: number;
  fullName: string;
  age: number;
  cpf: string;
  active: boolean;
};

export type MemberPayload = {
  fullName: string;
  birthDate: string;
  cpf: string;
  active: boolean;
};

export type ApiError = {
  timestamp?: string;
  message?: string;
  detail?: string;
  fieldErrors?: Record<string, string>;
};

const API_URL = 'http://localhost:8080/api/members';

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  const fallback: ApiError = { message: 'Não foi possível concluir a operação.' };
  const error = (await response.json().catch(() => fallback)) as ApiError;

  throw {
    ...error,
    message: error.message ?? error.detail ?? fallback.message,
  };
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function createMember(payload: MemberPayload, token: string): Promise<Member> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  return parseResponse<Member>(response);
}

export async function fetchMembers(token: string): Promise<Member[]> {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse<Member[]>(response);
}

export async function updateMemberStatus(
  memberId: number,
  active: boolean,
  token: string,
): Promise<Member> {
  const response = await fetch(`${API_URL}/${memberId}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ active }),
  });

  return parseResponse<Member>(response);
}
