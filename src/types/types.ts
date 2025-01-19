// types/types.ts
export interface Task {
  id: string;
  name: string;
  duration: number;
  startDay: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  category: 'Electrical' | 'Plumbing' | 'Tiling' | 'Painting' | 'Aluminium' | 'Plaster' | 'Concrete' | 'Accessories' | 'Parquet' | 'Woodwork' | 'Cleaning' | 'Carpentry' | 'Finishing';
}

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'viewer';
}