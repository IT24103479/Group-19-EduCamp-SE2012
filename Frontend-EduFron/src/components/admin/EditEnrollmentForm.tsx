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
  subjectNames?: string[];
  subjectDisplay?: string;
  subjects?: Array<{ id?: number | string; name?: string }>;
};

type ClassOption = { id: number; name?: string; grade?: string; label?: string };
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
 * EditEnrollmentForm - full width edit form
 * Supports editing:
 *  - class selection (by classId)
 *  - classGrade (editable text)
 *  - className / subject display (editable text)
 *  - subject names (comma-separated)
 *  - student/studentNumber/payment/user/status/enrolledAt
 *
 * When saving, subjectText -> subjectNames is sent; the service maps subjectNames -> subjects objects.
 */
const EditEnrollmentForm: React.FC<Props> = ({ enrollment, classes = [], students = [], payments = [], onSaved, onCancel }) => {
  const [studentId, setStudentId] = useState<number | "">("");
  const [studentNumber, setStudentNumber] = useState<string>("");
  const [classId, setClassId] = useState<number | "">("");
  const [className, setClassName] = useState<string>(""); // free-text class/subject display (helps when className missing)
  const [classGrade, setClassGrade] = useState<string>("");
  const [paymentId, setPaymentId] = useState<number | "">("");
  const [userId, setUserId] = useState<number | "">("");
  const [status, setStatus] = useState<boolean>(true);
  const [enrolledAt, setEnrolledAt] = useState<string>(""); // datetime-local value (yyyy-MM-ddTHH:mm)
  const [saving, setSaving] = useState<boolean>(false);

  // subjects editing: keep a text field for comma-separated subject names
  const [subjectText, setSubjectText] = useState<string>("");

  useEffect(() => {
    if (!enrollment) {
      setStudentId("");
      setStudentNumber("");
      setClassId("");
      setClassName("");
      setClassGrade("");
      setPaymentId("");
      setUserId("");
      setStatus(true);
      setEnrolledAt("");
      setSubjectText("");
      return;
    }

    setStudentId(enrollment.studentId ?? "");
    setStudentNumber(enrollment.studentNumber ?? (enrollment.raw?.student_number ?? ""));
    setClassId(enrollment.classId ?? "");
    // className: prefer explicit className; otherwise use subjectDisplay so user sees subject(s)
    setClassName(enrollment.className ?? enrollment.subjectDisplay ?? (enrollment.raw?.classEntity?.name ?? ""));
    setClassGrade(enrollment.classGrade ?? (enrollment.raw?.classEntity?.grade ?? ""));

    setPaymentId(enrollment.paymentId ?? "");
    setUserId(enrollment.userId ?? "");
    setStatus(
      typeof enrollment.status === "boolean"
        ? enrollment.status
        : String(enrollment.status ?? "true").toLowerCase() === "true"
    );

    // initialize subjects text from subjectNames or subjectDisplay or raw
    const subjectNames =
      enrollment.subjectNames ??
      (enrollment.subjectDisplay ? String(enrollment.subjectDisplay).split(",").map((s) => s.trim()) : undefined) ??
      (Array.isArray(enrollment.subjects) ? enrollment.subjects.map((s) => s.name).filter(Boolean) : undefined);

    setSubjectText(Array.isArray(subjectNames) ? subjectNames.join(", ") : "");

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

      // include className if provided (helps when enrollment has no classId and user edited the subject/class text)
      if (className && className.trim() !== "") dto.className = className.trim();
      if (classGrade && classGrade.trim() !== "") dto.classGrade = classGrade.trim();
      if (paymentId !== "" && paymentId !== null) dto.paymentId = Number(paymentId);
      if (userId !== "" && userId !== null) dto.userId = Number(userId);

      // parse subjectText into array of names and send subjectNames (service maps to subjects)
      const subjectNames = subjectText ? subjectText.split(",").map((s) => s.trim()).filter(Boolean) : [];
      if (subjectNames.length > 0) dto.subjectNames = subjectNames;

      dto.status = status ? "true" : "false";

      if (enrolledAt && enrolledAt !== "") {
        dto.enrolledAt = enrolledAt.length === 16 ? `${enrolledAt}:00` : enrolledAt;
      }
      // If nothing changed, inform user
      if (Object.keys(dto).length === 0) {
        toast.info("No changes to save.");
        setSaving(false);
        return;
      }

      const updated = await updateEnrollmentService(enrollment.id as number, dto);
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
          <span className="text-sm text-gray-600">Class (choose existing)</span>
          {classes.length > 0 ? (
            <select
              value={classId ?? ""}
              onChange={(e) => setClassId(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1 p-2 border rounded"
            >
              <option value="">-- keep current / none --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label ?? `${c.grade ?? ""}${c.grade && c.name ? " — " : ""}${c.name ?? `Class ${c.id}`}`}
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
          <small className="text-xs text-gray-500 mt-1">Selecting a class (classId) is preferred. Use the Class Name field below to edit subject display/text directly.</small>
        </label>

        {/* Class Name / Subject display (editable) */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Class Name / Subject (editable)</span>
          <input
            type="text"
            value={className ?? ""}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 p-2 border rounded"
            placeholder="Subject name or class name (e.g. Dancing)"
          />
          <small className="text-xs text-gray-500 mt-1">This field is prefilled from the enrollment's subject(s) when a class name isn't available.</small>
        </label>

        {/* Class Grade (editable) */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Grade</span>
          <input
            type="text"
            value={classGrade ?? ""}
            onChange={(e) => setClassGrade(e.target.value)}
            className="mt-1 p-2 border rounded"
            placeholder="e.g. Grade 9"
          />
        </label>

        {/* Subjects (comma separated) */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Subjects (comma separated)</span>
          <input
            type="text"
            value={subjectText ?? ""}
            onChange={(e) => setSubjectText(e.target.value)}
            className="mt-1 p-2 border rounded"
            placeholder="Science, Math, English"
          />
          <small className="text-xs text-gray-500 mt-1">Enter subject names. They will be sent as subjectNames to the backend.</small>
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