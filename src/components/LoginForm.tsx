import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface LoginFormProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  handleLogin: (username: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isDarkMode, toggleDarkMode, handleLogin }) => {
  return (
    <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-1000`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-1000`}>Login</h2>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          data-tooltip-id="dark-mode-tooltip"
          data-tooltip-content={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const username = formData.get('username') as string;
          const password = formData.get('password') as string;
          handleLogin(username, password);
        }}
      >
        <div className="mb-4">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
          <input
            type="text"
            name="username"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
            required
          />
        </div>
        <div className="mb-4">
          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
          <input
            type="password"
            name="password"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;