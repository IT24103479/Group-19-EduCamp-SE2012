// updated enrollment_service.ts
// Ensures normalizeEnrollment exports className and classGrade so UIs can show class name and grade.

export type Enrollment = {
  id?: number | string;
  userId?: number;
  studentId?: number;
  studentNumber?: string | null;
  classId?: number;
  className?: string;
  classGrade?: string;
  paymentId?: number;
  status?: boolean;
  enrolledAt?: string;
  expiresAt?: string;
  raw?: any;
  [key: string]: any;
};

const API_BASE = (import.meta.env.VITE_API_BASE as string) ?? 'http://localhost:8081';
const ENDPOINT = `${API_BASE}/api/enrollments`;

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getSessionHeader(): Record<string, string> {
  const sessionId = localStorage.getItem('sessionId');
  return sessionId ? { 'X-Session-Id': sessionId } : {};
}

async function handleResponse(res: Response) {
  // Debug: log status and headers
  console.debug('[ENROLLMENT SERVICE] HTTP', res.status, res.statusText, Array.from(res.headers.entries()));

  const contentType = res.headers.get('content-type') || '';

  // Read raw body text for debugging; clone so we don't consume the original stream
  let textBody: string | null = null;
  try {
    textBody = await res.clone().text();
    console.debug('[ENROLLMENT SERVICE] raw response body:', textBody);
  } catch (e) {
    console.debug('[ENROLLMENT SERVICE] could not read raw body:', e);
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      if (contentType.includes('application/json')) {
        body = textBody ? JSON.parse(textBody) : null;
      } else {
        body = textBody;
      }
    } catch (e) {
      body = textBody;
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

  if (contentType.includes('application/json')) {
    try {
      return textBody ? JSON.parse(textBody) : {};
    } catch (e) {
      // fallback
      return res.json();
    }
  }
  return null;
}

/**
 * Robust status parsing helper
 * Accepts boolean, number (1/0), string ("1"/"0","true"/"false","active"/"inactive"), etc.
 */
export function parseStatusValue(v: any): boolean | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).trim().toLowerCase();
  if (s === '') return undefined;
  if (['true', '1', 'yes', 'y', 'active', 'on'].includes(s)) return true;
  if (['false', '0', 'no', 'n', 'inactive', 'off'].includes(s)) return false;
  // fallback: treat unknown non-empty as true to be permissive; change if you prefer false
  return true;
}

/**
 * normalizeEnrollment: exported and guaranteed to produce an Enrollment with .status normalized to boolean|undefined
 * Handles multiple backend shapes: snake_case, camelCase, nested objects, and legacy field names like `active`.
 */
export function normalizeEnrollment(raw: any): Enrollment {
  if (!raw || typeof raw !== 'object') return raw as Enrollment;

  // Try common places for the boolean status
  const statusCandidates = [
    raw.status,
    raw.active,
    raw.isActive,
    raw.active_flag,
    raw.status_flag,
    raw.state,
    raw.activeStatus,
    raw.activeStatusFlag,
    raw.active_flag_value,
    // nested possibilities
    raw.classEntity && (raw.classEntity.active ?? raw.classEntity.isActive),
    raw.payment && (raw.payment.completed ?? raw.payment.isCompleted),
  ];

  // find first non-undefined candidate
  let statusRaw: any = undefined;
  for (const c of statusCandidates) {
    if (c !== undefined) {
      statusRaw = c;
      break;
    }
  }

  // some APIs return `1`/`0` under different key names like `active: 1`, `status: 1`
  const status = parseStatusValue(statusRaw);

  // student number might be in different places (top-level, nested student, classEntity, legacy names)
  const studentNumberCandidates = [
    raw.studentNumber,
    raw.student_number,
    raw.studentNo,
    raw.student_no,
    raw.student?.studentNumber,
    raw.student?.student_number,
    raw.student?.number,
    raw.student?.student_no,
    raw.classEntity?.studentNumber,
    raw.classEntity?.student_number,
    raw.classEntity?.student?.studentNumber,
    raw.classEntity?.student?.student_number,
    raw.payment?.studentNumber,
    raw.payment?.student_number,
  ];

  let studentNumberRaw: any = null;
  for (const cand of studentNumberCandidates) {
    if (cand !== undefined && cand !== null && cand !== '') {
      studentNumberRaw = cand;
      break;
    }
  }

  const studentNumber = studentNumberRaw === null ? null : String(studentNumberRaw);

  // user id might be nested or missing
  const userId =
    raw.user_id ?? raw.userId ?? (raw.user && (raw.user.id ?? raw.user.userId));

  // class name and grade: prefer nested classEntity but accept many alternate shapes
  const className =
    raw.classEntity?.name ??
    raw.class_name ??
    raw.className ??
    raw.name ??
    (typeof raw.class === 'object' ? raw.class?.name : undefined);

  const classGrade =
    raw.classEntity?.grade ??
    raw.class_grade ??
    raw.classGrade ??
    raw.grade ??
    (raw.payment && raw.payment.grade) ??
    undefined;

  return {
    id: raw.id ?? raw.ID,
    userId: userId,
    studentId: raw.student_id ?? raw.studentId ?? (raw.student && raw.student.id),
    studentNumber: studentNumber,
    classId: raw.class_id ?? raw.classId ?? raw.classId,
    className: className ?? undefined,
    classGrade: classGrade ?? undefined,
    paymentId: raw.payment_id ?? raw.paymentId ?? (raw.payment && raw.payment.id),
    status: status,
    enrolledAt: raw.enrolled_at ?? raw.enrolledAt ?? raw.enrolledDate ?? undefined,
    expiresAt: raw.expires_at ?? raw.expiresAt ?? undefined,
    raw: raw,
  };
}

