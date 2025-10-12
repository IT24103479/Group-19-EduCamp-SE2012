import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import TeacherMaterialForm from '../pages/TeacherMaterialForm';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'materials'>('materials');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-56"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-sky-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Upload your teaching materials here.
          </p>
        </motion.div>

        {/* Upload Materials Section Only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-600 text-white shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Materials</span>
            </button>
          </div>
        </motion.div>

        <div className="space-y-8">
          <TeacherMaterialForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
