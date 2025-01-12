import React from 'react';
import { Calendar, Moon, Sun, Plus, UserPlus, LogOut, RefreshCw, Play, Square } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  resetTimer: () => void;
  setIsAddingTask: (isAdding: boolean) => void;
  setIsAddingUser: (isAdding: boolean) => void;
  handleLogout: () => void;
  userRole: 'admin' | 'viewer' | null;
}

const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleDarkMode,
  isRunning,
  setIsRunning,
  resetTimer,
  setIsAddingTask,
  setIsAddingUser,
  handleLogout,
  userRole,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mr-2`} />
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Project Timeline</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          data-tooltip-id="dark-mode-tooltip"
          data-tooltip-content={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
        {userRole === 'admin' && (
          <>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2 rounded ${isRunning ? 'bg-red-500' : 'bg-emerald-500'} text-white`}
              data-tooltip-id="start-stop-tooltip"
              data-tooltip-content={isRunning ? 'Stop' : 'Start'}
            >
              {isRunning ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              data-tooltip-id="reset-tooltip"
              data-tooltip-content="Reset"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsAddingTask(true)}
              className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              data-tooltip-id="add-task-tooltip"
              data-tooltip-content="Add Task"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsAddingUser(true)}
              className="p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              data-tooltip-id="add-user-tooltip"
              data-tooltip-content="Add User"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          onClick={handleLogout}
          className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          data-tooltip-id="logout-tooltip"
          data-tooltip-content="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Header;