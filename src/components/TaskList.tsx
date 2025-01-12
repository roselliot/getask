import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, UniqueIdentifier, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  setTasks: (tasks: Task[]) => void;
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
      setTasks((tasks: any[]) => {
        const oldIndex = tasks.findIndex((task: { id: UniqueIdentifier; }) => task.id === active.id);
        const newIndex = tasks.findIndex((task: { id: UniqueIdentifier | undefined; }) => task.id === over?.id);

        return arrayMove(tasks, oldIndex, newIndex);
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