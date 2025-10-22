import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
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
} from "../components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

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
    <div className="admin p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-md text-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-gray-600">
              Here's what's happening with your tuition platform today.
            </p>
          </div>
          <Button variant="secondary" className="bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300">
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-lg transition-shadow duration-300 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg
                ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : ''}
                ${stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' : ''}
                ${stat.color === 'accent' ? 'bg-accent/10 text-accent-foreground' : ''}
                ${stat.color === 'muted' ? 'bg-gray-200 text-gray-800' : ''}
              `}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                <span className="text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <Card className="shadow-card bg-white">
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Monthly student enrollment over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card className="shadow-card bg-white">
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Student enrollment by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="shadow-card bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Enrollments</CardTitle>
              <CardDescription>Latest student enrollment requests</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.student}</TableCell>
                    <TableCell>{enrollment.class}</TableCell>
                    <TableCell>{enrollment.teacher}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          enrollment.status === 'approved' ? 'default' :
                          enrollment.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">{enrollment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
