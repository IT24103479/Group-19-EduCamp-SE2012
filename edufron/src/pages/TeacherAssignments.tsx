import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Download, Eye, Star, Users, X, Calendar, FileUp } from 'lucide-react';
import { toast } from 'react-toastify';

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
  className: string;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
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

const TeacherAssignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions'>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: '100',
    classId: '',
    file: null as File | null,
  });

  const API_BASE_URL = 'http://localhost:8081/api/teachers';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const assignmentsResponse = await fetch(`${API_BASE_URL}/assignments`, { 
        credentials: 'include' 
      });

      if (assignmentsResponse.ok) {
        const result = await assignmentsResponse.json();
        console.log('Assignments API Response:', result);
        if (result.success) {
          setAssignments(result.assignments || []);
        } else {
          toast.error(result.message || 'Failed to load assignments');
        }
      } else {
        const errorText = await assignmentsResponse.text();
        console.error('Assignments API Error:', errorText);
        toast.error('Failed to load assignments');
      }

      // Fetch submissions
      try {
        const submissionsResponse = await fetch(`${API_BASE_URL}/submissions`, { 
          credentials: 'include' 
        });
        
        if (submissionsResponse.ok) {
          const result = await submissionsResponse.json();
          console.log('Submissions API Response:', result);
          if (result.success) {
            setSubmissions(result.submissions || []);
          }
        }
      } catch (submissionError) {
        console.log('Submissions endpoint not available yet');
        setSubmissions([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!newAssignment.title.trim()) {
        toast.error('Title is required');
        return;
      }
      if (!newAssignment.dueDate) {
        toast.error('Due date is required');
        return;
      }
      if (!newAssignment.maxPoints || parseInt(newAssignment.maxPoints) <= 0) {
        toast.error('Valid max points is required');
        return;
      }
      if (!newAssignment.classId) {
        toast.error('Class ID is required');
        return;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Append all fields as form data
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('dueDate', newAssignment.dueDate + 'T23:59:59');
      formData.append('maxPoints', newAssignment.maxPoints);
      formData.append('classId', newAssignment.classId);
      
      // Append file if exists
      if (newAssignment.file) {
        formData.append('file', newAssignment.file);
      }

      console.log('Creating assignment with form data');

      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        credentials: 'include',
        // Don't set Content-Type header - browser will set it automatically with boundary
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Create assignment response:', result);
        if (result.success) {
          toast.success('Assignment created successfully!');
          setIsCreateModalOpen(false);
          setNewAssignment({ 
            title: '', 
            description: '', 
            dueDate: '', 
            maxPoints: '100', 
            classId: '', 
            file: null 
          });
          fetchData(); // Refresh the data
        } else {
          toast.error(result.message || 'Failed to create assignment');
        }
      } else {
        const errorText = await response.text();
        console.error('Create assignment error:', errorText);
        toast.error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      const gradeValue = parseInt(grade);
      if (isNaN(gradeValue) || gradeValue < 0) {
        toast.error('Please enter a valid grade');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/submissions/${selectedSubmission.id}/grade`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ 
            grade: gradeValue, 
            feedback: feedback 
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Submission graded successfully!');
          setIsGradeModalOpen(false);
          setSelectedSubmission(null);
          setGrade('');
          setFeedback('');
          fetchData();
        } else {
          toast.error(result.message || 'Failed to grade submission');
        }
      } else {
        const errorText = await response.text();
        console.error('Grade submission error:', errorText);
        toast.error('Failed to grade submission');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Failed to grade submission');
    }
  };

  const handleDownloadFile = async (id: number, fileName: string, type: 'assignment' | 'submission' = 'submission') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${type === 'assignment' ? 'assignments' : 'submissions'}/${id}/download`, 
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('File downloaded successfully');
      } else {
        toast.error('File not available for download');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handlePreviewFile = async (id: number, fileName: string, type: 'assignment' | 'submission' = 'submission') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${type === 'assignment' ? 'assignments' : 'submissions'}/${id}/preview`, 
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        toast.error('File preview not available');
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      toast.error('Failed to preview file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewAssignment({
      ...newAssignment,
      file: file
    });
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch =
      submission.assignmentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED': return 'bg-green-100 text-green-800';
      case 'LATE': return 'bg-red-100 text-red-800';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading assignments...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Create Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-600 mb-2">Assignment Management</h1>
            <p className="text-slate-600">Create assignments and review student submissions</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium ${activeTab === 'assignments' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}
              >
                <FileText className="w-4 h-4" />
                <span>My Assignments ({assignments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium ${activeTab === 'submissions' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500'}`}
              >
                <Users className="w-4 h-4" />
                <span>Student Submissions ({submissions.length})</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div>
                {assignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">No assignments created yet</p>
                    <p className="text-slate-400 text-sm mt-2">Create your first assignment to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(assignment => (
                      <div key={assignment.id} className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg text-slate-800 flex-1">{assignment.title}</h3>
                          {assignment.hasFile && (
                            <FileUp className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {assignment.description || 'No description provided'}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Due Date:
                            </span>
                            <span className="text-slate-700 font-medium">
                              {formatDate(assignment.dueDate)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Max Points:</span>
                            <span className="text-slate-700 font-medium">{assignment.maxPoints}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Class ID:</span>
                            <span className="text-slate-700 font-medium">{assignment.classId}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { 
                              setActiveTab('submissions'); 
                              setSearchTerm(assignment.title); 
                            }}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Submissions
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
                      Search Submissions
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        id="search"
                        type="text"
                        placeholder="Search by assignment, student name, or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-slate-700 mb-1">
                      Filter by Status
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg">
                      {submissions.length === 0 ? 'No submissions yet' : 'No submissions match your search'}
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                      {submissions.length === 0 ? 'Student submissions will appear here' : 'Try adjusting your search or filter'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSubmissions.map(submission => (
                      <div key={submission.id} className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-slate-800 mb-1">
                              {submission.assignmentTitle}
                            </h3>
                            <p className="text-slate-600 text-sm">
                              Submitted by <span className="font-medium">{submission.studentName}</span> 
                              {submission.studentNumber && ` (${submission.studentNumber})`}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">
                              Submitted on {formatDate(submission.submittedAt)}
                              {submission.gradedAt && ` • Graded on ${formatDate(submission.gradedAt)}`}
                            </p>
                          </div>
                          <div className="flex space-x-2 flex-shrink-0">
                            {submission.hasFile && (
                              <>
                                <button
                                  onClick={() => handlePreviewFile(submission.id, submission.fileName)}
                                  className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors"
                                  title="Preview submission"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(submission.id, submission.fileName)}
                                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                                  title="Download submission"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => { 
                                setSelectedSubmission(submission); 
                                setGrade(submission.grade?.toString() || ''); 
                                setFeedback(submission.feedback || '');
                                setIsGradeModalOpen(true); 
                              }}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                              title="Grade submission"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                          </div>
                          <div className="text-slate-700">
                            <span className="font-medium">Grade: </span>
                            {submission.grade !== null && submission.grade !== undefined ? 
                              `${submission.grade} points` : 'Not graded'
                            }
                          </div>
                        </div>
                        
                        {submission.feedback && (
                          <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                            <p className="text-sm text-slate-700">
                              <span className="font-medium">Feedback:</span> {submission.feedback}
                            </p>
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
      </div>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsCreateModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter assignment title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter assignment description (optional)"
                  rows={3}
                />
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date *
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="maxPoints" className="block text-sm font-medium text-slate-700 mb-1">
                  Maximum Points *
                </label>
                <input
                  id="maxPoints"
                  type="number"
                  min="1"
                  value={newAssignment.maxPoints}
                  onChange={e => setNewAssignment({ ...newAssignment, maxPoints: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="100"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="classId" className="block text-sm font-medium text-slate-700 mb-1">
                  Class ID *
                </label>
                <input
                  id="classId"
                  type="number"
                  min="1"
                  value={newAssignment.classId}
                  onChange={e => setNewAssignment({ ...newAssignment, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter class ID"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-1">
                  Assignment File (Optional)
                </label>
                <input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {newAssignment.file && (
                  <p className="text-sm text-slate-600 mt-1">
                    Selected: {newAssignment.file.name}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {isGradeModalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={() => setIsGradeModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Grade Submission</h2>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-700 mb-1">
                <strong>Assignment:</strong> {selectedSubmission.assignmentTitle}
              </p>
              <p className="text-slate-700">
                <strong>Student:</strong> {selectedSubmission.studentName} 
                {selectedSubmission.studentNumber && ` (${selectedSubmission.studentNumber})`}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">
                  Grade (Points)
                </label>
                <input
                  id="grade"
                  type="number"
                  min="0"
                  placeholder="Enter grade points"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 mb-1">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  placeholder="Enter feedback for the student"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setIsGradeModalOpen(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmission}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;