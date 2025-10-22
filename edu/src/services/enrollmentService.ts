// updated: include credentials and X-Session-Id header fallback
export type Enrollment = {
  id?: number | string;
  userId?: number;
  studentId?: number;
  classId: number;
  paymentId?: number;
  status?: string;
  enrolledAt?: string;
  expiresAt?: string;
  [key: string]: any;
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) ?? 'http://localhost:8081';
const ENDPOINT = `${API_BASE}/api/enrollments`;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getSessionHeader(): Record<string, string> {
  // store sessionId in localStorage on login using the login response (dev convenience)
  const sessionId = localStorage.getItem('sessionId');
  return sessionId ? { 'X-Session-Id': sessionId } : {};
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
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const res = await fetch(`${ENDPOINT}/${id}`, {
    credentials: 'include',
    headers,
  });
  return handleResponse(res);
}

// Replace or update the existing getByUserId implementation to call /student/{id}
export async function getByUserId(userId: number | string): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };

  // NOTE: backend exposes /student/{studentId} not /user/{id}
  const res = await fetch(`${ENDPOINT}/student/${userId}`, {
    credentials: 'include',
    headers,
  });

  // If backend returns 404 when there are no enrollments, treat as empty list
  if (res.status === 404) return [];

  return handleResponse(res);
}

export async function getByPaymentId(paymentId: number | string): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const res = await fetch(`${ENDPOINT}/payment/${paymentId}`, {
    credentials: 'include',
    headers,
  });
  return handleResponse(res);
}

export async function getByClassId(classId: number | string): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const res = await fetch(`${ENDPOINT}/class/${classId}`, {
    credentials: 'include',
    headers,
  });
  return handleResponse(res);
}

export async function createEnrollment(dto: { studentId?: number; userId?: number; classId: number; paymentId?: number }) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const res = await fetch(`${ENDPOINT}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const res = await fetch(`${ENDPOINT}/me`, {
    credentials: 'include',
    headers,
  });

  // treat missing/404 as empty list (defensive)
  if (res.status === 404) return [];
  return handleResponse(res);
}

export default {
  getById,
  getByUserId,
  getByPaymentId,
  getMyEnrollments,
  getByClassId,
  createEnrollment,
};