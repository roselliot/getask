// SortableTask.tsx
import React, { useState, useRef } from 'react';
import { GripVertical, Trash } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/types';

interface SortableTaskProps {
  task: Task;
  isDarkMode: boolean;
  userRole: 'admin' | 'viewer' | null;
  updateTaskDuration: (taskId: string, newDuration: number) => void;
  currentDay: number;
  totalDuration: number;
  openRemoveModal: (taskId: string) => void;
}

const SortableTask: React.FC<SortableTaskProps> = ({
  task,
  isDarkMode,
  userRole,
  updateTaskDuration,
  currentDay,
  totalDuration,
  openRemoveModal,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    disabled: userRole !== 'admin',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const start = 0;
  const taskProgress = Math.min(Math.max(currentDay / (24 * 60 * 60), 0), task.duration);
  const progressPercentage = (taskProgress / task.duration) * 100;

  const progressBarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [barPosition, setBarPosition] = useState(start);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (userRole !== 'admin') return;

    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !progressBarRef.current || userRole !== 'admin') return;

    const progressBarRect = progressBarRef.current.getBoundingClientRect();
    const emeraldBarWidth = (task.duration / totalDuration) * progressBarRect.width;
    const offsetX = e.clientX - progressBarRect.left;

    const minX = 0;
    const maxX = progressBarRect.width - emeraldBarWidth;
    const newPosition = Math.max(minX, Math.min(offsetX, maxX));

    setBarPosition(newPosition);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-4 p-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-1000 w-full max-w-full overflow-hidden`}
    >
      <div className="flex items-center mb-2">
        {userRole === 'admin' && (
          <div
            {...attributes}
            {...listeners}
            className="p-2 cursor-grab transition-colors duration-1000"
          >
            <GripVertical className="w-4 h-4 text-gray-500 transition-colors duration-1000" />
          </div>
        )}
        <div className={`flex-1 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} transition-colors duration-1000 truncate`}>
          {task.name}
        </div>
      </div>

      <div className="relative h-8 mb-2 transition-colors duration-1000" ref={progressBarRef}>
        <div
          className={`absolute h-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors duration-1000`}
          style={{ width: '100%' }}
        />
        {Array.from({ length: totalDuration - 1 }, (_, i) => (
          <div
            key={i}
            className={`absolute h-full border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-1000`}
            style={{ left: `${((i + 1) / totalDuration) * 100}%` }}
          />
        ))}
        <div
          style={{
            left: `${barPosition}px`,
            width: `${(task.duration / totalDuration) * 100}%`,
          }}
          className={`absolute h-full bg-emerald-200 rounded-lg transition-colors duration-1000 ${
            userRole === 'admin' ? 'cursor-pointer' : 'cursor-default'
          }`}
          onMouseDown={userRole === 'admin' ? handleMouseDown : undefined}
        >
          {progressPercentage > 0 && (
            <div
              className="absolute h-full bg-emerald-500 rounded-l-lg transition-colors duration-1000"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          )}
          <div className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${isDarkMode ? 'text-emerald-900' : 'text-emerald-900'} transition-colors duration-1000`}>
            {task.duration}j
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="flex items-center gap-2 transition-colors duration-1000">
          <div className={`flex-1 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} transition-colors duration-1000 truncate`}>
            {task.name}
          </div>
          <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-1000`}>
            Duration (days):
          </label>
          <input
            type="number"
            value={task.duration}
            onChange={(e) => updateTaskDuration(task.id, parseInt(e.target.value) || 1)}
            className={`w-20 px-2 py-1 border rounded ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} transition-colors duration-1000`}
            min="1"
            disabled={userRole !== 'admin'}
          />
          <button
            onClick={() => openRemoveModal(task.id)}
            className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border hover:bg-opacity-80 transition-colors duration-1000`}
            disabled={userRole !== 'admin'}
          >
            <Trash className="w-4 h-4 transition-colors duration-1000" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SortableTask;