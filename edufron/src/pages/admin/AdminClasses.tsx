import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "../../hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
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
import { Textarea } from "../../components/ui/textarea";
import { Search, Plus, Edit, Trash2, Users, Clock, DollarSign } from "lucide-react";

// --- Types ---

interface ClassItem {
  id: number;
  name: string;
  grade: string;
  description: string;
  schedule: string;
  capacity: number;
  fee: number;
  enrolled?: number;
  teacherId: number;
  subjectIds: number[];
}


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



const classSchema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  grade: z.string().min(1, "Grade is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  schedule: z.string().min(1, "Schedule is required"),
  capacity: z.string().min(1, "Capacity is required"),
  fee: z.string().min(1, "Fee is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  subjectIds: z.array(z.string()).min(1, "At least one subject is required"),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function AdminClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([
      axios.get<Teacher[]>("http://localhost:8081/teachers"),
      axios.get<Subject[]>("http://localhost:8081/subjects"),
      axios.get<any[]>("http://localhost:8081/classes"),
    ])
      .then(([teachersRes, subjectsRes, classesRes]) => {
        setTeachers(teachersRes.data);
        setSubjects(subjectsRes.data);
        // Map legacy backend data to new shape if needed
        const mapped = classesRes.data.map((cls) => {
          // If teacherId/subjectIds exist, use as is
          if (typeof cls.teacherId === 'number' && Array.isArray(cls.subjectIds)) return cls;
          // Fallback: map teacher (string) to teacherId, subject (string or array) to subjectIds
          let teacherId = null;
          if (cls.teacher && teachersRes.data.length) {
            const t = teachersRes.data.find(t => t.name === cls.teacher);
            teacherId = t ? t.id : null;
          }
          let subjectIds = [];
          if (cls.subject && subjectsRes.data.length) {
            if (Array.isArray(cls.subject)) {
              subjectIds = cls.subject.map((s) => {
                const subj = subjectsRes.data.find(sub => sub.name === s);
                return subj ? subj.id : null;
              }).filter(Boolean);
            } else {
              const subj = subjectsRes.data.find(sub => sub.name === cls.subject);
              if (subj) subjectIds = [subj.id];
            }
          }
          return {
            ...cls,
            teacherId,
            subjectIds,
            fee: typeof cls.fee === 'string' ? parseInt(cls.fee, 10) : cls.fee,
            capacity: typeof cls.capacity === 'string' ? parseInt(cls.capacity, 10) : cls.capacity,
          };
        });
        setClasses(mapped);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      (cls.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (cls.description?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });


  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      grade: "",
      description: "",
      schedule: "",
      capacity: "",
      fee: "",
    },
  });


  const onSubmit = (data: ClassFormData) => {
    const payload = {
  name: data.name,
  grade: data.grade,
  //description: data.description,
  timetable: data.schedule,
  //capacity: parseInt(data.capacity, 10),
  fee: parseInt(data.fee, 10),
  teacher: selectedTeacherId ? { id: selectedTeacherId } : null,
  subjects: selectedSubjectIds.map((id) => ({ id })),
};

    if (editingClass) {
      axios.put(`http://localhost:8081/classes/${editingClass.id}`, payload)
        .then((res) => {
          setClasses(classes.map((cls) => (cls.id === editingClass.id ? res.data : cls)));
          toast({
            title: "Class Updated",
            description: `${data.name} has been updated successfully.`,
          });
          setEditingClass(null);
          form.reset();
          setIsCreateDialogOpen(false);
        })
        .catch((err) => {
          toast({
            title: "Update Failed",
            description: "Could not update class in database.",
            variant: "destructive",
          });
          console.error("Update error:", err);
        });
        console.log("PUT payload:", payload);
    } else {
      axios.post("http://localhost:8081/classes", { ...payload, enrolled: 0 })
        .then((res) => {
          setClasses([...classes, res.data]);
          toast({
            title: "Class Created",
            description: `${data.name} has been created successfully.`,
          });
          form.reset();
          setIsCreateDialogOpen(false);
        })
        .catch((err) => {
          toast({
            title: "Create Failed",
            description: "Could not create class in database.",
            variant: "destructive",
          });
          console.error("Create error:", err);
        });
        console.log("PUT payload:", payload);
    }
  };

  const handleEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    form.reset({
      name: cls.name || "",
      grade: cls.grade || "",
      teacherId: cls.teacherId?.toString() || "",
subjectIds: cls.subjectIds?.map(String) || [],
      description: cls.description || "",
      schedule: cls.schedule || "",
      capacity: cls.capacity?.toString() || "0",
      fee: cls.fee?.toString() || "0",
    });
    setSelectedTeacherId(cls.teacherId || null);
    setSelectedSubjectIds(cls.subjectIds || []);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string | number) => {
    fetch(`http://localhost:8081/classes/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete class");
        setClasses(classes.filter((cls) => cls.id !== id));
        toast({
          title: "Class Deleted",
          description: "The class has been deleted from the database.",
          variant: "destructive",
        });
      })
      .catch((err) => {
        toast({
          title: "Delete Failed",
          description: "Could not delete class from database.",
          variant: "destructive",
        });
        console.error("Delete error:", err);
      });
  };

  return (
    <div className="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classes Management</h1>
            <p className="text-muted-foreground">Create and manage tuition classes</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle>{editingClass ? "Edit Class" : "Create New Class"}</DialogTitle>
                <DialogDescription>
                  {editingClass
                    ? "Update the class information below."
                    : "Fill in the details to create a new class."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Class Name + Subject */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Advanced Mathematics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter grade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  {/* Teacher */}
            {/*     <div className="mb-4">
                    <FormLabel>Teacher</FormLabel>
                    <select
                      className="w-full border rounded p-2"
                      value={selectedTeacherId ?? ""}
                      onChange={e => setSelectedTeacherId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subjects (multi-select) */}
                 {/* <div className="mb-4">
                    <FormLabel>Subjects</FormLabel>
                    <select
                      className="w-full border rounded p-2"
                      multiple
                      value={selectedSubjectIds.map(String)}
                      onChange={e => {
                        const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                        setSelectedSubjectIds(options);
                      }}
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>*/}

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the class content and objectives..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Schedule + Capacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schedule</FormLabel>
                          <FormControl>
                            <Input placeholder="Mon, Wed - 10:00 AM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fee */}
                  <FormField
                    control={form.control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee</FormLabel>
                        <FormControl>
                          <Input placeholder="$200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
  control={form.control}
  name="teacherId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Teacher</FormLabel>
      <FormControl>
        <select
          {...field}
          onChange={(e) => {
            field.onChange(e.target.value);
            setSelectedTeacherId(parseInt(e.target.value, 10));
          }}
          value={field.value || ""}
        >
          <option value="">Select teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="subjectIds"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Subjects</FormLabel>
      <FormControl>
        <select
          multiple
          value={field.value || []}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, (opt) => opt.value);
            field.onChange(values);
            setSelectedSubjectIds(values.map((v) => parseInt(v, 10)));
          }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
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
                        setEditingClass(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingClass ? "Update Class" : "Create Class"}
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
              placeholder="Search classes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-sm">
              Total: {classes.length} classes
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Enrolled: {classes.reduce((sum, c) => sum + (c.enrolled ?? 0), 0)} students
            </Badge>
          </div>
        </div>

        {/* Classes Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <CardDescription>Manage all tuition classes and their details</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {cls.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cls.subjectIds.map(sid => {
                        const subj = subjects.find(s => s.id === sid);
                        return subj ? (
                          <span key={sid} className="inline-block mr-1 bg-gray-200 px-2 py-1 rounded text-xs">{subj.name}</span>
                        ) : null;
                      })}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const teacher = teachers.find(t => t.id === cls.teacherId);
                        return teacher ? teacher.name : "";
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{cls.enrolled}/{cls.capacity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{cls.schedule}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>{cls.fee}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(cls)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cls.id)}
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
