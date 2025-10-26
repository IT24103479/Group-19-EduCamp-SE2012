import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Users, GraduationCap, BookOpen, UserCheck, TrendingUp, TrendingDown, Plus, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useToast } from "../../hooks/use-toast";
import { process } from  "../../types/process";
import { API_BASE } from "../../lib/api";
type StatItem = {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: any;
  color?: "primary" | "secondary" | "accent" | "muted";
};

type TeacherRow = {
  id: number | string;
  name: string;
  email?: string;
  subject?: string;
  qualification?: string;
  joined?: string;
};



export default function AdminDashboard(): JSX.Element {
  const { toast } = useToast();

  const [stats, setStats] = useState<StatItem[]>([
   // { title: "Total Students", value: "—", icon: Users, color: "primary" },
    { title: "Active Teachers", value: "12", icon: GraduationCap, color: "secondary" },
    { title: "Total Classes", value: "7", icon: BookOpen, color: "accent" },
   // { title: "Payments", value: "—", icon: UserCheck, color: "muted" },
  ]);

  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const [classesRes, teachersRes, paymentsRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE}/classes`),
        fetch(`${API_BASE}/api/teachers`),
        fetch(`${API_BASE}/api/payments`),
        fetch(`${API_BASE}/api/students`),
      ]);

      const classesData = classesRes.ok ? await classesRes.json() : [];
      const teachersData = teachersRes.ok ? await teachersRes.json() : [];
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
      const studentsData = studentsRes.ok ? await studentsRes.json() : [];

      const classesCount = Array.isArray(classesData) ? classesData.length : 0;
      const teachersCount = Array.isArray(teachersData) ? teachersData.length : 0;
      const paymentsCount = Array.isArray(paymentsData) ? paymentsData.length : 0;
      const studentsCount = Array.isArray(studentsData) ? studentsData.length : 0;

      const paymentsTotal = Array.isArray(paymentsData)
        ? paymentsData.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
        : 0;

      setStats([
        {
          title: "Total Students",
          value: String(studentsCount),
          icon: Users,
          color: "primary",
        },
        {
          title: "Active Teachers",
          value: String(teachersCount),
          icon: GraduationCap,
          color: "secondary",
        },
        {
          title: "Total Classes",
          value: String(classesCount),
          icon: BookOpen,
          color: "accent",
        },
        {
          title: "Payments (count)",
          value: `${paymentsCount} • ${paymentsTotal ? `${paymentsTotal}` : "0"}`,
          icon: UserCheck,
          color: "muted",
        },
      ]);
    } catch (err: any) {
      console.error("[AdminDashboard] fetchStats error:", err);
      toast({ title: "Error", description: `Failed to load stats: ${err?.message ?? err}` });
    } finally {
      setLoadingStats(false);
    }
  }

  // Fetch the teachers endpoint and normalize rows
  async function fetchTeachers() {
    setLoadingTeachers(true);
    try {
      const res = await fetch(`${API_BASE}/api/teachers`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      const rows: TeacherRow[] = Array.isArray(data)
        ? data.map((t: any) => ({
            id: t.id ?? t.ID ?? `${Math.random().toString(36).slice(2)}`,
            name: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || t.name || "Unknown",
            email: t.email ?? "-",
            subject: t.subject ?? t.subjectCode ?? "-",
            qualification: t.qualification ?? "-",
            joined: t.j_date ?? t.createdAt ?? t.created_at ?? undefined,
          }))
        : [];

      setTeachers(rows);
    } catch (err: any) {
      console.error("[AdminDashboard] fetchTeachers error:", err);
      toast({ title: "Error", description: `Failed to load teachers: ${err?.message ?? err}` });
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }

  return (
    <div className="admin">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-hero rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-white/90">Here's what's happening with your tuition platform today.</p>
            </div>
            <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Plus className="w-4 h-4 mr-2" />
              Quick Actions
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div
                  className={`
                    p-2 rounded-lg
                    ${stat.color === "primary" ? "bg-primary/10 text-primary" : ""}
                    ${stat.color === "secondary" ? "bg-secondary/10 text-secondary" : ""}
                    ${stat.color === "accent" ? "bg-accent/10 text-accent-foreground" : ""}
                    ${stat.color === "muted" ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{loadingStats ? "…" : stat.value}</div>
                {stat.change ? (
                  <div className="flex items-center space-x-1 text-xs">
                    {stat.changeType === "increase" ? (
                      <TrendingUp className="h-3 w-3 text-primary" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={stat.changeType === "increase" ? "text-primary" : "text-destructive"}>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">from last month</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teachers Table */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Teachers</CardTitle>
                <CardDescription>List of teachers (from /teachers)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchTeachers()}>
                <Eye className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTeachers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center">Loading…</TableCell>
                    </TableRow>
                  ) : teachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="p-4 text-center">No teachers found.</TableCell>
                    </TableRow>
                  ) : (
                    teachers.map((t) => (
                      <TableRow key={String(t.id)}>
                        <TableCell className="font-medium">{t.id}</TableCell>
                        <TableCell>{t.name}</TableCell>
                        <TableCell>{t.email ?? "-"}</TableCell>
                        <TableCell>{t.subject ?? "-"}</TableCell>
                        <TableCell>{t.qualification ?? "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{t.joined ?? "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}