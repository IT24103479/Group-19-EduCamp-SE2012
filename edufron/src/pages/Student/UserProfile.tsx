import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { User, GraduationCap, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from "../../hooks/use-toast";


interface PaymentRequest {
  userId: string;
  classId: string;
  amount: number;
  paymentCompleted: boolean;
  paypalTransactionId?: string;
  enrollmentDate: string;
}
interface ClassItem {
  id: number;
  name: string;
  teacher: string;
  grade: string;
  type: string;
  description: string;
  image: string;
  schedule: string;
  //duration: string;
  //capacity: number;
  //location: string;
  price: string;
}


const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch payments for the user
        const paymentsResponse = await fetch('http://localhost:8080/api/payments');
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        
        const allPayments: PaymentRequest[] = await paymentsResponse.json();
        const userPayments = allPayments.filter(p => p.userId === user.id);
        setPayments(userPayments);

        // Fetch all classes
        const classesResponse = await fetch('http://localhost:8080/classes');
        if (!classesResponse.ok) throw new Error('Failed to fetch classes');
        
        const allClasses: ClassItem[] = await classesResponse.json();
        
        // Filter classes based on user payments
        const userClassIds = userPayments.map(p => p.classId);
        const enrolled = allClasses.filter(c => userClassIds.includes(c.id));
        setEnrolledClasses(enrolled);

      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load enrolled classes. Please try again.',
          variant: 'destructive',
        });
        console.error('Error fetching enrolled classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [user, toast]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Profile Header */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl text-foreground">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="capitalize">
                    <User className="h-3 w-3 mr-1" />
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enrolled Classes Section */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl text-foreground">My Enrolled Classes</CardTitle>
            </div>
            <CardDescription>
              Classes you have successfully enrolled in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : enrolledClasses.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  No enrolled classes yet
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Browse available classes and enroll to get started
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledClasses.map((classItem) => (
                  <Card key={classItem.id} className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg text-foreground line-clamp-2">
                          {classItem.name}
                        </CardTitle>
                        <Badge variant="default" className="shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {classItem.description}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-foreground">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{classItem.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-secondary" />
                          <span>{classItem.schedule}</span>
                        </div>
                        {/*<div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="h-4 w-4 text-accent" />
                          <span>{classItem.duration}</span>
                        </div>*/}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
