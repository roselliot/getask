import { Moon, Sun, Plus, UserPlus, LogOut, RefreshCw, Play, Square } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface HeaderOptionsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  resetTimer: () => void;
  setIsAddingTask: (isAddingTask: boolean) => void;
  setIsAddingUser: (isAddingUser: boolean) => void;
  handleLogout: () => void;
  userRole: 'admin' | 'viewer' | null;
}

const HeaderOptions: React.FC<HeaderOptionsProps> = ({
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
      <Tooltip id="dark-mode-tooltip" />
      <Tooltip id="start-stop-tooltip" />
      <Tooltip id="reset-tooltip" />
      <Tooltip id="add-task-tooltip" />
      <Tooltip id="add-user-tooltip" />
      <Tooltip id="logout-tooltip" />
    </div>
  );
};

export default HeaderOptions;