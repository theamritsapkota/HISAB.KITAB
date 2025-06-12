import axios from 'axios';
import { Group, Expense, User, ApiResponse } from '@/types';

// API Configuration - Updated to match the backend port
const API_BASE_URL  = 'http://192.168.1.85:5051';

const USE_MOCK_DATA = false; 

// Mock data for development (keeping existing mock data for fallback)
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
  ]
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token storage (in a real app, use secure storage)
let authToken: string | null = null;

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    console.error('API Error Status:', error.response?.status);
    console.error('API Error URL:', error.config?.url);
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      authToken = null;
      // In a real app, redirect to login
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: '1',
            name: 'Demo User',
            email: email,
          };
          const mockToken = 'mock_jwt_token_' + Date.now();
          authToken = mockToken;
          resolve({ token: mockToken, user: mockUser });
        }, 1000);
      });
    }

    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/users/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      authToken = token;
      return { token, user };
    } catch (error) {
      console.error('Login API call failed:', error);
      if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object') {
        throw new Error((error as any).response?.data?.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
          };
          const mockToken = 'mock_jwt_token_' + Date.now();
          authToken = mockToken;
          resolve({ token: mockToken, user: mockUser });
        }, 1000);
      });
    }

    try {
      console.log('Attempting registration with:', { name, email });
      const response = await api.post('/users/register', { name, email, password });
      console.log('Registration response:', response.data);
      
      const { token, user } = response.data;
      authToken = token;
      return { token, user };
    } catch (error) {
      console.error('Registration API call failed:', error);
      if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object') {
        throw new Error((error as any).response?.data?.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  },

  // Set auth token (for when user logs in)
  setAuthToken(token: string) {
    authToken = token;
    console.log('Auth token set');
  },

  // Clear auth token (for logout)
  clearAuthToken() {
    authToken = null;
    console.log('Auth token cleared');
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockGroups), 800);
      });
    }

    try {
      console.log('Fetching groups...');
      const response = await api.get('/groups');
      console.log('Groups response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Groups API call failed, using mock data:', error);
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
      console.log('Fetching group:', id);
      const response = await api.get(`/groups/${id}`);
      console.log('Group response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Group API call failed, using mock data:', error);
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
      console.log('Creating group:', group);
      const response = await api.post('/groups', group);
      console.log('Create group response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create group API call failed:', error);
      if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object') {
        throw new Error((error as any).response?.data?.message || 'Failed to create group');
      }
      throw new Error('Failed to create group');
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
      console.log('Fetching expenses for group:', groupId);
      const response = await api.get(`/expenses/group/${groupId}`);
      console.log('Expenses response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.warn('Expenses API call failed, using mock data:', error);
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
          
          resolve(newExpense);
        }, 500);
      });
    }

    try {
      console.log('Creating expense:', expense);
      const response = await api.post('/expenses', expense);
      console.log('Create expense response:', response.data);
      
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create expense API call failed:', error);
      if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object') {
        throw new Error((error as any).response?.data?.message || 'Failed to create expense');
      }
      throw new Error('Failed to create expense');
    }
  },
};