import React, { useEffect, useState } from "react";
import {
  getMyEnrollments,
  getByClassId,
  getByPaymentId,
  createEnrollment,
  normalizeEnrollment,
  type Enrollment as ServiceEnrollment,
} from "../../services/enrollmentService";
import { useAuth } from "../../contexts/AuthContext";

type Enrollment = ServiceEnrollment & {
  displayStatus?: string;
  // className and classGrade are provided by the service.normalizeEnrollment
  className?: string;
  classGrade?: string;
};

const EnrollmentManager: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classIdFilter, setClassIdFilter] = useState<number | "">("");
  const [paymentIdInput, setPaymentIdInput] = useState<number | "">("");
  const { user } = useAuth();

  const log = (...args: any[]) => console.debug("[ENROLLMENT MANAGER]", ...args);

  // local fallback normalizer in case service normalization isn't available
  function localNormalize(raw: any) {
    try {
      const s =
        raw.status ??
        raw.active ??
        raw.isActive ??
        raw.active_flag ??
        raw.status_flag ??
        raw.state;
      const status =
        s === undefined || s === null
          ? undefined
          : typeof s === "boolean"
          ? s
          : typeof s === "number"
          ? s !== 0
          : ["true", "1", "yes", "active"].includes(String(s).trim().toLowerCase());

      // student number candidates (mirror service normalization)
      const studentNumberCandidates = [
        raw.studentNumber,
        raw.student_number,
        raw.studentNo,
        raw.student_no,
        raw.student && raw.student.studentNumber,
        raw.student && raw.student.student_number,
        raw.student && raw.student.number,
        raw.student && raw.student.student_no,
        raw.classEntity && raw.classEntity.studentNumber,
        raw.classEntity && raw.classEntity.student_number,
        raw.classEntity && raw.classEntity.student && raw.classEntity.student.studentNumber,
        raw.classEntity && raw.classEntity.student && raw.classEntity.student.student_number,
        raw.payment && raw.payment.studentNumber,
        raw.payment && raw.payment.student_number,
      ];

      let studentNumberRaw: any = null;
      for (const cand of studentNumberCandidates) {
        if (cand !== undefined && cand !== null && cand !== "") {
          studentNumberRaw = cand;
          break;
        }
      }
      const studentNumber = studentNumberRaw === null ? null : String(studentNumberRaw);

      const className =
        raw.classEntity?.name ?? raw.class_name ?? raw.className ?? raw.name;
      const classGrade =
        raw.classEntity?.grade ?? raw.class_grade ?? raw.classGrade ?? raw.grade;

      return {
        id: raw.id ?? raw.ID,
        studentId: raw.student_id ?? raw.studentId ?? (raw.student && raw.student.id),
        studentNumber: studentNumber,
        classId: raw.class_id ?? raw.classId ?? raw.classId,
        className,
        classGrade,
        paymentId: raw.payment_id ?? raw.paymentId ?? (raw.payment && raw.payment.id),
        status: status,
        enrolledAt: raw.enrolled_at ?? raw.enrolledAt ?? raw.enrolledDate ?? undefined,
        expiresAt: raw.expires_at ?? raw.expiresAt ?? undefined,
        raw,
      } as ServiceEnrollment;
    } catch (e) {
      console.error("[ENROLLMENT MANAGER] localNormalize error", e, raw);
      return raw as ServiceEnrollment;
    }
  }

  const fetchMyEnrollments = async () => {
    log("fetchMy() - starting");
    try {
      const raw = await getMyEnrollments();
      log("fetchMy() - raw:", raw);

      const normalized: Enrollment[] = (Array.isArray(raw) ? raw : [raw])
        .map((r) => {
          const n = (typeof normalizeEnrollment === "function" ? normalizeEnrollment(r) : localNormalize(r)) as Enrollment;
          n.displayStatus =
            typeof n.status === "boolean" ? (n.status ? "active" : "inactive") : (n.status ?? "-");
          return n;
        });

      normalized.forEach((n, i) => log(`item[${i}] normalized:`, n));
      setEnrollments(normalized);
    } catch (err: any) {
      console.error("fetchMy() failed:", err);
      alert(`Failed to load enrollments: ${err?.message ?? err}`);
    }
  };

  useEffect(() => {
    fetchMyEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    // IMPORTANT: we intentionally DO NOT send userId or status from the frontend.
    // The backend will resolve student/class/payment as needed.
    const dto: { studentId?: number; classId: number; paymentId?: number } = {
      classId: 1,
    };

    // If you have a student id in the authenticated user context, you may include that instead of userId:
    // const studentIdFromUser = (user && (user.studentId || user.student_id)) ? user.studentId || user.student_id : undefined;
    // if (studentIdFromUser) dto.studentId = studentIdFromUser;

    log("handleCreate() - createEnrollment payload (no userId, no status):", dto);
    try {
      const created = await createEnrollment(dto);
      log("handleCreate() - created:", created);
      // refresh list after create
      fetchMyEnrollments();
    } catch (err: any) {
      console.error("handleCreate() failed:", err);
      alert(`Failed to create enrollment: ${err?.message ?? err}`);
    }
  };

  const handleCreateWithPayment = async () => {
    if (!paymentIdInput) {
      alert("Enter a payment ID to create an enrollment from.");
      return;
    }
    const dto = {
      classId: 1,
      paymentId: Number(paymentIdInput),
    };

    log("handleCreateWithPayment() - payload (no userId, no status):", dto);
    try {
      const created = await createEnrollment(dto);
      log("handleCreateWithPayment() - created:", created);
      setPaymentIdInput("");
      fetchMyEnrollments();
    } catch (err: any) {
      console.error("handleCreateWithPayment() failed:", err);
      alert(`Failed to create enrollment: ${err?.message ?? err}`);
    }
  };

  const handleFilterByClass = async () => {
    if (!classIdFilter) {
      fetchMyEnrollments();
      return;
    }
    log("handleFilterByClass() - classId:", classIdFilter);
    try {
      const data = await getByClassId(Number(classIdFilter));
      log("handleFilterByClass() - raw:", data);
      const normalized = (Array.isArray(data) ? data : [data]).map((r) =>
        (typeof normalizeEnrollment === "function" ? normalizeEnrollment(r) : localNormalize(r)) as Enrollment
      );
      setEnrollments(normalized);
    } catch (err: any) {
      console.error("handleFilterByClass() failed:", err);
      alert(`Failed to load enrollments for class ${classIdFilter}: ${err?.message ?? err}`);
    }
  };

  const handleFetchByPayment = async (paymentId: number | string) => {
    log("handleFetchByPayment() - paymentId:", paymentId);
    try {
      const data = await getByPaymentId(paymentId);
      log("handleFetchByPayment() - raw:", data);
      const normalized = (Array.isArray(data) ? data : [data]).map((r) =>
        (typeof normalizeEnrollment === "function" ? normalizeEnrollment(r) : localNormalize(r)) as Enrollment
      );
      setEnrollments(normalized);
      console.log("handleFetchByPayment() - normalized:", normalized);
    } catch (err: any) {
      console.error("handleFetchByPayment() failed:", err);
      alert(`Failed to load enrollments for payment ${paymentId}: ${err?.message ?? err}`);
    }
  };

  // New helper: prefer subject name(s) from classEntity, then className, then grade, then id
  const getClassDisplay = (e: any): string => {
    // subjects first
    const classEntity = e.classEntity ?? e.raw?.classEntity ?? e.raw?.class_entity ?? e.class;
    const subjects: any[] | undefined =
      classEntity?.subjects ?? classEntity?.subjects_list ?? classEntity?.subject ?? undefined;

    if (Array.isArray(subjects) && subjects.length > 0) {
      const names = subjects
        .map((s) => s?.name ?? s?.subject_name ?? s?.title)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }

    // explicit class name next
    const explicit = e.className ?? e.name;
    if (explicit) return explicit;

    // class grade fallback
    if (e.classGrade ?? e.grade) return String(e.classGrade ?? e.grade);

    // final fallback id or dash
    return String(e.classId ?? e.class_id ?? "-");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Enrollments</h2>

      <div className="flex gap-2 items-center mb-4">
        <button onClick={handleCreate} className="px-4 py-2 bg-green-500 text-white rounded">
          Create Sample Enrollment
        </button>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Payment ID"
            value={paymentIdInput}
            onChange={(e) => setPaymentIdInput(e.target.value === "" ? "" : Number(e.target.value))}
            className="px-2 py-1 border rounded"
          />
          <button onClick={handleCreateWithPayment} className="px-3 py-1 bg-blue-600 text-white rounded">
            Create from Payment
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="text"
            placeholder="Filter classId"
            value={classIdFilter}
            onChange={(e) => setClassIdFilter(e.target.value === "" ? "" : Number(e.target.value))}
            className="px-2 py-1 border rounded"
          />
          <button onClick={handleFilterByClass} className="px-3 py-1 bg-gray-700 text-white rounded">
            Filter
          </button>
          <button onClick={fetchMyEnrollments} className="px-3 py-1 bg-gray-500 text-white rounded">
            Refresh
          </button>
        </div>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Class</th>
            <th>Student #</th>
            <th>Grade</th>
            <th>Enrolled At</th>
            <th>Actions</th>
            <th>Raw (debug)</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center">
                No enrollments found.
              </td>
            </tr>
          ) : (
            enrollments.map((e) => (
              <tr key={String(e.id)} className="border-t">
                <td>{e.id}</td>
                <td>{getClassDisplay(e)}</td>
                <td>{e.studentNumber ?? "-"}</td>
                <td>{e.classGrade ?? "-"}</td>
                <td>{e.enrolledAt ?? "-"}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => handleFetchByPayment(e.paymentId ?? "")}
                    className="px-2 py-1 bg-blue-500 text-white rounded"
                    disabled={!e.paymentId}
                  >
                    By Payment
                  </button>
                </td>
                <td style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(e.raw ?? e, null, 2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentManager;