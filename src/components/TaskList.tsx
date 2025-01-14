import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  isDarkMode: boolean;
  userRole: 'admin' | 'viewer' | null;
  updateTaskDuration: (taskId: string, newDuration: number) => void;
  currentDay: number;
  totalDuration: number;
  openRemoveModal: (taskId: string) => void;
  setTasks: (tasks: Task[] | ((prevTasks: Task[]) => Task[])) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isDarkMode,
  userRole,
  updateTaskDuration,
  currentDay,
  totalDuration,
  openRemoveModal,
  setTasks,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTasks((prevTasks: Task[]) => {
        const oldIndex = prevTasks.findIndex((task) => task.id === active.id);
        const newIndex = prevTasks.findIndex((task) => task.id === over?.id);

        return arrayMove(prevTasks, oldIndex, newIndex);
      });
    }
  };

  return (
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
  );
};

export default TaskList;