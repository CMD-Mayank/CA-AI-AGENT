
import React, { useState, useEffect } from 'react';
import { ModuleContainer } from './common/ModuleContainer';
import { Task, Client } from '../types';
import { storageService } from '../services/storage';
import { Button } from './common/Button';

interface TasksProps {
    clients: Client[];
}

export const Tasks: React.FC<TasksProps> = ({ clients }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showModal, setShowModal] = useState(false);
    
    // New Task Form State
    const [newTask, setNewTask] = useState<Partial<Task>>({
        priority: 'Medium',
        status: 'To Do'
    });

    useEffect(() => {
        const loadedTasks = storageService.getTasks();
        setTasks(loadedTasks);
    }, []);

    const handleSaveTask = () => {
        if (!newTask.title || !newTask.clientId || !newTask.dueDate) return;
        
        const client = clients.find(c => c.id === newTask.clientId);
        
        const taskToAdd: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            clientId: newTask.clientId,
            clientName: client?.name || 'Unknown',
            assignee: newTask.assignee || 'Unassigned',
            dueDate: newTask.dueDate,
            status: newTask.status as any,
            priority: newTask.priority as any
        };

        const updatedTasks = [...tasks, taskToAdd];
        setTasks(updatedTasks);
        storageService.saveTasks(updatedTasks);
        
        // Reset and close
        setNewTask({ priority: 'Medium', status: 'To Do' });
        setShowModal(false);
        
        // Log
        storageService.logActivity({
            id: Date.now().toString(),
            clientId: taskToAdd.clientId,
            clientName: taskToAdd.clientName,
            action: 'Task Created',
            timestamp: Date.now(),
            details: taskToAdd.title
        });
    };

    const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);
        storageService.saveTasks(updatedTasks);
    };

    const deleteTask = (taskId: string) => {
        if (confirm('Delete this task?')) {
            const updatedTasks = tasks.filter(t => t.id !== taskId);
            setTasks(updatedTasks);
            storageService.saveTasks(updatedTasks);
        }
    };
    
    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'High': return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns: { label: string; status: Task['status'] }[] = [
        { label: 'To Do', status: 'To Do' },
        { label: 'In Progress', status: 'In Progress' },
        { label: 'Review', status: 'Review' },
        { label: 'Done', status: 'Done' },
    ];

    return (
        <ModuleContainer title="Workflow Manager" description="Track deliverables, deadlines, and team assignments.">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Active Tasks:</span>
                    <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900 rounded-full text-xs font-bold text-teal-800 dark:text-teal-300">{tasks.filter(t => t.status !== 'Done').length}</span>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    + Create Task
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex overflow-x-auto gap-4 pb-4 h-[calc(100vh-16rem)]">
                {columns.map((col) => (
                    <div key={col.status} className="flex-shrink-0 w-72 bg-gray-50 dark:bg-slate-800/50 rounded-xl flex flex-col border border-gray-200 dark:border-slate-700">
                        <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-100 dark:bg-slate-800 rounded-t-xl">
                            <h3 className="font-semibold text-gray-700 dark:text-slate-200 text-sm">{col.label}</h3>
                            <span className="text-xs text-gray-500 bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600">
                                {tasks.filter(t => t.status === col.status).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {tasks.filter(t => t.status === col.status).map(task => (
                                <div key={task.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 px-1">
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{task.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">{task.clientName}</p>
                                    
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-700 mt-2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 flex items-center justify-center text-[10px] font-bold">
                                                {task.assignee.charAt(0)}
                                            </div>
                                            <span className="text-[10px] text-gray-500">{task.dueDate}</span>
                                        </div>
                                        {/* Simple Move Logic for demo */}
                                        <div className="flex gap-1">
                                             {col.status !== 'To Do' && (
                                                 <button onClick={() => updateTaskStatus(task.id, columns[columns.findIndex(c => c.status === col.status) - 1].status)} className="text-gray-400 hover:text-teal-600 text-xs" title="Move Left">←</button>
                                             )}
                                             {col.status !== 'Done' && (
                                                 <button onClick={() => updateTaskStatus(task.id, columns[columns.findIndex(c => c.status === col.status) + 1].status)} className="text-gray-400 hover:text-teal-600 text-xs" title="Move Right">→</button>
                                             )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.status === col.status).length === 0 && (
                                <div className="text-center py-8 text-xs text-gray-400 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Task</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Task Title</label>
                                <input 
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                                    value={newTask.title || ''}
                                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    placeholder="e.g. File Quarterly TDS"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Client</label>
                                <select 
                                    className="w-full p-2 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                                    value={newTask.clientId || ''}
                                    onChange={e => setNewTask({...newTask, clientId: e.target.value})}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Assignee</label>
                                    <input 
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                                        value={newTask.assignee || ''}
                                        onChange={e => setNewTask({...newTask, assignee: e.target.value})}
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Due Date</label>
                                    <input 
                                        type="date"
                                        className="w-full p-2 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
                                        value={newTask.dueDate || ''}
                                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-slate-400 mb-1">Priority</label>
                                <div className="flex gap-2">
                                    {['Low', 'Medium', 'High'].map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setNewTask({...newTask, priority: p as any})}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded border ${
                                                newTask.priority === p 
                                                ? 'bg-teal-100 border-teal-500 text-teal-800 dark:bg-teal-900 dark:text-teal-200' 
                                                : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm border rounded hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
                            <Button onClick={handleSaveTask} style={{flex: 1}}>Save Task</Button>
                        </div>
                    </div>
                </div>
            )}
        </ModuleContainer>
    );
};
