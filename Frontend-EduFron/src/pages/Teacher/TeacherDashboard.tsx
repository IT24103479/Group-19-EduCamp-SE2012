import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload ,FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import TeacherMaterialForm from '../../pages/Teacher/TeacherMaterialForm';
import TeacherAssignments from '../../pages/TeacherAssignments';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('materials');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated load
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Effortlessly manage your materials and assignments in one place.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-gray-200 shadow-md rounded-2xl p-2 transition-all">
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'materials'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload Materials
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'assignments'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-5 h-5" />
              Upload Assignments
            </button>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100"
        >
          {activeTab === 'materials' ? (
            <TeacherMaterialForm />
          ) : (
            <TeacherAssignments />
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;