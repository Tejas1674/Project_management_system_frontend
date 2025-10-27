import React, { useState } from 'react';
import { Edit2, Trash2, GripVertical, MessageSquare } from 'lucide-react';

export default function TaskCard({ task, onUpdate, onDelete, onDragStart }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description
  });

  const handleSave = () => {
    onUpdate(task._id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ title: task.title, description: task.description });
    setIsEditing(false);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={() => onDragStart(task)}
      className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition cursor-move"
    >
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="w-full px-2 py-1 border rounded mb-2 text-sm"
          />
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-2 py-1 border rounded mb-2 text-sm"
            rows="2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-2 py-1 bg-slate-300 text-slate-700 rounded text-sm hover:bg-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2 mb-2">
            <GripVertical size={16} className="text-slate-400 mt-1 flex-shrink-0" />
            <h4 className="font-semibold text-slate-800 flex-1">{task.title}</h4>
          </div>
          {task.description && (
            <p className="text-sm text-slate-600 mb-3 pl-6">{task.description}</p>
          )}
          <div className="flex gap-2 pl-6">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
              title="Edit task"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Delete this task?')) {
                  onDelete(task._id);
                }
              }}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}