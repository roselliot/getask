import React from 'react';
import { GripVertical, Trash } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';

interface Task {
  id: string;
  name: string;
  duration: number;
}

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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const start = 0;
  const startPercentage = (start / totalDuration) * 100;
  const taskProgress = Math.min(Math.max(currentDay - start, 0), task.duration);
  const progressPercentage = (taskProgress / task.duration) * 100;
  const [draggedTaskDuration, setDraggedTaskDuration] = React.useState(task.duration);

  React.useEffect(() => {
    setDraggedTaskDuration(task.duration);
  }, [task.duration]);

  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const { setNodeRef: setDragNodeRef, listeners: dragListeners, transform: dragTransform } = useDraggable({id: `drag-${task.id}`,
  });
  const handleDragEnd = () => {
    if (progressBarRef.current) {
      const progressBarWidth = progressBarRef.current.clientWidth;
      const deltaX = dragTransform?.x || 0;

      const maxX = progressBarWidth - (draggedTaskDuration / totalDuration) * progressBarWidth;
      const constrainedX = Math.max(-startPercentage * (progressBarWidth / 100), Math.min(deltaX, maxX));
      const newDuration = Math.max(1, Math.round(((startPercentage * (progressBarWidth / 100) + constrainedX) / progressBarWidth) * totalDuration));

      setDraggedTaskDuration(newDuration);
      updateTaskDuration(task.id, newDuration);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-4 p-4 rounded-lg shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-colors duration-1000`}
    >
      <div className="flex items-center mb-2">
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab transition-colors duration-1000"
        >
          <GripVertical className="w-4 h-4 text-gray-500 transition-colors duration-1000" />
        </div>
        {userRole !== 'admin' && (
          <div className={`flex-1 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} transition-colors duration-1000`}>
            {task.name}
          </div>
        )}
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
          ref={setDragNodeRef}
          {...dragListeners}
          style={{
            left: `${startPercentage}%`,
            width: `${(draggedTaskDuration / totalDuration) * 100}%`,
            transform: dragTransform && progressBarRef.current
              ? `translate3d(${Math.max(-startPercentage * (progressBarRef.current.clientWidth / 100), Math.min(dragTransform.x, progressBarRef.current.clientWidth - (draggedTaskDuration / totalDuration) * progressBarRef.current.clientWidth))}px, 0, 0)`
              : undefined,
          }}
          className="absolute h-full bg-emerald-200 rounded-lg transition-colors duration-1000"
          onMouseUp={handleDragEnd}
          onClick={(e) => {
            e.stopPropagation(); // Prevent click event from propagating
          }}
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
            {draggedTaskDuration}j
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="flex items-center gap-2 transition-colors duration-1000">
          <div className={`flex-1 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-700'} transition-colors duration-1000`}>
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
          />
          <button
            onClick={() => openRemoveModal(task.id)}
            className={`px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-700 text-gray-100 border-gray-600' : 'bg-white text-gray-800 border-gray-300'} border hover:bg-opacity-80 transition-colors duration-1000`}
          >
            <Trash className="w-4 h-4 transition-colors duration-1000" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SortableTask;