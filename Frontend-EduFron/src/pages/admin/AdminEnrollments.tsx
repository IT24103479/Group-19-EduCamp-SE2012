import React, { useEffect, useState } from "react";
import {
  getMyEnrollments,
  getByClassId,
  getByPaymentId,
  deleteEnrollment,
} from "../../services/enrollmentService";
import { useToast } from "../../hooks/use-toast";
import type { Enrollment as ServiceEnrollment } from "../../types/enrollment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Search, Edit, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import EditEnrollmentForm, { Enrollment } from "../../components/admin/EditEnrollmentForm";

type ClassOption = { id: number; name?: string; grade?: string; label?: string };
type StudentOption = { id: number; studentNumber?: string; firstName?: string; lastName?: string };
type PaymentOption = { id: number; amount?: number; currency?: string; description?: string };

export default function EnrollmentManager(): JSX.Element {
  const [enrollments, setEnrollments] = useState<ServiceEnrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [payments, setPayments] = useState<PaymentOption[]>([]);

  const [editing, setEditing] = useState<Enrollment | null>(null);

  // fetch enrollments
  const fetchMy = async () => {
    try {
      const data = await getMyEnrollments();
      setEnrollments(data ?? []);
    } catch (err: any) {
      console.error("[ENROLLMENT MANAGER] fetchMy() failed:", err);
      toast({ title: "Error", description: `Failed to fetch enrollments: ${err?.message ?? err}` });
    }
  };
  console.log("Enrollments:", enrollments);

  // fetch selector options for selects
  const fetchOptions = async () => {
    try {
      const [classesRes, studentsRes, paymentsRes] = await Promise.all([
        fetch("/classes").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/students").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/payments").then((r) => (r.ok ? r.json() : [])),
      ]);
      console.log("Fetched options:", { classesRes, studentsRes, paymentsRes });
      // Normalize minimal shapes (defensive)
      setClasses(
        Array.isArray(classesRes)
          ? classesRes.map((c: any) => {
              const grade = c.grade ?? c.classGrade ?? c.class_grade;
              const name = c.name ?? c.className ?? c.class_name;
              const label = `${grade ? grade + " — " : ""}${name ?? `Class ${c.id ?? c.class_id}`}`;
              return { id: c.id ?? c.class_id ?? c.classId, name, grade, label };
            })
          : []
      );
      setStudents(
        Array.isArray(studentsRes)
          ? studentsRes.map((s: any) => ({
              id: s.id,
              studentNumber: s.studentNumber ?? s.student_number,
              firstName: s.firstName ?? s.first_name,
              lastName: s.lastName ?? s.last_name,
            }))
          : []
      );
      setPayments(
        Array.isArray(paymentsRes)
          ? paymentsRes.map((p: any) => ({ id: p.id, amount: p.amount, currency: p.currency, description: p.description }))
          : []
      );
    } catch (err) {
      console.error("Failed to load selector options", err);
    }
  };

  useEffect(() => {
    fetchMy();
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // delete handler (confirms, calls service, refreshes list and shows toasts)
  const handleDelete = async (id?: string | number) => {
    if (!id) return;
    const ok = window.confirm("Delete this enrollment? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteEnrollment(id);
      toast({ title: "Enrollment Deleted", description: `Enrollment ${id} deleted.` });
      // refresh the list so UI reflects deletion
      await fetchMy();
    } catch (err: any) {
      console.error("[ENROLLMENT MANAGER] delete failed:", err);
      toast({ title: "Error", description: `Failed to delete enrollment: ${err?.message ?? err}` });
    }
  };

  const handleFilterByClass = async (classId: string | number | "") => {
    if (classId === "" || classId === null) {
      fetchMy();
      return;
    }
    try {
      const data = await getByClassId(Number(classId));
      setEnrollments(data ?? []);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: `Failed to fetch enrollments for class ${classId}` });
    }
  };

  const handleFetchByPayment = async (paymentId: string | number) => {
    if (!paymentId) return;
    try {
      const data = await getByPaymentId(paymentId);
      setEnrollments(data ?? []);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: `Failed to fetch enrollments for payment ${paymentId}` });
    }
  };

  // Helper to display subject name(s) first, then className, then grade, then id
  const getClassDisplay = (e: any): string => {
    // prefer normalized subjectDisplay or subjectNames from service normalization
    const subjectDisplay = e.subjectDisplay ?? (Array.isArray(e.subjectNames) ? e.subjectNames.join(", ") : undefined);
    if (subjectDisplay) return subjectDisplay;

    // Try subject names inside classEntity (or raw.classEntity)
    const classEntity = e.classEntity ?? e.raw?.classEntity ?? e.raw?.class_entity ?? e.class;
    const subjects: any[] | undefined =
      classEntity?.subjects ?? classEntity?.subjects_list ?? classEntity?.subject ?? undefined;

    if (Array.isArray(subjects) && subjects.length > 0) {
      const names = subjects
        .map((s) => s?.name ?? s?.subject_name ?? s?.title)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }

    // fallback to explicit className property
    const explicit = e.className ?? e.name;
    if (explicit) return explicit;

    // fallback to grade
    if (e.classGrade ?? e.grade) return String(e.classGrade ?? e.grade);

    // final fallback: id or dash
    return String(e.classId ?? e.class_id ?? "-");
  };

  const filtered = enrollments.filter((e: any) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(e.id ?? "").toLowerCase().includes(term) ||
      String(getClassDisplay(e)).toLowerCase().includes(term) ||
      String(e.studentId ?? "").toLowerCase().includes(term) ||
      String(e.studentNumber ?? "").toLowerCase().includes(term) ||
      String(e.userId ?? "").toLowerCase().includes(term) ||
      String(e.classGrade ?? e.grade ?? "").toLowerCase().includes(term) ||
      String(e.status ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 min-h-screen">
      {/* Inline full-width edit form */}
      {editing && (
        <div className="mb-6">
          <EditEnrollmentForm
            enrollment={editing}
            classes={classes}
            students={students}
            payments={payments}
            onSaved={() => {
              setEditing(null);
              fetchMy();
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Enrollments Management
          </h1>
          <p className="text-gray-500">
            View, edit, and manage student enrollments
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mt-3 sm:mt-0 w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full border border-gray-300 border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300 text-left">ID</th>
              <th className="p-3 border border-gray-300 text-left">Class / Subject</th>
              <th className="p-3 border border-gray-300 text-left">
                Student ID
              </th>
              <th className="p-3 border border-gray-300 text-left">
                Student Number
              </th>
              <th className="p-3 border border-gray-300 text-left">Grade</th>
              <th className="p-3 border border-gray-300 text-left">
                Enrolled At
              </th>
              <th className="p-3 border border-gray-300 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-gray-500 border border-gray-300"
                >
                  No enrollments found
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const rowId = e.id ?? e.ID;
                const classDisplay = getClassDisplay(e);
                return (
                  <tr key={String(rowId ?? Math.random())} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-300">{rowId}</td>
                    <td className="p-2 border border-gray-300">
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm border border-sky-200">
                        {classDisplay}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-300">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm border border-gray-200">
                        {e.studentId ?? "-"}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-300">
                      {e.studentNumber ?? "-"}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {e.classGrade ?? e.grade ?? "-"}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {e.enrolledAt ?? e.enrolled_at ?? "-"}
                    </td>
                    <td className="p-2 border border-gray-300 flex gap-2">
                      <button
                        onClick={() => {
                          // include subject fields and classGrade so the edit form can edit them
                          const subjectNames =
                            e.subjectNames ??
                            (e.subjectDisplay ? String(e.subjectDisplay).split(",").map((s: string) => s.trim()) : undefined) ??
                            (e.raw?.classEntity?.subjects ? e.raw.classEntity.subjects.map((s: any) => s.name) : undefined);

                          const normalized: Enrollment = {
                            id: rowId,
                            studentId: e.studentId ?? e.student_id,
                            studentNumber:
                              e.studentNumber ?? e.student_number,
                            classId: e.classId ?? e.class_id,
                            className: e.className ?? e.name ?? undefined,
                            classGrade: e.classGrade ?? e.grade ?? (e.raw?.classEntity?.grade ?? undefined),
                            paymentId: e.paymentId ?? e.payment_id,
                            status: e.status,
                            enrolledAt: e.enrolledAt ?? e.enrolled_at,
                            userId: e.userId ?? e.user_id,
                            // subject helpers provided by the service normalizeEnrollment; include defensively
                            subjectNames: subjectNames,
                            subjectDisplay: Array.isArray(subjectNames) ? subjectNames.join(", ") : (e.subjectDisplay ?? undefined),
                            subjects: e.subjects ?? e.raw?.classEntity?.subjects ?? undefined,
                            primarySubject: Array.isArray(subjectNames) && subjectNames.length > 0 ? subjectNames[0] : undefined,
                            raw: e,
                          };
                          setEditing(normalized);
                        }}
                        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(rowId)}
                        disabled={!rowId}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};