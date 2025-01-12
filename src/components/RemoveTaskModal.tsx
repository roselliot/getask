import React from 'react';

interface RemoveTaskModalProps {
  isDarkMode: boolean;
  setIsRemoveModalOpen: (isOpen: boolean) => void;
  taskToRemove: string | null;
  editedTaskName: string;
  setEditedTaskName: (name: string) => void;
  updateTaskName: () => void;
  removeTask: (taskId: string) => void;
}

const RemoveTaskModal: React.FC<RemoveTaskModalProps> = ({
  isDarkMode,
  setIsRemoveModalOpen,
  taskToRemove,
  editedTaskName,
  setEditedTaskName,
  updateTaskName,
  removeTask,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-colors duration-1000">
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-50 transition-colors duration-1000`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-1000`}>Confirm Removal</h2>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Are you sure you want to remove this task?
        </p>
        <input
          type="text"
          value={editedTaskName}
          onChange={(e) => setEditedTaskName(e.target.value)}
          className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
          placeholder="Edit task name"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (taskToRemove) {
                updateTaskName();
                removeTask(taskToRemove);
              } else {
                console.error("No task selected for removal.");
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-1000"
          >
            Confirm Removal
          </button>
          <button
            onClick={() => {
              updateTaskName();
              setIsRemoveModalOpen(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-1000"
          >
            Modify
          </button>
          <button
            onClick={() => setIsRemoveModalOpen(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-1000"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveTaskModal;