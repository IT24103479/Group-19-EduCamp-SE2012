import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, GraduationCap, BookOpen, UserCheck } from "lucide-react";
import { Button } from "../components/ui/button";

const statsData = [
  {
    title: "Total Students",
    value: "1,234",
    icon: Users,
    color: "primary",
  },
  {
    title: "Active Teachers",
    value: "56",
    icon: GraduationCap,
    color: "secondary",
  },
  {
    title: "Total Classes",
    value: "89",
    icon: BookOpen,
    color: "accent",
  },
  {
    title: "Enrollments",
    value: "2,567",
    icon: UserCheck,
    color: "muted",
  },
];

export default function AdminDashboard() {
  return (
    <div className="admin p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-md text-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Welcome back, Admin! 👋</h1>
          <p className="text-gray-600">
            Here's a quick overview of your platform.
          </p>
        </div>
        <Button variant="secondary" className="bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300">
          Quick Actions
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-lg transition-shadow duration-300 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
