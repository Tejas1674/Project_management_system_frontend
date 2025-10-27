import React, { useState } from 'react';
import { X, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIAssistant({ project, tasks, onClose }) {
  const [mode, setMode] = useState('summarize');
  const [selectedTask, setSelectedTask] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    setResponse('');
    try {
      const result = await aiAPI.summarizeProject(project._id);
      setResponse(result.data.data.summary);
    } catch (error) {
      console.error('AI Error:', error);
      setResponse('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedTask || !question.trim()) {
      alert('Please select a task and enter a question');
      return;
    }

    setLoading(true);
    setResponse('');
    try {
      const result = await aiAPI.askQuestion(selectedTask, question);
      setResponse(result.data.data.answer);
    } catch (error) {
      console.error('AI Error:', error);
      setResponse('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!selectedTask) {
      alert('Please select a task');
      return;
    }

    setLoading(true);
    setResponse('');
    try {
      const result = await aiAPI.getSuggestions(selectedTask);
      setResponse(result.data.data.suggestions);
    } catch (error) {
      console.error('AI Error:', error);
      setResponse('Failed to get suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-purple-500" />
              AI Assistant
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('summarize');
                setResponse('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                mode === 'summarize'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Summarize Project
            </button>
            <button
              onClick={() => {
                setMode('qa');
                setResponse('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                mode === 'qa'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Ask Question
            </button>
            <button
              onClick={() => {
                setMode('suggestions');
                setResponse('');
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                mode === 'suggestions'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Get Suggestions
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === 'summarize' && (
            <div>
              <p className="text-slate-600 mb-4">
                Get an AI-powered summary of your project's current status, progress, and recommendations.
              </p>
              <button
                onClick={handleSummarize}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
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

          {mode === 'qa' && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
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
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Ask anything about this task..."
                />
              </div>

              <button
                onClick={handleAskQuestion}
                disabled={loading || !selectedTask || !question.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
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

          {mode === 'suggestions' && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGetSuggestions}
                disabled={loading || !selectedTask}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
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

          {response && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Sparkles size={18} />
                AI Response
              </h4>
              <div className="text-slate-700 whitespace-pre-wrap prose prose-sm max-w-none">
                {response}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}