import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateEnrollment as updateEnrollmentService } from "../../services/enrollmentService";

export type Enrollment = {
  id?: number;
  studentId?: number;
  studentNumber?: string;
  classId?: number;
  className?: string;
  classGrade?: string;
  paymentId?: number;
  status?: boolean | string;
  enrolledAt?: string;
  userId?: number;
  raw?: any;
};

type ClassOption = { id: number; name?: string; grade?: string };
type StudentOption = { id: number; studentNumber?: string; firstName?: string; lastName?: string };
type PaymentOption = { id: number; amount?: number; currency?: string; description?: string };

interface Props {
  enrollment: Enrollment | null;
  classes?: ClassOption[];
  students?: StudentOption[];
  payments?: PaymentOption[];
  onSaved?: (updated: any) => void;
  onCancel?: () => void;
}

/**
 * Full-width visible Edit form for an enrollment.
 * Prefills values from `enrollment`. Uses selects for class/student/payment if lists are provided.
 */
const EditEnrollmentForm: React.FC<Props> = ({ enrollment, classes = [], students = [], payments = [], onSaved, onCancel }) => {
  const [studentId, setStudentId] = useState<number | "">("");
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [classId, setClassId] = useState<number | "">("");
  const [paymentId, setPaymentId] = useState<number | "">("");
  const [userId, setUserId] = useState<number | "">("");
  const [status, setStatus] = useState<boolean>(true);
  const [enrolledAt, setEnrolledAt] = useState<string>(""); // datetime-local value (yyyy-MM-ddTHH:mm)
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!enrollment) {
      setStudentId("");
      setStudentNumber("");
      setClassId("");
      setPaymentId("");
      setUserId("");
      setStatus(true);
      setEnrolledAt("");
      return;
    }

    setStudentId(enrollment.studentId ?? "");
    setStudentNumber(enrollment.studentNumber ?? (enrollment.raw?.student_number ?? ""));
    setClassId(enrollment.classId ?? "");
    setPaymentId(enrollment.paymentId ?? "");
    setUserId(enrollment.userId ?? "");
    setStatus(
      typeof enrollment.status === "boolean"
        ? enrollment.status
        : String(enrollment.status ?? "true").toLowerCase() === "true"
    );

    const rawEnrolled = enrollment.enrolledAt ?? enrollment.raw?.enrolled_at ?? enrollment.raw?.enrolledAt ?? "";
    if (rawEnrolled) {
      const d = new Date(rawEnrolled);
      if (!isNaN(d.getTime())) {
        // convert to local datetime-local format
        const tzOffset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - tzOffset * 60000).toISOString().slice(0, 16);
        setEnrolledAt(local);
      } else {
        setEnrolledAt(String(rawEnrolled).slice(0, 16));
      }
    } else {
      setEnrolledAt("");
    }
  }, [enrollment]);

  if (!enrollment) return null;

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const dto: any = {};

      if (studentId !== "" && studentId !== null) dto.studentId = Number(studentId);
      if (studentNumber && studentNumber.trim() !== "") dto.studentNumber = studentNumber.trim();
      if (classId !== "" && classId !== null) dto.classId = Number(classId);
      if (paymentId !== "" && paymentId !== null) dto.paymentId = Number(paymentId);
      if (userId !== "" && userId !== null) dto.userId = Number(userId);

      dto.status = status ? "true" : "false";

      if (enrolledAt && enrolledAt !== "") {
        dto.enrolledAt = enrolledAt.length === 16 ? `${enrolledAt}:00` : enrolledAt;
      }

      if (Object.keys(dto).length === 0) {
        toast.info("No changes to save.");
        setSaving(false);
        return;
      }

      const updated = await updateEnrollmentService(enrollment.id as number, dto);
      console.log("EditEnrollmentForm.update successful", updated);
      toast.success("Enrollment updated");
      onSaved && onSaved(updated);
    } catch (err: any) {
      console.error("EditEnrollmentForm.update failed", err);
      toast.error(`Failed to update enrollment: ${err?.message ?? err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 bg-white border rounded shadow mb-6">
      <h3 className="text-xl font-semibold mb-4">Edit Enrollment #{enrollment.id}</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Student select / id */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Student</span>
          {students.length > 0 ? (
            <select
              value={studentId ?? ""}
              onChange={(e) => setStudentId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
            >
              <option value="">-- keep current / none --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.studentNumber ? `${s.studentNumber} — ${s.firstName ?? ""} ${s.lastName ?? ""}` : s.id}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={studentId ?? ""}
              onChange={(e) => setStudentId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
              placeholder="student id"
            />
          )}
        </label>

        {/* Student number as text */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Student Number</span>
          <input
            type="text"
            value={studentNumber ?? ""}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="mt-1 p-2 border rounded"
            placeholder="student number (optional)"
          />
        </label>

        {/* Class select */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Class</span>
          {classes.length > 0 ? (
            <select
              value={classId ?? ""}
              onChange={(e) => setClassId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
            >
              <option value="">-- keep current / none --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? `Class ${c.id}`} {c.grade ? `· Grade ${c.grade}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={classId ?? ""}
              onChange={(e) => setClassId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
            />
          )}
        </label>

        {/* Payment select */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Payment</span>
          {payments.length > 0 ? (
            <select
              value={paymentId ?? ""}
              onChange={(e) => setPaymentId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
            >
              <option value="">-- none / keep --</option>
              {payments.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.description ?? `${p.currency ?? ""} ${p.amount ?? ""}`} (#{p.id})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={paymentId ?? ""}
              onChange={(e) => setPaymentId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
            />
          )}
        </label>

        {/* User ID */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">User ID</span>
          <input
            type="number"
            value={userId ?? ""}
            onChange={(e) => setUserId(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-1 p-2 border rounded"
            placeholder="user id (optional)"
          />
        </label>

        {/* Enrolled At */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Enrolled At</span>
          <input
            type="datetime-local"
            value={enrolledAt ?? ""}
            onChange={(e) => setEnrolledAt(e.target.value)}
            className="mt-1 p-2 border rounded"
          />
        </label>

        <label className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            checked={!!status}
            onChange={(e) => setStatus(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded">
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => onCancel && onCancel()} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditEnrollmentForm;