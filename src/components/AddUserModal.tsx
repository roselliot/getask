import React, { useState } from 'react';

interface AddUserModalProps {
  isDarkMode: boolean;
  setIsAddingUser: (isAdding: boolean) => void;
  handleAddUser: () => void;
  newUsername: string;
  setNewUsername: (username: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  newRole: 'admin' | 'viewer';
  setNewRole: (role: 'admin' | 'viewer') => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isDarkMode,
  setIsAddingUser,
  handleAddUser,
  newUsername,
  setNewUsername,
  newPassword,
  setNewPassword,
  newRole,
  setNewRole,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-colors duration-1000">
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-50 transition-colors duration-1000`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} transition-colors duration-1000`}>Add New User</h2>
        <input
          type="text"
          placeholder="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
        />
        <input
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as 'admin' | 'viewer')}
          className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-1000"
        >
          Add User
        </button>
        <button
          onClick={() => setIsAddingUser(false)}
          className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-1000"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddUserModal;