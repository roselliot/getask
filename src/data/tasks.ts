// tasks.ts
import { Task, User } from '../types/types';

export const initialTasks: Task[] = [
  { id: 'elec', name: 'Electricity', duration: 1, startDay: 0, category: 'Electrical', status: 'Not Started' },
  { id: 'plumb', name: 'Plumbing', duration: 1, startDay: 0, category: 'Plumbing', status: 'Not Started' },
  { id: 'tile', name: 'Tiles', duration: 2, startDay: 0, category: 'Tiling', status: 'Not Started' },
  { id: 'alum', name: 'Aluminium', duration: 1, startDay: 0, category: 'Aluminium', status: 'Not Started' },
  { id: 'plaster', name: 'Plaster', duration: 2, startDay: 0, category: 'Plaster', status: 'Not Started' },
  { id: 'concrete', name: 'Ponçage', duration: 2, startDay: 0, category: 'Concrete', status: 'Not Started' },
  { id: 'paint', name: 'Painting', duration: 20, startDay: 0, category: 'Painting', status: 'Not Started' },
  { id: 'accessories', name: 'Accessories', duration: 1, startDay: 0, category: 'Accessories', status: 'Not Started' },
  { id: 'parquet', name: 'Parquet', duration: 1, startDay: 0, category: 'Parquet', status: 'Not Started' },
  { id: 'woodwork', name: 'Woodwork', duration: 1, startDay: 0, category: 'Woodwork', status: 'Not Started' },
  { id: 'cleaning', name: 'Cleaning', duration: 1, startDay: 0, category: 'Cleaning', status: 'Not Started' },
];

export const initialUsers: User[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'viewer', password: 'viewer123', role: 'viewer' },
];