export async function getAllEnrollments(): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const url = `${ENDPOINT}`;
  console.debug('[ENROLLMENT SERVICE] GET', url);
  const res = await fetch(url, {
    credentials: 'include',
    headers,
  });

  if (res.status === 404) {
    console.debug('[ENROLLMENT SERVICE] GET', url, '-> 404 (empty list)');
    return [];
  }

  const payload = await handleResponse(res);
  console.debug('[ENROLLMENT SERVICE] GET', url, '-> payload:', payload);
  if (!payload) return [];

  // canonicalize payload shapes
  if (Array.isArray(payload)) {
    return payload.map(normalizeEnrollment);
  } else if (Array.isArray((payload as any).data)) {
    return (payload as any).data.map(normalizeEnrollment);
  } else if (payload && typeof payload === 'object') {
    // sometimes API returns a single object
    // if it's a map with enrollments under a key, attempt to find it
    if (Array.isArray((payload as any).enrollments)) {
      return (payload as any).enrollments.map(normalizeEnrollment);
    }
    // assume single enrollment object -> wrap into array
    return [normalizeEnrollment(payload)];
  }
  return [];
}

export async function getById(id: number | string): Promise<Enrollment> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const url = `${ENDPOINT}/${id}`;
  console.debug('[ENROLLMENT SERVICE] GET', url);
  const res = await fetch(url, {
    credentials: 'include',
    headers,
  });
  const payload = await handleResponse(res);
  const normalized = normalizeEnrollment(payload);
  console.debug('[ENROLLMENT SERVICE] GET', url, '-> normalized:', normalized);
  return normalized;
}

export async function getByUserId(userId: number | string): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const url = `${ENDPOINT}/student/${userId}`;
  console.debug('[ENROLLMENT SERVICE] GET', url);
  const res = await fetch(url, {
    credentials: 'include',
    headers,
  });

  if (res.status === 404) {
    console.debug('[ENROLLMENT SERVICE] GET', url, '-> 404 (empty list)');
    return [];
  }

  const payload = await handleResponse(res);
  if (Array.isArray(payload)) return payload.map(normalizeEnrollment);
  if (Array.isArray((payload as any).data)) return (payload as any).data.map(normalizeEnrollment);
  if (payload && typeof payload === 'object') return [normalizeEnrollment(payload)];
  return [];
}

export async function getByPaymentId(paymentId: number | string): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const url = `${ENDPOINT}/payment/${paymentId}`;
  console.debug('[ENROLLMENT SERVICE] GET', url);
  const res = await fetch(url, {
    credentials: 'include',
    headers,
  });
  const payload = await handleResponse(res);
  if (Array.isArray(payload)) return payload.map(normalizeEnrollment);
  if (payload && Array.isArray((payload as any).data)) return (payload as any).data.map(normalizeEnrollment);
  if (payload && typeof payload === 'object') return [normalizeEnrollment(payload)];
  return [];
}

