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

type ClassOption = { id: number; name?: string; grade?: string };
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
          ? classesRes.map((c: any) => ({ id: c.id ?? c.class_id ?? c.classId, name: c.name ?? c.className, grade: c.grade }))
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

  const filtered = enrollments.filter((e: any) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(e.id ?? "").toLowerCase().includes(term) ||
      String(e.className ?? e.name ?? e.classId ?? "").toLowerCase().includes(term) ||
      String(e.studentId ?? "").toLowerCase().includes(term) ||
      String(e.studentNumber ?? "").toLowerCase().includes(term) ||
      String(e.userId ?? "").toLowerCase().includes(term) ||
      String(e.classGrade ?? e.grade ?? "").toLowerCase().includes(term) ||
      String(e.status ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Inline full-width edit form */}
      {editing ? (
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
      ) : null}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-700">Enrollments Management</h1>
          <p className="text-slate-500">View and edit class enrollments</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Create & Refresh removed as requested */}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search enrollments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Enrollments Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sky-700">All Enrollments</CardTitle>
          <CardDescription className="text-slate-500">Manage student enrollments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">ID</TableHead>
                <TableHead className="text-slate-600">Class</TableHead>
                <TableHead className="text-slate-600">Student ID</TableHead>
                <TableHead className="text-slate-600">Student Number</TableHead>
                <TableHead className="text-slate-600">Grade</TableHead>
                <TableHead className="text-slate-600">Enrolled At</TableHead>
                <TableHead className="text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-4 text-center">
                    No enrollments found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => {
                  const rowId = (e as any).id ?? (e as any).ID;
                  return (
                    <TableRow key={String(rowId ?? Math.random())}>
                      <TableCell>{rowId}</TableCell>
                      <TableCell>
                        <Badge className="bg-sky-100 text-sky-700 border-sky-200">
                          {(e as any).className ?? (e as any).name ?? (e as any).classId ?? "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">{(e as any).studentId ?? "-"}</Badge>
                      </TableCell>
                      <TableCell>{(e as any).studentNumber ?? "-"}</TableCell>
                      <TableCell>{(e as any).classGrade ?? (e as any).grade ?? "-"}</TableCell>
                      <TableCell>{(e as any).enrolledAt ?? (e as any).enrolled_at ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-red-700 hover:bg-red-100"
                            onClick={() => handleDelete(rowId)}
                            disabled={!rowId}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              // when Edit is clicked, pass a normalized object to the edit form
                              const normalized: Enrollment = {
                                id: rowId,
                                studentId: (e as any).studentId ?? (e as any).student_id,
                                studentNumber: (e as any).studentNumber ?? (e as any).student_number,
                                classId: (e as any).classId ?? (e as any).class_id,
                                className: (e as any).className ?? (e as any).name,
                                classGrade: (e as any).classGrade ?? (e as any).grade,
                                paymentId: (e as any).paymentId ?? (e as any).payment_id,
                                status: (e as any).status,
                                enrolledAt: (e as any).enrolledAt ?? (e as any).enrolled_at,
                                userId: (e as any).userId ?? (e as any).user_id,
                                raw: e,
                              };
                              setEditing(normalized);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}