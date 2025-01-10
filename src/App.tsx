import { useState, useEffect } from 'react';
import { Calendar, Moon, Sun, Settings } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];
}

const initialTasks: Task[] = [
  { id: 'elec', name: 'Électricité modif (tv+refrigerateur)', duration: 1, dependencies: [] },
  { id: 'plumb', name: 'Plomberie modif (sdb+balcon)', duration: 1, dependencies: [] },
  { id: 'tile', name: 'Carrelage (sdb+placard+finition)', duration: 2, dependencies: ['plumb'] },
  { id: 'alum', name: 'Aluminium (porte+fenêtre+cache rideau)', duration: 1, dependencies: [] },
  { id: 'plaster', name: 'Platre sdb', duration: 2, dependencies: ['plumb', 'elec'] },
  { id: 'concrete', name: 'Ponçage', duration: 2, dependencies: ['plaster'] },
  { id: 'paint', name: 'Peinture', duration: 20, dependencies: ['plaster'] },
  { id: 'accessories', name: 'Pose des accessoires', duration: 1, dependencies: ['paint'] },
  { id: 'parquet', name: 'Parquet', duration: 1, dependencies: ['concrete'] },
  { id: 'woodwork', name: 'Pose menuiserie bois', duration: 1, dependencies: ['paint'] },
  { id: 'cleaning', name: 'Nettoyage', duration: 1, dependencies: ['woodwork', 'accessories', 'parquet'] }
];

function App() {
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const savedDay = localStorage.getItem('currentDay');
    return savedDay ? parseInt(savedDay, 10) : 0;
  });
  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem('title') || 'Project Timeline';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    return savedMode === 'true';
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    const savedRunning = localStorage.getItem('isRunning');
    return savedRunning === 'true';
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedLoggedIn = localStorage.getItem('isLoggedIn');
    return savedLoggedIn === 'true';
  });
  const [userRole, setUserRole] = useState<'admin' | 'viewer' | null>(() => {
    const savedRole = localStorage.getItem('userRole');
    return savedRole === 'admin' || savedRole === 'viewer' ? savedRole : null;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });
  const [isChangingCredentials, setIsChangingCredentials] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'viewer', password: 'viewer123', role: 'viewer' }
    ];
  });

  const getTaskStart = (task: Task): number => {
    if (task.dependencies.length === 0) return 0;
    return Math.max(...task.dependencies.map(depId => {
      const depTask = tasks.find(t => t.id === depId)!;
      return getTaskStart(depTask) + depTask.duration;
    }));
  };

  const totalDuration = Math.max(...tasks.map(task => getTaskStart(task) + task.duration));

  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setUserRole(user.role);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', user.role);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userRole');
  };

  useEffect(() => {
    localStorage.setItem('currentDay', currentDay.toString());
  }, [currentDay]);

  useEffect(() => {
    localStorage.setItem('title', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode.toString());
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('isRunning', isRunning.toString());
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      const startTimestamp = Date.now() - currentDay * 1000;
      setStartTime(startTimestamp);

      interval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTimestamp) / 1000);
        const elapsedDays = (elapsedTime / (24 * 60 * 60)) * totalDuration;
        setCurrentDay(elapsedDays);
      }, 1000);
    } else {
      setStartTime(null);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, duration: newDuration } : task
      )
    );
  };

  const resetTimer = () => {
    setCurrentDay(0);
    setIsRunning(false);
  };

  const handleChangeCredentials = () => {
    setIsChangingCredentials(true);
  };

  const saveNewCredentials = () => {
    const updatedUsers = users.map(user => {
      if (user.role === userRole) {
        return { ...user, username: newUsername, password: newPassword };
      }
      return user;
    });
    setUsers(updatedUsers);
    setIsChangingCredentials(false);
    alert('Credentials updated successfully!');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 transition-colors duration-200`}>
      <div className="max-w-6xl mx-auto">
        {!isLoggedIn ? (
          <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Login</h2>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-200`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-800" />
                )}
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
                  className={`mt-1 block w-full px-3 py-2 border ${
                    isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <input
                  type="password"
                  name="password"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
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
          <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} cursor-pointer hover:text-emerald-600 transition-colors duration-200`}
                    onClick={() => userRole === 'admin' && setIsEditingTitle(true)}
                  >
                    {title}
                  </h1>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-200`}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-800" />
                  )}
                </button>
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`px-4 py-2 rounded ${isRunning ? 'bg-red-500' : 'bg-emerald-500'} text-white`}
                    >
                      {isRunning ? 'Stop' : 'Start'}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Reset
                    </button>
                  </>
                )}
                <button
                  onClick={handleChangeCredentials}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>

            {isChangingCredentials && (
              <div className="mb-6">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Change Credentials</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveNewCredentials();
                  }}
                >
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingCredentials(false)}
                    className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {tasks.map(task => {
                  const start = getTaskStart(task);
                  const startPercentage = (start / totalDuration) * 100;
                  const widthPercentage = (task.duration / totalDuration) * 100;

                  const taskProgress = Math.min(
                    Math.max(currentDay - start, 0),
                    task.duration
                  );
                  const progressPercentage = (taskProgress / task.duration) * 100;

                  return (
                    <div key={task.id} className="mb-4">
                      <div className="flex items-center mb-1">
                        <div className={`w-1/4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {task.name}
                        </div>
                        <div className="w-3/4 relative h-8">
                          <div
                            className={`absolute h-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                            style={{ width: '100%' }}
                          />
                          <div
                            className="absolute h-full bg-emerald-200 rounded-lg"
                            style={{
                              left: `${startPercentage}%`,
                              width: `${widthPercentage}%`
                            }}
                          >
                            {progressPercentage > 0 && (
                              <div
                                className="absolute h-full bg-emerald-500 rounded-l-lg"
                                style={{
                                  width: `${progressPercentage}%`
                                }}
                              />
                            )}
                            <div className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-emerald-900' : 'text-emerald-900'}`}>
                              {task.duration}j
                            </div>
                          </div>
                        </div>
                      </div>
                      {userRole === 'admin' && (
                        <div className="flex items-center gap-2 mt-2">
                          <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration (days):</label>
                          <input
                            type="number"
                            value={task.duration}
                            onChange={(e) => updateTaskDuration(task.id, parseInt(e.target.value) || 1)}
                            className={`w-20 px-2 py-1 border rounded ${
                              isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                            } transition-colors duration-200`}
                            min="1"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>Total Duration: {totalDuration} days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;