export async function getByClassId(classId: number | string): Promise<Enrollment[]> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const url = `${ENDPOINT}/class/${classId}`;
  console.debug('[ENROLLMENT SERVICE] GET', url);
  const res = await fetch(url, {
    credentials: 'include',
    headers,
  });
  const payload = await handleResponse(res);
  if (Array.isArray(payload)) return payload.map(normalizeEnrollment);
  if (payload && Array.isArray((payload as any).data)) return (payload as any).data.map(normalizeEnrollment);
  if (payload && typeof payload === 'object') return [normalizeEnrollment(payload)];
  return [];
}

export async function createEnrollment(dto: { studentId?: number; userId?: number; classId: number; paymentId?: number }) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  console.debug('[ENROLLMENT SERVICE] POST', ENDPOINT, 'payload:', dto);
  const res = await fetch(`${ENDPOINT}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(dto),
  });
  const payload = await handleResponse(res);
  const normalized = normalizeEnrollment(payload);
  console.debug('[ENROLLMENT SERVICE] POST', ENDPOINT, '-> created (normalized):', normalized);
  console.log('[ENROLLMENT SERVICE] Created enrollment details:', normalized);
  return normalized;
}

/**
 * Backwards-compatible helper kept for callers that still use getMyEnrollments().
 * It now calls the public GET /api/enrollments endpoint.
 */
export async function getMyEnrollments(): Promise<Enrollment[]> {
  return getAllEnrollments();
}

/**
 * PUT /api/enrollments/{id}
 * Throws an Error with the server response text for better debugging.
 */
/**
 * PUT http://localhost:8081/api/enrollments/{id}
 * Throws an Error with the server response text for better debugging.
 */
export async function updateEnrollment(id: string | number, dto: any) {
    const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const baseUrl = "http://localhost:8081/api/enrollments"; // ✅ full backend URL

  const res = await fetch(`${baseUrl}/${id}`, {
    
    method: "PUT",
    headers,
    body: JSON.stringify(dto),
  });

  console.log("updateEnrollment response status:", res.status, res.statusText);

  if (!res.ok) {
    const ct = res.headers.get("content-type") ?? "";
    let bodyText = "";

    try {
      if (ct.includes("application/json")) {
        const json = await res.json();
        bodyText = JSON.stringify(json);
        console.error("Parsed error body as JSON:", bodyText);
      } else {
        bodyText = await res.text();
      }
    } catch (err) {
      bodyText = `Failed to read error body: ${err}`;
      console.error(bodyText);
    }

    throw new Error(`HTTP ${res.status} ${res.statusText} - ${bodyText}`);
  }

  return res.json();
}

/**
 * DELETE /api/enrollments/{id}
 * Throws an Error with the server response text for better debugging.
 */
export async function deleteEnrollment(id: string | number) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
  };
  const baseUrl = "http://localhost:8081/api/enrollments"; // ✅ full backend URL

  const res = await fetch(`${baseUrl}/${id}`, {
    method: "DELETE",
    headers,
  });

  console.log("deleteEnrollment response status:", res.status, res.statusText);

  if (!res.ok) {
    const ct = res.headers.get("content-type") ?? "";
    let bodyText = "";

    try {
      if (ct.includes("application/json")) {
        const json = await res.json();
        bodyText = JSON.stringify(json);
        console.error("Parsed error body as JSON:", bodyText);
      } else {
        bodyText = await res.text();
      }
    } catch (err) {
      bodyText = `Failed to read error body: ${err}`;
      console.error(bodyText);
    }

    throw new Error(`HTTP ${res.status} ${res.statusText} - ${bodyText}`);
  }

  // 204 No Content is common for DELETE; handle it gracefully
  if (res.status === 204) return null;

  // If server returns JSON or text on successful delete, return it
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    return res.json();
  } else {
    return res.text();
  }
}

export default {
  getAllEnrollments,
  getById,
  getByUserId,
  getByPaymentId,
  getMyEnrollments,
  getByClassId,
  createEnrollment,
  normalizeEnrollment,
};