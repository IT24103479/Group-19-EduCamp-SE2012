import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TeacherCard from '../components/TeacherCard';
import { Search, Filter } from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  subject: string;
  description: string;
  image: string;
  rating: number;
  experience: number;
  qualifications: string;
}

const Teachers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const teachers: Teacher[] = [
    {
      id: 1,
      name: 'Dr. Samantha Perera',
      subject: 'Mathematics',
      description:
        'Specialized in advanced mathematics with a passion for making complex concepts simple and engaging.',
      image:
        'https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      experience: 12,
      qualifications: 'PhD in Mathematics',
    },
    {
      id: 2,
      name: 'Mr. Rajesh Kumar',
      subject: 'Science',
      description:
        'Expert in physics and chemistry with extensive laboratory experience and research background.',
      image:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      experience: 15,
      qualifications: 'MSc in Physics',
    },
    {
      id: 3,
      name: 'Ms. Priya Fernando',
      subject: 'English Language',
      description:
        'Passionate about literature and language arts with a focus on creative writing and communication skills.',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      experience: 10,
      qualifications: 'MA in English Literature',
    },
    {
      id: 4,
      name: 'Dr. Nimal Silva',
      subject: 'History',
      description:
        'Historian with deep knowledge of world civilizations and expertise in making history come alive.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      experience: 18,
      qualifications: 'PhD in History',
    },
    {
      id: 5,
      name: 'Ms. Kavitha Mendis',
      subject: 'Geography',
      description:
        'Environmental geographer with field experience and passion for sustainable development education.',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      experience: 8,
      qualifications: 'MSc in Geography',
    },
    {
      id: 6,
      name: 'Mr. Ashan Wickramasinghe',
      subject: 'Information Technology',
      description:
        'Software engineer turned educator with expertise in modern programming languages and web technologies.',
      image:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      experience: 6,
      qualifications: 'BSc in Computer Science',
    },
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === 'all' || teacher.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects: string[] = [...new Set(teachers.map((teacher) => teacher.subject))];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Expert Teachers</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Meet our dedicated team of qualified educators committed to your academic success
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeachers.map((teacher, index) => (
            <TeacherCard key={teacher.id} teacher={teacher} index={index} />
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No teachers found matching your criteria.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Teachers;
