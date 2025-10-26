import { useState,useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Plus, Search, Edit, Trash2, Mail, Phone, GraduationCap, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../hooks/use-toast";
import { API_BASE } from "../../lib/api";


interface Teacher {
  id: number;
  name: string;
  subject: string;
  email: string;
  phone: string;
  address: string;
  qualification: string;
  b_day: string;
  j_date: string;
  image?: string;
}

interface Subject {
  id: number;
  name: string;
}

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  subject: z.string().min(1, "Subject is required"),
  qualification: z.string().min(5, "Qualification must be at least 5 characters"),
  experience: z.string().min(1, "Experience is required"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
});

type TeacherFormData = z.infer<typeof teacherSchema>;


export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();

  const form = useForm<TeacherFormData & { b_day?: string; j_date?: string }>(
    {
      resolver: zodResolver(
        teacherSchema.extend({
          b_day: z.string().optional(),
          j_date: z.string().optional(),
        })
      ),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        subject: "",
        qualification: "",
        experience: "",
        bio: "",
        b_day: "",
        j_date: "",
      },
    }
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const onSubmit = (data: TeacherFormData) => {
    if (editingTeacher) {
      // Update existing teacher
      setTeachers(teachers.map(teacher => 
        teacher.id === editingTeacher.id 
          ? { 
              ...teacher, 
              ...data,
              //avatar: teacher.avatar,
              //rating: teacher.rating,
             // studentsCount: teacher.studentsCount,
              //classesCount: teacher.classesCount,
            }
          : teacher
      ) as any);
      toast({
        title: "Teacher Updated",
        description: `${data.name} has been updated successfully.`,
      });
      setEditingTeacher(null);
    } else {
      // Create new teacher
      const newTeacher = {
        id: (teachers.length + 1).toString(),
        ...data,
        avatar: "/placeholder.svg",
        rating: 0,
        studentsCount: 0,
        classesCount: 0,
      } as any;
      setTeachers([...teachers, newTeacher]);
      toast({
        title: "Teacher Added",
        description: `${data.name} has been added successfully.`,
      });
    }
    form.reset();
    setIsCreateDialogOpen(false);
  };

  useEffect(() => {
  axios.get(`${API_BASE}/api/teachers`)
    .then(res => {
      setTeachers(res.data);
      console.log(res.data);
    })
    .catch(err => {
      console.error("Failed to fetch teachers:", err);
    });
}, []);

 const handleEdit = async (teacherId: number) => {
  try {
    const res = await axios.get(`${API_BASE}/api/teachers/${teacherId}`);
    const teacher = res.data;
    setEditingTeacher(teacher);
    form.reset({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      qualification: teacher.qualification,
      b_day: teacher.b_day,
      j_date: teacher.j_date,
      experience: teacher.experience,
      bio: teacher.bio,
    });
    setIsCreateDialogOpen(true);
  } catch (err) {
    console.error("Failed to fetch teacher:", err);
  }
};

  const handleDelete = (id: string) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
    toast({
      title: "Teacher Removed",
      description: "The teacher has been removed successfully.",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "inactive": return "destructive";
      default: return "default";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="admin">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teachers Management</h1>
          <p className="text-muted-foreground">Manage teaching staff and their information</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher 
                  ? "Update the teacher information below." 
                  : "Fill in the details to add a new teacher."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Sarah Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="sarah@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="PhD in Mathematics, MIT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="8 years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the teacher's background and expertise..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingTeacher(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTeacher ? "Update Teacher" : "Add Teacher"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search teachers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            Total: {teachers.length} teachers
          </Badge>
        { /* <Badge variant="secondary" className="text-sm">
            Total Students: {teachers.reduce((sum, t) => sum + t.studentsCount, 0)}
          </Badge> */}
        </div>
      </div>

      {/* Teachers Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>Manage teaching staff and their profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Contact</TableHead>
                    <TableHead className="text-slate-600">Qualification</TableHead>
    <TableHead className="text-slate-600">Birthdate</TableHead>
    <TableHead className="text-slate-600">Joindate</TableHead>
    <TableHead className="text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={teacher.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {teacher.qualification}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{teacher.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{teacher.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{teacher.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  {/*<TableCell>{teacher.experience}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span>{teacher.rating}</span>
                    </div>
                  </TableCell> */}
                  {/*<TableCell>
                    <div className="text-center">
                      <div className="font-medium">{teacher.studentsCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {teacher.classesCount} classes
                      </div>
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(teacher.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(teacher.id.toString())}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
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