import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Plus, Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AssignmentCard from '../components/AssignmentCard';
import SubmissionCard from '../components/SubmissionCard';
import SubmissionModal from '../components/SubmissionModal';
import type { StudentSubmission, AvailableAssignment } from '../types/submission';
import { toast } from 'react-toastify';

const Submissions: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'available' | 'submitted'>('available');
  const [availableAssignments, setAvailableAssignments] = useState<AvailableAssignment[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{ id: number; title: string } | null>(null);

  const API_BASE_URL = 'http://localhost:8081/api/students';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch Available Assignments
      const availableResponse = await fetch(`${API_BASE_URL}/assignments/available`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (availableResponse.status === 401) {
        navigate('/login');
        return;
      }
      if (availableResponse.ok) {
        const result = await availableResponse.json();
        if (result.success && Array.isArray(result.assignments)) {
          setAvailableAssignments(result.assignments);
        }
      }

      // Fetch Submissions
      const submissionsResponse = await fetch(`${API_BASE_URL}/submissions`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (submissionsResponse.status === 401) {
        navigate('/login');
        return;
      }
      if (submissionsResponse.ok) {
        const result = await submissionsResponse.json();
        if (result.success && Array.isArray(result.submissions)) {
          setSubmissions(result.submissions);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssignment = (assignmentId: number) => {
    const assignment = availableAssignments.find(a => a.assignmentId === assignmentId);
    if (!assignment) return;
    setSelectedAssignment({ id: assignmentId, title: assignment.assignmentTitle });
    setIsModalOpen(true);
  };

  const handleFileSubmit = async (file: File, comments: string) => {
    if (!selectedAssignment) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('comments', comments);

      const response = await fetch(`${API_BASE_URL}/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Assignment submitted successfully!');
        setIsModalOpen(false);
        setSelectedAssignment(null);
        await fetchData();
        setActiveTab('submitted');
      } else {
        toast.error(result.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch =
      submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading submissions...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600 mb-1">Assignment Submissions</h1>
            <p className="text-slate-600">Manage your assignment submissions and track their status</p>
          </div>
          <span className="text-sm text-slate-500">
            {activeTab === 'available'
              ? `${availableAssignments.length} assignments available`
              : `${submissions.length} submissions total`}
          </span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Available Assignments</span>
                {availableAssignments.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                    {availableAssignments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'submitted'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Submissions</span>
                {submissions.length > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                    {submissions.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'available' && (
              <div>
                {availableAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg mb-2">No assignments available</p>
                    <p className="text-sm text-slate-400">
                      All assignments have been submitted or no assignments are currently available.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableAssignments.map(assignment => (
                      <AssignmentCard
                        key={assignment.assignmentId}
                        assignment={assignment}
                        onSubmit={handleSubmitAssignment}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submitted' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="sm:w-48 relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="GRADED">Graded</option>
                      <option value="LATE">Late</option>
                    </select>
                  </div>
                </div>

                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg mb-2">
                      {searchTerm || statusFilter !== 'all'
                        ? 'No submissions match your search'
                        : 'No submissions yet'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <button
                        onClick={() => setActiveTab('available')}
                        className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>View Available Assignments</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map(submission => (
                      <SubmissionCard
                        key={submission.id}
                        submission={submission}
                        onView={sub => alert(JSON.stringify(sub, null, 2))}
                        onDownload={() => alert('Download triggered')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignmentId={selectedAssignment?.id || 0}
        assignmentTitle={selectedAssignment?.title || ''}
        onSubmit={handleFileSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Submissions;
