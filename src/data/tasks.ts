import { Task, User } from '../types/types';

export const initialTasks: Task[] = [
  { id: 'elec', name: 'Electricity', duration: 1, startDay: 0 },
  { id: 'plumb', name: 'Plumbing', duration: 1, startDay: 0 },
  { id: 'tile', name: 'Tiles', duration: 2, startDay: 0 },
  { id: 'alum', name: 'Aluminium', duration: 1, startDay: 0 },
  { id: 'plaster', name: 'Plaster', duration: 2, startDay: 0 },
  { id: 'concrete', name: 'Ponçage', duration: 2, startDay: 0 },
  { id: 'paint', name: 'Painting', duration: 20, startDay: 0 },
  { id: 'accessories', name: 'Accessories', duration: 1, startDay: 0 },
  { id: 'parquet', name: 'Parquet', duration: 1, startDay: 0 },
  { id: 'woodwork', name: 'Woodwork', duration: 1, startDay: 0 },
  { id: 'cleaning', name: 'Cleaning', duration: 1, startDay: 0 },
];

export const initialUsers: User[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'viewer', password: 'viewer123', role: 'viewer' },
];