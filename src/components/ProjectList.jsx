import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Folder } from 'lucide-react';

export default function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) {
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const handleEdit = (project) => {
    setEditingProject(project);
    setEditForm({ name: project.name, description: project.description });
  };

  const handleSaveEdit = () => {
    onUpdateProject(editingProject._id, editForm);
    setEditingProject(null);
    setEditForm({ name: '', description: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Folder size={24} />
          Projects
        </h2>
        <button
          onClick={onCreateProject}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {projects.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No projects yet</p>
        ) : (
          projects.map(project => (
            <div
              key={project._id}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedProject?._id === project._id
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
              onClick={() => onSelectProject(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{project.name}</h3>
                  <p className="text-sm text-slate-600 truncate">{project.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(project);
                    }}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project._id);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingProject && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold mb-2">Edit Project</h3>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mb-2"
            placeholder="Project name"
          />
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg mb-2"
            rows="2"
            placeholder="Description"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingProject(null);
                setEditForm({ name: '', description: '' });
              }}
              className="flex-1 px-3 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}