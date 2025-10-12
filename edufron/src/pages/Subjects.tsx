import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubjectCard from '../components/SubjectCard';
import { Search, Filter } from 'lucide-react';

// Define Subject type
interface Subject {
  id: number;
  name: string;
  grade: string;
  description: string;
  image: string;
  duration: string;
  students: number;
  price: string;
}

interface SubjectCardProps {
  subject: Subject;
  index: number;
}


const Subjects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  const subjects: Subject[] = [
    {
      id: 1,
      name: 'Mathematics',
      grade: '6-11',
      description:
        'Comprehensive mathematics program covering algebra, geometry, calculus, and statistics with practical applications.',
      image:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '3 months',
      students: 150,
      price: '15,000',
    },
    {
      id: 2,
      name: 'Science',
      grade: '6-11',
      description:
        'Integrated science program covering physics, chemistry, and biology with hands-on laboratory experiments.',
      image:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '3 months',
      students: 120,
      price: '18,000',
    },
    {
      id: 3,
      name: 'English Language',
      grade: '6-11',
      description:
        'Advanced English language skills including grammar, literature, creative writing, and communication.',
      image:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '3 months',
      students: 200,
      price: '12,000',
    },
    {
      id: 4,
      name: 'History',
      grade: '6-11',
      description:
        'Comprehensive study of world and local history with focus on critical thinking and analysis.',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '3 months',
      students: 80,
      price: '10,000',
    },
    {
      id: 5,
      name: 'Geography',
      grade: '6-11',
      description:
        'Physical and human geography with emphasis on environmental studies and map reading skills.',
      image:
        'https://images.unsplash.com/photo-1597149962419-0d900ac2e4c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '3 months',
      students: 90,
      price: '10,000',
    },
    {
      id: 6,
      name: 'Information Technology',
      grade: '6-11',
      description:
        'Modern IT skills including programming, web development, and digital literacy.',
      image:
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '3 months',
      students: 110,
      price: '20,000',
    },
  ];

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrade =
      selectedGrade === 'all' || subject.grade.includes(selectedGrade);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Subjects</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore our comprehensive range of subjects designed to help students
            excel from Grades 6 to 11
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Grades</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSubjects.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} index={index} />
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">
              No subjects found matching your criteria.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Subjects;
