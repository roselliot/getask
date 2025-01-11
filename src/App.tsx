import { useState, useEffect } from 'react';
import { Calendar, Moon, Sun, Plus, Trash, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  { id: 'cleaning', name: 'Nettoyage', duration: 1, dependencies: ['woodwork', 'accessories', 'parquet'] },
];

function SortableTask({ task, isDarkMode, userRole, updateTaskDuration, currentDay, totalDuration, openRemoveModal }: {
  task: Task;
  isDarkMode: boolean;
  userRole: 'admin' | 'viewer' | null;
  updateTaskDuration: (taskId: string, newDuration: number) => void;
  removeTask: (taskId: string) => void;
  currentDay: number;
  totalDuration: number;
  openRemoveModal: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const start = task.dependencies.length === 0 ? 0 : Math.max(...task.dependencies.map((depId) => {
    const depTask = initialTasks.find((t) => t.id === depId)!;
    return (depTask.dependencies.length === 0 ? 0 : Math.max(...depTask.dependencies.map((depId) => {
      const depTask = initialTasks.find((t) => t.id === depId)!;
      return depTask.duration;
    }))) + depTask.duration;
  }));

  const startPercentage = (start / totalDuration) * 100;
  const widthPercentage = (task.duration / totalDuration) * 100;

  const taskProgress = Math.min(Math.max(currentDay - start, 0), task.duration);
  const progressPercentage = (taskProgress / task.duration) * 100;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-4 p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-1000`} // Added rounded corners and padding
    >
      <div className="flex items-center mb-2">
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
        <div className={`flex-1 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
          {task.name}
        </div>
      </div>

      <div className="relative h-8 mb-2">
        <div
          className={`absolute h-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
          style={{ width: '100%' }}
        />
        <div
          className="absolute h-full bg-emerald-200 rounded-lg"
          style={{
            left: `${startPercentage}%`,
            width: `${widthPercentage}%`,
          }}
        >
          {progressPercentage > 0 && (
            <div
              className="absolute h-full bg-emerald-500 rounded-l-lg"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          )}
          <div className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-emerald-900' : 'text-emerald-900'}`}>
            {task.duration}j
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="flex items-center gap-2">
          <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration (days):</label>
          <input
            type="number"
            value={task.duration}
            onChange={(e) => updateTaskDuration(task.id, parseInt(e.target.value) || 1)}
            className={`w-20 px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            min="1"
          />
          <button
            onClick={() => openRemoveModal(task.id)}
            className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border hover:bg-opacity-80`}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [currentDay, setCurrentDay] = useState(0);
  const [title, setTitle] = useState('Project Timeline');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [, setStartTime] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'viewer' | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(1);
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);
  const [taskToRemove, setTaskToRemove] = useState<string | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState('');

  const [users] = useState([
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'viewer', password: 'viewer123', role: 'viewer' },
  ]);

  const getTaskStart = (task: Task): number => {
    if (!task || !task.dependencies || task.dependencies.length === 0) return 0;

    const dependencyStarts = task.dependencies.map((depId) => {
      const depTask = tasks.find((t) => t.id === depId);
      if (!depTask) {
        console.error(`Dependency task with ID ${depId} not found.`);
        return 0; // Return 0 if the dependency task is not found
      }
      return getTaskStart(depTask) + depTask.duration;
    });

    return Math.max(...dependencyStarts);
  };

  const totalDuration = Math.max(...tasks.map((task) => getTaskStart(task) + task.duration));

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

  useEffect(() => {
    localStorage.setItem('currentDay', currentDay.toString());
  }, [currentDay]);

  useEffect(() => {
    localStorage.setItem('title', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      const startTimestamp = Date.now() - currentDay * 1000;
      setStartTime(startTimestamp);

      interval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTimestamp) / 1000);
        const elapsedDays = (elapsedTime / (24 * 60 * 60)) * totalDuration;
        if (elapsedDays >= totalDuration) {
          setIsRunning(false);
          setCurrentDay(totalDuration);
        } else {
          setCurrentDay(elapsedDays);
        }
      }, 1000);
    } else {
      setStartTime(null);
    }

    return () => clearInterval(interval);
  }, [isRunning, totalDuration]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('isDarkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('isDarkMode', newDarkMode.toString());
  };

  const updateTaskDuration = (taskId: string, newDuration: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, duration: newDuration } : task,
      ),
    );
  };

  const removeTask = (taskId: string) => {
    if (!taskId) {
      console.error("Task ID is missing.");
      return;
    }

    setTasks((prevTasks) => {
      if (!prevTasks || !Array.isArray(prevTasks)) {
        console.error("Tasks array is invalid.");
        return prevTasks;
      }

      const updatedTasks = prevTasks.filter((task) => task.id !== taskId);
      return updatedTasks;
    });

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
      dependencies: newTaskDependencies,
    };
    setTasks([...tasks, newTask]);
    setIsAddingTask(false);
    setNewTaskName('');
    setNewTaskDuration(1);
    setNewTaskDependencies([]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((tasks) => {
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);

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
    } else {
      console.error("Task not found.");
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
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-1000`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400 transition-colors duration-1000" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-800 transition-colors duration-1000" />
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
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-1000`}>Username</label>
                <input
                  type="text"
                  name="username"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${
                    isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } transition-colors duration-1000`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-1000`}>Password</label>
                <input
                  type="password"
                  name="password"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 ${
                    isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                  } transition-colors duration-1000`}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-1000"
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-1000`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mr-2 transition-colors duration-1000`} />
                {isEditingTitle && userRole === 'admin' ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} border-b-2 border-emerald-500 focus:outline-none bg-transparent transition-colors duration-1000`}
                    autoFocus
                  />
                ) : (
                  <h1
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} cursor-pointer hover:text-emerald-600 transition-colors duration-1000`}
                    onClick={() => userRole === 'admin' && setIsEditingTitle(true)}
                  >
                    {title}
                  </h1>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-1000`}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-400 transition-colors duration-1000" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-800 transition-colors duration-1000" />
                  )}
                </button>
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`px-4 py-2 rounded ${isRunning ? 'bg-red-500' : 'bg-emerald-500'} text-white transition-colors duration-1000`}
                    >
                      {isRunning ? 'Stop' : 'Start'}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-1000"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setIsAddingTask(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-1000"
                    >
                      <Plus className="w-5 h-5 transition-colors duration-1000" />
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-1000"
                >
                  Logout
                </button>
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
                    className={`w-full px-3 py-2 border rounded mb-4 ${
                      isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } transition-colors duration-1000`}
                  />
                  <input
                    type="number"
                    placeholder="Duration (days)"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded mb-4 ${
                      isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } transition-colors duration-1000`}
                    min="1"
                  />
                  <select
                    multiple
                    value={newTaskDependencies}
                    onChange={(e) =>
                      setNewTaskDependencies(Array.from(e.target.selectedOptions, (option) => option.value))
                    }
                    className={`w-full px-3 py-2 border rounded mb-4 ${
                      isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } transition-colors duration-1000`}
                  >
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
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
                    className={`w-full px-3 py-2 border rounded mb-4 ${
                      isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                    } transition-colors duration-1000`}
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

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
                {tasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    isDarkMode={isDarkMode}
                    userRole={userRole}
                    updateTaskDuration={updateTaskDuration}
                    removeTask={removeTask}
                    currentDay={currentDay}
                    totalDuration={totalDuration}
                    openRemoveModal={openRemoveModal}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <div className="mt-6 border-t pt-4">
              <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-1000`}>
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