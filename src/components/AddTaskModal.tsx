import React, { useState } from 'react';

interface AddTaskModalProps {
  isDarkMode: boolean;
  setIsAddingTask: (isAdding: boolean) => void;
  handleAddTask: () => void;
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  newTaskDuration: number;
  setNewTaskDuration: (duration: number) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isDarkMode,
  setIsAddingTask,
  handleAddTask,
  newTaskName,
  setNewTaskName,
  newTaskDuration,
  setNewTaskDuration,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-colors duration-1000">
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-50 transition-colors duration-1000`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-1000`}>Add New Task</h2>
        <input
          type="text"
          placeholder="Task Name"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
        />
        <input
          type="number"
          placeholder="Duration (days)"
          value={newTaskDuration}
          onChange={(e) => setNewTaskDuration(parseInt(e.target.value) || 1)}
          className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
          min="1"
        />
        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-1000"
        >
          Add Task
        </button>
        <button
          onClick={() => setIsAddingTask(false)}
          className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-1000"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddTaskModal;