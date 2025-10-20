// src/services/enrollmentService.ts
export type Enrollment = {
  id?: number | string;
  userId: number;
  classId: number;
  paymentId: number;
  // allow additional returned fields
  [key: string]: any;
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) ?? 'http://localhost:8081';
const ENDPOINT = `${API_BASE}/api/enrollments`;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let body: unknown = null;
    try {
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }
    } catch (e) {
      body = null;
    }
    let message = res.statusText ?? 'Request failed';
    if (body && typeof body === 'object') {
      const b = body as Record<string, any>;
      message = b.message ?? b.error ?? message;
    } else if (typeof body === 'string') {
      message = body || message;
    }
    throw new Error(message);
  }
  if (contentType.includes('application/json')) return res.json();
  return null;
}

export async function getById(id: number | string): Promise<Enrollment> {
  const res = await fetch(`${ENDPOINT}/${id}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
}

export async function getByUserId(userId: number | string): Promise<Enrollment[]> {
  const res = await fetch(`${ENDPOINT}/user/${userId}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
}

export async function getByPaymentId(paymentId: number | string): Promise<Enrollment[]> {
  const res = await fetch(`${ENDPOINT}/payment/${paymentId}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
}

export async function getByClassId(classId: number | string): Promise<Enrollment[]> {
  const res = await fetch(`${ENDPOINT}/class/${classId}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  return handleResponse(res);
}

// Optional: create enrollment (if frontend needs to create)
export async function createEnrollment(dto: { userId: number; classId: number; paymentId: number }) {
  const res = await fetch(`${ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
}

export default {
  getById,
  getByUserId,
  getByPaymentId,
  getByClassId,
  createEnrollment,
};