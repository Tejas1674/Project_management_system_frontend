import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { id: 'inprogress', title: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', title: 'Done', color: 'bg-green-50' }
];

export default function KanbanBoard({
  project,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskDrop
}) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormColumn, setTaskFormColumn] = useState('');
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });
  const [draggedTask, setDraggedTask] = useState(null);

  const handleCreateTask = () => {
    if (!taskForm.title.trim()) return;
    onCreateTask({
      title: taskForm.title,
      description: taskForm.description,
      status: taskFormColumn
    });
    setTaskForm({ title: '', description: '' });
    setShowTaskForm(false);
    setTaskFormColumn('');
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (columnId) => {
    if (draggedTask && draggedTask.status !== columnId) {
      onTaskDrop(draggedTask._id, columnId);
    }
    setDraggedTask(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
        <p className="text-slate-600">{project.description}</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-slate-500">
            Total Tasks: <span className="font-semibold">{tasks.length}</span>
          </span>
          <span className="text-slate-500">
            Completed: <span className="font-semibold text-green-600">
              {tasks.filter(t => t.status === 'done').length}
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`${column.color} rounded-lg p-4 min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {column.title}
                <span className="text-sm bg-white px-2 py-1 rounded-full">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </h3>
              <button
                onClick={() => {
                  setTaskFormColumn(column.id);
                  setShowTaskForm(true);
                }}
                className="p-1 bg-white rounded hover:bg-slate-100 shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>

            {showTaskForm && taskFormColumn === column.id && (
              <div className="bg-white rounded-lg p-3 mb-3 shadow-md">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-2 py-1 border rounded mb-2 text-sm"
                  autoFocus
                />
                <textarea
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-2 py-1 border rounded mb-2 text-sm"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTask}
                    className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setTaskForm({ title: '', description: '' });
                      setTaskFormColumn('');
                    }}
                    className="flex-1 px-2 py-1 bg-slate-300 text-slate-700 rounded text-sm hover:bg-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onDragStart={handleDragStart}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
