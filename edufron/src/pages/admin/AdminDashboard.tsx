import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  UserCheck,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";


// Mock data for dashboard
const statsData = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12%",
    changeType: "increase" as const,
    icon: Users,
    color: "primary",
  },
  {
    title: "Active Teachers",
    value: "56",
    change: "+3%",
    changeType: "increase" as const,
    icon: GraduationCap,
    color: "secondary",
  },
  {
    title: "Total Classes",
    value: "89",
    change: "+8%",
    changeType: "increase" as const,
    icon: BookOpen,
    color: "accent",
  },
  {
    title: "Enrollments",
    value: "2,567",
    change: "-2%",
    changeType: "decrease" as const,
    icon: UserCheck,
    color: "muted",
  },
];

const enrollmentData = [
  { month: "Jan", students: 400 },
  { month: "Feb", students: 300 },
  { month: "Mar", students: 500 },
  { month: "Apr", students: 280 },
  { month: "May", students: 590 },
  { month: "Jun", students: 320 },
];

const subjectDistribution = [
  { name: "Mathematics", value: 400, color: "hsl(var(--primary))" },
  { name: "Physics", value: 300, color: "hsl(var(--secondary))" },
  { name: "Chemistry", value: 300, color: "hsl(var(--accent))" },
  { name: "Biology", value: 200, color: "hsl(var(--muted-foreground))" },
];

const recentEnrollments = [
  {
    id: "1",
    student: "John Doe",
    class: "Advanced Mathematics",
    teacher: "Dr. Smith",
    status: "approved",
    date: "2024-01-15",
  },
  {
    id: "2",
    student: "Jane Wilson",
    class: "Physics Lab",
    teacher: "Prof. Johnson",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "3",
    student: "Mike Brown",
    class: "Chemistry Basics",
    teacher: "Dr. Davis",
    status: "approved",
    date: "2024-01-13",
  },
  {
    id: "4",
    student: "Sarah Johnson",
    class: "Biology Advanced",
    teacher: "Prof. Wilson",
    status: "rejected",
    date: "2024-01-12",
  },
];

const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(var(--primary))",
  },
};

export default function AdminDashboard() {
  return (
  <div className="admin">
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-white/90">
              Here's what's happening with your tuition platform today.
            </p>
          </div>
          <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`
                p-2 rounded-lg
                ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : ''}
                ${stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' : ''}
                ${stat.color === 'accent' ? 'bg-accent/10 text-accent-foreground' : ''}
                ${stat.color === 'muted' ? 'bg-muted text-muted-foreground' : ''}
              `}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 text-primary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={stat.changeType === 'increase' ? 'text-primary' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

   

    </div></div>
  );
}