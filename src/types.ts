export interface Task {
    id: string;
    name: string;
    duration: number;
    startDay: number;
  }
  
  export interface User {
    username: string;
    password: string;
    role: 'admin' | 'viewer';
  }