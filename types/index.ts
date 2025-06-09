export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[];
  totalExpenses: number;
  balances: { [userId: string]: number };
  createdAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  date: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}