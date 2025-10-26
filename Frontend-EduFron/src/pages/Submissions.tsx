import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Search, Download, Eye } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubmissionModal from '../components/SubmissionModal';
import { toast } from 'react-toastify';
import { API_BASE } from '../lib/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  classId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  hasFile: boolean;
  fileExtension: string;
  isPreviewable: boolean;
  className?: string;
  teacherName?: string;
}

interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  fileName: string;
  fileSize: number;
  comments: string;
  submittedAt: string;
  gradedAt: string | null;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  grade: number | null;
  feedback: string | null;
  studentName: string;
  studentNumber: string;
  hasFile: boolean;
  fileExtension: string;
  isPreviewable: boolean;
}

const Submissions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'available' | 'submitted'>('available');
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{ id: number; title: string } | null>(null);

  const API_BASE_URL = `${API_BASE}/api/students`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsResponse, submissionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/assignments`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }),
        fetch(`${API_BASE_URL}/submissions`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }),
      ]);

      if (assignmentsResponse.status === 401 || submissionsResponse.status === 401) {
        navigate('/login');
        return;
      }

      if (assignmentsResponse.ok) {
        const result = await assignmentsResponse.json();
        if (result.success) setAvailableAssignments(result.assignments || []);
      }

      if (submissionsResponse.ok) {
        const result = await submissionsResponse.json();
        if (result.success) setSubmissions(result.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FILTER OUT ASSIGNMENTS THAT HAVE BEEN SUBMITTED
  const getUnsubmittedAssignments = () => {
    const submittedAssignmentIds = new Set(submissions.map(sub => sub.assignmentId));
    return availableAssignments.filter(assignment => !submittedAssignmentIds.has(assignment.id));
  };

  const handleSubmitAssignment = (assignmentId: number) => {
    const assignment = availableAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    setSelectedAssignment({ id: assignmentId, title: assignment.title });
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
      console.log('Submission response:', result);
      if (response.ok && result.success) {
        toast.success('Assignment submitted successfully!');
        setIsModalOpen(false);
        setSelectedAssignment(null);
        
        // ✅ REFRESH DATA AFTER SUBMISSION
        await fetchData();
        setActiveTab('submitted');
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAssignment = async (assignmentId: number, fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/download`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading assignment:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDownloadSubmission = async (submissionId: number, fileName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/download`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading submission:', error);
      toast.error('Failed to download file');
    }
  };

  const handlePreviewFile = async (assignmentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/preview`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('Failed to preview file');
    }
  };

  // ✅ USE FILTERED ASSIGNMENTS
  const unsubmittedAssignments = getUnsubmittedAssignments();
  const filteredSubmissions = submissions.filter(sub =>
    sub.assignmentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || sub.status === statusFilter)
  );

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Assignment Submissions</h1>
          <p className="text-slate-600">Submit and track your assignments</p>
        </div>

        <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium ${
                  activeTab === 'available'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500'
                }`}
              >
                <Upload className="w-4 h-4" />
                {/* ✅ SHOW COUNT OF UNSUBMITTED ASSIGNMENTS */}
                <span>Available Assignments ({unsubmittedAssignments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium ${
                  activeTab === 'submitted'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Submissions ({submissions.length})</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'available' && (
              <div>
                {unsubmittedAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No assignments available</p>
                    <p className="text-slate-400 text-sm mt-2">
                      {availableAssignments.length > 0 
                        ? "All assignments have been submitted!" 
                        : "No assignments assigned yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {unsubmittedAssignments.map(a => (
                      <div key={a.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                        <h3 className="font-semibold text-lg text-slate-800 mb-2">{a.title}</h3>
                        <p className="text-slate-600 text-sm mb-4">{a.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Due:</span>
                            <span>{new Date(a.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Max Points:</span>
                            <span>{a.maxPoints}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleSubmitAssignment(a.id)}
                            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700"
                          >
                            Submit Work
                          </button>
                          {a.hasFile && (
                            <button
                              onClick={() => handleDownloadAssignment(a.id, a.fileName)}
                              className="bg-slate-600 text-white p-2 rounded-lg hover:bg-slate-700"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {a.hasFile && a.isPreviewable && (
                            <button
                              onClick={() => handlePreviewFile(a.id)}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
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
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Status</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="GRADED">Graded</option>
                    <option value="LATE">Late</option>
                  </select>
                </div>

                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No submissions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map(s => (
                      <div key={s.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800">{s.assignmentTitle}</h3>
                            <p className="text-slate-600 text-sm">
                              Submitted on {new Date(s.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                s.status === 'GRADED'
                                  ? 'bg-green-100 text-green-800'
                                  : s.status === 'LATE'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {s.status}
                            </span>
                            {s.grade && (
                              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                                Grade: {s.grade}
                              </span>
                            )}
                          </div>
                        </div>

                        {s.comments && <p className="text-slate-600 text-sm mb-4">{s.comments}</p>}

                        {s.feedback && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Teacher Feedback:</strong> {s.feedback}
                            </p>
                          </div>
                        )}

                        {s.hasFile && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600">{s.fileName}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDownloadSubmission(s.id, s.fileName)}
                                className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-700"
                              >
                                Download
                              </button>
                              {s.isPreviewable && (
                                <button
                                  onClick={() => handlePreviewFile(s.assignmentId)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  Preview
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignmentId={selectedAssignment?.id || 0}
        assignmentTitle={selectedAssignment?.title || ''}
        onSubmit={handleFileSubmit}
        isSubmitting={isSubmitting}
      />

      <Footer />
    </div>
  );
};

export default Submissions;