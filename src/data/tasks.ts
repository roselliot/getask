export interface Task {
    id: string;
    name: string;
    duration: number;
}
export const initialTasks: Task[] = [    
    { id: 'elec', name: 'Electricity', duration: 1 },
    { id: 'plumb', name: 'Plumbing', duration: 1 },
    { id: 'tile', name: 'Tiles', duration: 2 },
    { id: 'alum', name: 'Aluminium', duration: 1 },
    { id: 'plaster', name: 'Plaster', duration: 2 },
    { id: 'concrete', name: 'Ponçage', duration: 2 },
    { id: 'paint', name: 'Painting', duration: 20 },
    { id: 'accessories', name: 'Accessories', duration: 1 },
    { id: 'parquet', name: 'Parquet', duration: 1 },
    { id: 'woodwork', name: 'Woodwork', duration: 1 },
    { id: 'cleaning', name: 'Cleaning', duration: 1 },
    // Add other tasks here
  ];