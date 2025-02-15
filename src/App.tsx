import { useState, useEffect } from 'react';
import { Calendar, Moon, Sun, Plus, UserPlus, LogOut, RefreshCw, Play, Square } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTask from './components/SortableTask';
import { initialTasks } from './data/tasks';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { groupTasksByCategory } from './utils/taskUtils';
import { Task, User } from './types/types';

function App() {
  const [currentDay, setCurrentDay] = useState(() => {
    const savedCurrentDay = localStorage.getItem('currentDay');
    return savedCurrentDay ? parseInt(savedCurrentDay) : 0;
  });

  const [title, setTitle] = useState(() => {
    const savedTitle = localStorage.getItem('title');
    return savedTitle || 'Project Timeline';
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [, setStartTime] = useState<number | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return savedIsLoggedIn ? JSON.parse(savedIsLoggedIn) : false;
  });

  const [userRole, setUserRole] = useState<'admin' | 'viewer' | null>(() => {
    const savedUserRole = localStorage.getItem('userRole');
    return savedUserRole ? JSON.parse(savedUserRole) : null;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(1);
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('Electrical'); // Default to 'Electrical'
  const [taskToRemove, setTaskToRemove] = useState<string | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState('');

  const [users, setUsers] = useState<User[]>([
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'viewer', password: 'viewer123', role: 'viewer' },
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'viewer'>('viewer');

  const [totalDuration, setTotalDuration] = useState(() => {
    const savedTotalDuration = localStorage.getItem('totalDuration');
    return savedTotalDuration ? parseInt(savedTotalDuration) : Math.max(...tasks.map((task) => task.duration));
  });

  const tasksByCategory = groupTasksByCategory(tasks);

  const handleTotalDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value) || 1;
    setTotalDuration(newDuration);
    localStorage.setItem('totalDuration', newDuration.toString());
  };

  useEffect(() => {
    localStorage.setItem('currentDay', currentDay.toString());
  }, [currentDay]);

  useEffect(() => {
    const maxTaskDuration = Math.max(...tasks.map((task) => task.duration));
    if (maxTaskDuration > totalDuration) {
      setTotalDuration(maxTaskDuration);
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('title', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('userRole', JSON.stringify(userRole));
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      const startTimestamp = Date.now() - currentDay * 1000;
      setStartTime(startTimestamp);

      interval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTimestamp) / 1000);
        setCurrentDay(elapsedTime);
      }, 1000);
    } else {
      setStartTime(null);
    }

    return () => clearInterval(interval);
  }, [isRunning, totalDuration]);

  const handleLogin = (username: string, password: string) => {
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setUserRole(user.role as 'admin' | 'viewer');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  };

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, duration: newDuration } : task,
      ),
    );
  };

  const removeTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setIsRemoveModalOpen(false);
    setTaskToRemove(null);
    setEditedTaskName('');
  };

  const resetTimer = () => {
    setCurrentDay(0);
    setIsRunning(false);
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${tasks.length + 1}`,
      name: newTaskName,
      duration: newTaskDuration,
      startDay: 0,
      category: newTaskCategory, // Use the validated category
      status: 'Not Started',
    };
    setTasks([...tasks, newTask]);
    setIsAddingTask(false);
    setNewTaskName('');
    setNewTaskDuration(1);
    setNewTaskCategory('Electrical'); // Reset to default category
  };

  const handleAddUser = () => {
    const newUser: User = {
      username: newUsername,
      password: newPassword,
      role: newRole,
    };
    setUsers([...users, newUser]);
    setIsAddingUser(false);
    setNewUsername('');
    setNewPassword('');
    setNewRole('viewer');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over?.id);

        return arrayMove(tasks, oldIndex, newIndex);
      });
    }
  };

  const openRemoveModal = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToRemove(taskId);
      setEditedTaskName(task.name);
      setIsRemoveModalOpen(true);
    }
  };

  const updateTaskName = () => {
    if (taskToRemove) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskToRemove ? { ...task, name: editedTaskName } : task,
        ),
      );
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 transition-colors duration-1000`}>
      <div className="max-w-6xl mx-auto">
        {!isLoggedIn ? (
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
              <Tooltip id="dark-mode-tooltip" />
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
        ) : (
          <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-1000`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mr-2`} />
                {isEditingTitle && userRole === 'admin' ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} border-b-2 border-emerald-500 focus:outline-none bg-transparent`}
                    autoFocus
                  />
                ) : (
                  <h1
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} cursor-pointer hover:text-emerald-600`}
                    onClick={() => userRole === 'admin' && setIsEditingTitle(true)}
                  >
                    {title}
                  </h1>
                )}
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
                <Tooltip id="dark-mode-tooltip" />
                <Tooltip id="start-stop-tooltip" />
                <Tooltip id="reset-tooltip" />
                <Tooltip id="add-task-tooltip" />
                <Tooltip id="add-user-tooltip" />
                <Tooltip id="logout-tooltip" />
              </div>
            </div>

            {isAddingTask && (
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
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as Task['category'])} // Cast to Task['category']
                    className={`w-full px-3 py-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Tiling">Tiling</option>
                    <option value="Painting">Painting</option>
                    <option value="Aluminium">Aluminium</option>
                    <option value="Plaster">Plaster</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Parquet">Parquet</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Finishing">Finishing</option>
                  </select>
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
            )}

            {isAddingUser && (
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
            )}

            {isRemoveModalOpen && (
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
            )}

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {Object.entries(tasksByCategory).map(([category, tasks]) => (
                <div key={category} className="mb-6">
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{category}</h2>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
                      {tasks.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          isDarkMode={isDarkMode}
                          userRole={userRole}
                          updateTaskDuration={updateTaskDuration}
                          currentDay={currentDay}
                          totalDuration={totalDuration}
                          openRemoveModal={openRemoveModal}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-1000`}>
                <p>Total Duration: {totalDuration} days</p>
                {userRole === 'admin' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">Modify Total Duration (days):</label>
                    <input
                      type="number"
                      value={totalDuration}
                      onChange={handleTotalDurationChange}
                      className={`w-20 px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;