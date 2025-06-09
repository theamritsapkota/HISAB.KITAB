import axios from 'axios';
import { Group, Expense, User, ApiResponse } from '@/types';

// Mock data for development
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Trip to Bali',
    description: 'Vacation expenses for our Bali trip',
    members: ['Alice', 'Bob', 'Charlie'],
    totalExpenses: 1250.50,
    balances: { 'Alice': -150.25, 'Bob': 75.50, 'Charlie': 74.75 },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Roommate Expenses',
    description: 'Shared apartment costs',
    members: ['David', 'Emma', 'Frank'],
    totalExpenses: 2350.00,
    balances: { 'David': 100.00, 'Emma': -200.00, 'Frank': 100.00 },
    createdAt: '2024-01-10T08:30:00Z'
  },
  {
    id: '3',
    name: 'Office Lunch',
    description: 'Team lunch expenses',
    members: ['Grace', 'Henry', 'Ivy', 'Jack'],
    totalExpenses: 185.75,
    balances: { 'Grace': -25.50, 'Henry': 15.25, 'Ivy': 5.25, 'Jack': 5.00 },
    createdAt: '2024-01-20T12:15:00Z'
  }
];

const mockExpenses: { [groupId: string]: Expense[] } = {
  '1': [
    {
      id: '1',
      groupId: '1',
      description: 'Hotel booking',
      amount: 600.00,
      paidBy: 'Alice',
      participants: ['Alice', 'Bob', 'Charlie'],
      date: '2024-01-15',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      groupId: '1',
      description: 'Flight tickets',
      amount: 450.50,
      paidBy: 'Bob',
      participants: ['Alice', 'Bob', 'Charlie'],
      date: '2024-01-16',
      createdAt: '2024-01-16T14:30:00Z'
    },
    {
      id: '3',
      groupId: '1',
      description: 'Dinner at restaurant',
      amount: 200.00,
      paidBy: 'Charlie',
      participants: ['Alice', 'Bob', 'Charlie'],
      date: '2024-01-17',
      createdAt: '2024-01-17T19:45:00Z'
    }
  ],
  '2': [
    {
      id: '4',
      groupId: '2',
      description: 'Rent payment',
      amount: 1800.00,
      paidBy: 'David',
      participants: ['David', 'Emma', 'Frank'],
      date: '2024-01-01',
      createdAt: '2024-01-01T09:00:00Z'
    },
    {
      id: '5',
      groupId: '2',
      description: 'Utilities',
      amount: 350.00,
      paidBy: 'Emma',
      participants: ['David', 'Emma', 'Frank'],
      date: '2024-01-05',
      createdAt: '2024-01-05T16:20:00Z'
    },
    {
      id: '6',
      groupId: '2',
      description: 'Groceries',
      amount: 200.00,
      paidBy: 'Frank',
      participants: ['David', 'Emma', 'Frank'],
      date: '2024-01-10',
      createdAt: '2024-01-10T11:30:00Z'
    }
  ],
  '3': [
    {
      id: '7',
      groupId: '3',
      description: 'Pizza lunch',
      amount: 125.75,
      paidBy: 'Grace',
      participants: ['Grace', 'Henry', 'Ivy', 'Jack'],
      date: '2024-01-20',
      createdAt: '2024-01-20T12:15:00Z'
    },
    {
      id: '8',
      groupId: '3',
      description: 'Coffee and desserts',
      amount: 60.00,
      paidBy: 'Henry',
      participants: ['Grace', 'Henry', 'Ivy', 'Jack'],
      date: '2024-01-20',
      createdAt: '2024-01-20T15:45:00Z'
    }
  ]
};

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const USE_MOCK_DATA = true; // Set to false when backend is available

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service Functions
export const apiService = {
  // Groups
  async getGroups(): Promise<Group[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockGroups), 800);
      });
    }

    try {
      const response = await api.get<ApiResponse<Group[]>>('/groups');
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return mockGroups;
    }
  },

  async getGroup(id: string): Promise<Group | null> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const group = mockGroups.find(g => g.id === id);
          resolve(group || null);
        }, 600);
      });
    }

    try {
      const response = await api.get<ApiResponse<Group>>(`/group/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      const group = mockGroups.find(g => g.id === id);
      return group || null;
    }
  },

  async createGroup(group: Omit<Group, 'id' | 'createdAt' | 'totalExpenses' | 'balances'>): Promise<Group> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newGroup: Group = {
            ...group,
            id: Date.now().toString(),
            totalExpenses: 0,
            balances: {},
            createdAt: new Date().toISOString(),
          };
          mockGroups.unshift(newGroup);
          resolve(newGroup);
        }, 500);
      });
    }

    try {
      const response = await api.post<ApiResponse<Group>>('/group', group);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock behavior:', error);
      const newGroup: Group = {
        ...group,
        id: Date.now().toString(),
        totalExpenses: 0,
        balances: {},
        createdAt: new Date().toISOString(),
      };
      mockGroups.unshift(newGroup);
      return newGroup;
    }
  },

  // Expenses
  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const expenses = mockExpenses[groupId] || [];
          resolve(expenses);
        }, 600);
      });
    }

    try {
      const response = await api.get<ApiResponse<Expense[]>>(`/group/${groupId}/expenses`);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      return mockExpenses[groupId] || [];
    }
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newExpense: Expense = {
            ...expense,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          
          if (!mockExpenses[expense.groupId]) {
            mockExpenses[expense.groupId] = [];
          }
          mockExpenses[expense.groupId].unshift(newExpense);
          
          // Update group totals
          const group = mockGroups.find(g => g.id === expense.groupId);
          if (group) {
            group.totalExpenses += expense.amount;
          }
          
          resolve(newExpense);
        }, 500);
      });
    }

    try {
      const response = await api.post<ApiResponse<Expense>>('/expense', expense);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock behavior:', error);
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      if (!mockExpenses[expense.groupId]) {
        mockExpenses[expense.groupId] = [];
      }
      mockExpenses[expense.groupId].unshift(newExpense);
      
      // Update group totals
      const group = mockGroups.find(g => g.id === expense.groupId);
      if (group) {
        group.totalExpenses += expense.amount;
      }
      
      return newExpense;
    }
  },
};