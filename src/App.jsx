// frontend/src/App.jsx - Complete Integrated Version
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, MessageSquare, Sparkles, GripVertical, Folder, CheckCircle2, Clock, ListTodo, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Service
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// API Functions
const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

const taskAPI = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};

const aiAPI = {
  summarizeProject: (projectId) => api.get(`/ai/summarize/${projectId}`),
  askQuestion: (taskId, question) => api.post(`/ai/question/${taskId}`, { question }),
  getSuggestions: (taskId) => api.get(`/ai/suggestions/${taskId}`),
};

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100', icon: ListTodo, badgeColor: 'bg-slate-500' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-50', icon: Clock, badgeColor: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-50', icon: CheckCircle2, badgeColor: 'bg-green-500' }
];

export default function TaskManagementSystem() {
  // State Management
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormColumn, setTaskFormColumn] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMode, setAiMode] = useState('summarize');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [selectedTaskForAI, setSelectedTaskForAI] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: '' });

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject._id);
    }
  }, [selectedProject]);

  // API Functions
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getAll();
      const projectsData = response.data.data;
      setProjects(projectsData);
      if (projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
    } catch (err) {
      setError('Failed to fetch projects. Make sure the backend server is running.');
      console.error('Fetch projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await taskAPI.getByProject(projectId);
      setTasks(response.data.data);
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError('Failed to fetch tasks');
    }
  };

  const handleCreateProject = async () => {
    if (!projectForm.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      const response = await projectAPI.create(projectForm);
      const newProject = response.data.data;
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
      setProjectForm({ name: '', description: '' });
      setShowProjectForm(false);
    } catch (err) {
      alert(`Failed to create project: ${err.message}`);
    }
  };

  const handleUpdateProject = async () => {
    try {
      const response = await projectAPI.update(editingProject._id, projectForm);
      const updatedProject = response.data.data;
      setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
      if (selectedProject?._id === updatedProject._id) {
        setSelectedProject(updatedProject);
      }
      setEditingProject(null);
      setProjectForm({ name: '', description: '' });
    } catch (err) {
      alert(`Failed to update project: ${err.message}`);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;

    try {
      await projectAPI.delete(id);
      setProjects(projects.filter(p => p._id !== id));
      setTasks(tasks.filter(t => t.projectId !== id));
      if (selectedProject?._id === id) {
        const remainingProjects = projects.filter(p => p._id !== id);
        setSelectedProject(remainingProjects[0] || null);
      }
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) {
      alert('Task title is required');
      return;
    }

    try {
      const response = await taskAPI.create({
        projectId: selectedProject._id,
        title: taskForm.title,
        description: taskForm.description,
        status: taskFormColumn
      });
      const newTask = response.data.data;
      setTasks([...tasks, newTask]);
      setTaskForm({ title: '', description: '', status: '' });
      setShowTaskForm(false);
      setTaskFormColumn('');
    } catch (err) {
      alert(`Failed to create task: ${err.message}`);
    }
  };

  const handleUpdateTask = async () => {
    try {
      const response = await taskAPI.update(editingTask._id, taskForm);
      const updatedTask = response.data.data;
      setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t));
      setEditingTask(null);
      setTaskForm({ title: '', description: '', status: '' });
    } catch (err) {
      alert(`Failed to update task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await taskAPI.delete(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    // Optimistic update
    const oldTasks = [...tasks];
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      await taskAPI.updateStatus(taskId, newStatus);
    } catch (err) {
      // Revert on error
      setTasks(oldTasks);
      alert(`Failed to update task status: ${err.message}`);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (columnId) => {
    if (draggedTask && draggedTask.status !== columnId) {
      handleTaskDrop(draggedTask._id, columnId);
    }
    setDraggedTask(null);
  };

  // AI Functions
  const handleAISummarize = async () => {
    setAiLoading(true);
    setAiResponse('');
    try {
      const response = await aiAPI.summarizeProject(selectedProject._id);
      setAiResponse(response.data.data.summary);
    } catch (err) {
      setAiResponse(`Failed to generate summary: ${err.message}\n\nMake sure your Gemini API key is configured correctly in the backend .env file.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim() || !selectedTaskForAI) {
      alert('Please select a task and enter a question');
      return;
    }

    setAiLoading(true);
    setAiResponse('');
    try {
      const response = await aiAPI.askQuestion(selectedTaskForAI._id, aiQuestion);
      setAiResponse(response.data.data.answer);
    } catch (err) {
      setAiResponse(`Failed to get answer: ${err.message}\n\nMake sure your Gemini API key is configured correctly in the backend .env file.`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISuggestions = async () => {
    if (!selectedTaskForAI) {
      alert('Please select a task');
      return;
    }

    setAiLoading(true);
    setAiResponse('');
    try {
      const response = await aiAPI.getSuggestions(selectedTaskForAI._id);
      setAiResponse(response.data.data.suggestions);
    } catch (err) {
      setAiResponse(`Failed to get suggestions: ${err.message}\n\nMake sure your Gemini API key is configured correctly in the backend .env file.`);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => t.projectId === selectedProject?._id);
  
  const stats = {
    total: filteredTasks.length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    inProgress: filteredTasks.filter(t => t.status === 'inprogress').length,
    todo: filteredTasks.filter(t => t.status === 'todo').length,
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={64} />
          <p className="text-slate-600 text-lg">Loading projects...</p>
          <p className="text-slate-500 text-sm mt-2">Make sure backend is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Task Manager Pro
              </h1>
              <p className="text-slate-600 text-lg">AI-Powered Project Management System</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-lg shadow-md border ${error ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
                <span className={`text-sm font-semibold ${error ? 'text-red-700' : 'text-green-700'}`}>
                  {error ? '⚠️ Backend Error' : '✓ Connected'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div>
                <h3 className="text-red-800 font-semibold">Connection Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-3">
            {/* Projects */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Folder className="text-indigo-500" size={24} />
                  Projects
                </h2>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition shadow-md hover:shadow-lg"
                  title="Create new project"
                >
                  <Plus size={20} />
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Folder size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No projects yet</p>
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Create your first project
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map(project => (
                    <div
                      key={project._id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedProject?._id === project._id
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-400 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">{project.name}</h3>
                          <p className="text-sm text-slate-600 truncate">{project.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProject(project);
                              setProjectForm({ name: project.name, description: project.description });
                            }}
                            className="p-1 text-indigo-500 hover:bg-indigo-50 rounded transition"
                            title="Edit project"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project._id);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                            title="Delete project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editingProject && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <h3 className="font-semibold mb-2 text-indigo-900">Edit Project</h3>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Project name"
                  />
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="2"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProject}
                      className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setProjectForm({ name: '', description: '' });
                      }}
                      className="flex-1 px-3 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6 border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Sparkles className="text-purple-500" size={20} />
                AI Assistant
              </h3>
              <button
                onClick={() => {
                  setShowAIPanel(true);
                  setAiMode('summarize');
                  setAiResponse('');
                }}
                disabled={!selectedProject}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} />
                Open AI Assistant
              </button>
              <p className="text-xs text-slate-500 text-center mt-2">
                Powered by Google Gemini AI
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">
            {selectedProject ? (
              <>
                {/* Project Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-100">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedProject.name}</h2>
                  <p className="text-slate-600 mb-4">{selectedProject.description}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                      <div className="text-2xl font-bold text-slate-700">{stats.total}</div>
                      <div className="text-sm text-slate-600">Total Tasks</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{stats.done}</div>
                      <div className="text-sm text-green-600">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
                      <div className="text-sm text-blue-600">In Progress</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-700">
                        {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                      </div>
                      <div className="text-sm text-purple-600">Progress</div>
                    </div>
                  </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-3 gap-4">
                  {columns.map(column => {
                    const Icon = column.icon;
                    const columnTasks = filteredTasks.filter(t => t.status === column.id);
                    
                    return (
                      <div
                        key={column.id}
                        className={`${column.color} rounded-xl p-4 min-h-[600px] border border-slate-200`}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(column.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Icon size={20} className="text-slate-700" />
                            <h3 className="font-bold text-slate-800">{column.title}</h3>
                            <span className={`${column.badgeColor} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                              {columnTasks.length}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setTaskFormColumn(column.id);
                              setShowTaskForm(true);
                            }}
                            className="p-1.5 bg-white rounded-lg hover:bg-slate-50 shadow-sm hover:shadow transition"
                            title="Add task"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        {showTaskForm && taskFormColumn === column.id && (
                          <div className="bg-white rounded-xl p-3 mb-3 shadow-lg border border-slate-200">
                            <input
                              type="text"
                              placeholder="Task title"
                              value={taskForm.title}
                              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                              className="w-full px-2 py-1 border rounded-lg mb-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              autoFocus
                            />
                            <textarea
                              placeholder="Description"
                              value={taskForm.description}
                              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                              className="w-full px-2 py-1 border rounded-lg mb-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleCreateTask}
                                className="flex-1 px-2 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition font-semibold"
                              >
                                Add Task
                              </button>
                              <button
                                onClick={() => {
                                  setShowTaskForm(false);
                                  setTaskForm({ title: '', description: '', status: '' });
                                  setTaskFormColumn('');
                                }}
                                className="flex-1 px-2 py-1.5 bg-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-400 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {columnTasks.map(task => (
                            <div
                              key={task._id}
                              draggable
                              onDragStart={() => handleDragStart(task)}
                              className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-200 cursor-move border border-slate-200 hover:border-indigo-300"
                            >
                              {editingTask?._id === task._id ? (
                                <div>
                                  <input
                                    type="text"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    className="w-full px-2 py-1 border rounded-lg mb-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    className="w-full px-2 py-1 border rounded-lg mb-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleUpdateTask}
                                      className="flex-1 px-2 py-1 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingTask(null);
                                        setTaskForm({ title: '', description: '', status: '' });
                                      }}
                                      className="flex-1 px-2 py-1 bg-slate-300 rounded-lg text-sm hover:bg-slate-400"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-start gap-2 mb-2">
                                    <GripVertical size={16} className="text-slate-400 mt-1 flex-shrink-0" />
                                    <h4 className="font-semibold text-slate-800 flex-1 leading-snug">{task.title}</h4>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-slate-600 mb-3 pl-6 leading-relaxed">{task.description}</p>
                                  )}
                                  <div className="flex gap-2 pl-6">
                                    <button
                                      onClick={() => {
                                        setEditingTask(task);
                                        setTaskForm({ title: task.title, description: task.description, status: task.status });
                                      }}
                                      className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded transition"
                                      title="Edit task"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task._id)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                                      title="Delete task"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedTaskForAI(task);
                                        setShowAIPanel(true);
                                        setAiMode('qa');
                                        setAiResponse('');
                                      }}
                                      className="p-1.5 text-purple-500 hover:bg-purple-50 rounded ml-auto transition"
                                      title="Ask AI"
                                    >
                                      <MessageSquare size={14} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-slate-100">
                <Folder size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-2xl font-bold text-slate-600 mb-2">No project selected</h3>
                <p className="text-slate-500 mb-6">Create or select a project to get started</p>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition"
                >
                  <Plus size={20} />
                  Create Project
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-slate-800">Create New Project</h3>
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setProjectForm({ name: '', description: '' });
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name *</label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter project name"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                placeholder="Enter project description"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 font-semibold shadow-lg hover:shadow-xl transition"
              >
                Create Project
              </button>
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setProjectForm({ name: '', description: '' });
                }}
                className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIPanel && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="sticky top-0 bg-white border-b p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="text-purple-500" />
                  AI Assistant
                </h3>
                <button
                  onClick={() => {
                    setShowAIPanel(false);
                    setAiResponse('');
                    setAiQuestion('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAiMode('summarize');
                    setAiResponse('');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition shadow-md ${
                    aiMode === 'summarize'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Summarize
                </button>
                <button
                  onClick={() => {
                    setAiMode('qa');
                    setAiResponse('');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition shadow-md ${
                    aiMode === 'qa'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Ask Question
                </button>
                <button
                  onClick={() => {
                    setAiMode('suggestions');
                    setAiResponse('');
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition shadow-md ${
                    aiMode === 'suggestions'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Suggestions
                </button>
              </div>
            </div>

            <div className="p-6">
              {aiMode === 'summarize' && (
                <div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <p className="text-slate-700">
                      Get an AI-powered summary of <strong>{selectedProject.name}</strong> including progress analysis, key accomplishments, and recommendations.
                    </p>
                  </div>
                  <button
                    onClick={handleAISummarize}
                    disabled={aiLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Generating Summary...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Generate Summary
                      </>
                    )}
                  </button>
                </div>
              )}

              {aiMode === 'qa' && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Task
                    </label>
                    <select
                      value={selectedTaskForAI?._id || ''}
                      onChange={(e) => setSelectedTaskForAI(filteredTasks.find(t => t._id === e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a task...</option>
                      {filteredTasks.map(task => (
                        <option key={task._id} value={task._id}>
                          {task.title} ({task.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Question
                    </label>
                    <textarea
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Ask anything about this task... e.g., 'What are the main steps?' or 'What challenges might I face?'"
                    />
                  </div>

                  <button
                    onClick={handleAIQuestion}
                    disabled={aiLoading || !selectedTaskForAI || !aiQuestion.trim()}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Getting Answer...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={20} />
                        Get Answer
                      </>
                    )}
                  </button>
                </div>
              )}

              {aiMode === 'suggestions' && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Task
                    </label>
                    <select
                      value={selectedTaskForAI?._id || ''}
                      onChange={(e) => setSelectedTaskForAI(filteredTasks.find(t => t._id === e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Choose a task...</option>
                      {filteredTasks.map(task => (
                        <option key={task._id} value={task._id}>
                          {task.title} ({task.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4">
                    <p className="text-slate-700">
                      Get AI-powered suggestions including action items, complexity assessment, and success criteria for the selected task.
                    </p>
                  </div>

                  <button
                    onClick={handleAISuggestions}
                    disabled={aiLoading || !selectedTaskForAI}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Generating Suggestions...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Get AI Suggestions
                      </>
                    )}
                  </button>
                </div>
              )}

              {aiResponse && (
                <div className="mt-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2 text-lg">
                    <Sparkles size={20} />
                    AI Response
                  </h4>
                  <div className="text-slate-700 whitespace-pre-wrap prose prose-sm max-w-none leading-relaxed">
                    {aiResponse}
                  </div>
                </div>
              )}

              {!aiResponse && !aiLoading && (
                <div className="mt-6 text-center py-8">
                  <Sparkles size={48} className="mx-auto text-purple-300 mb-3" />
                  <p className="text-slate-500">
                    {aiMode === 'summarize' && 'Click the button above to generate an AI summary'}
                    {aiMode === 'qa' && 'Select a task and ask a question to get AI insights'}
                    {aiMode === 'suggestions' && 'Select a task to get AI-powered suggestions'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}