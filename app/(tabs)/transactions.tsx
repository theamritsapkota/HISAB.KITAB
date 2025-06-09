import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Receipt, 
  DollarSign, 
  Calendar, 
  User, 
  Filter,
  Search,
  Plus
} from 'lucide-react-native';
import { Group, Expense } from '@/types';
import { apiService } from '@/services/api';

export default function TransactionsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');

  const fetchData = async () => {
    try {
      const groupsData = await apiService.getGroups();
      setGroups(groupsData);
      
      // Get all expenses from all groups
      const allExpensesData: Expense[] = [];
      for (const group of groupsData) {
        const expenses = await apiService.getGroupExpenses(group.id);
        allExpensesData.push(...expenses);
      }
      
      // Sort by date (newest first)
      const sortedExpenses = allExpensesData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAllExpenses(sortedExpenses);
      setFilteredExpenses(sortedExpenses);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [selectedFilter, allExpenses]);

  const filterExpenses = () => {
    const now = new Date();
    let filtered = [...allExpenses];

    if (selectedFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = allExpenses.filter(expense => new Date(expense.createdAt) >= weekAgo);
    } else if (selectedFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = allExpenses.filter(expense => new Date(expense.createdAt) >= monthAgo);
    }

    setFilteredExpenses(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  };

  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const renderExpenseCard = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => router.push(`/group/${item.groupId}`)}
      activeOpacity={0.7}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseIcon}>
          <DollarSign size={20} color="#2563eb" />
        </View>
        <View style={styles.expenseContent}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <View style={styles.expenseDetails}>
            <View style={styles.detailItem}>
              <User size={12} color="#6b7280" />
              <Text style={styles.detailText}>Paid by {item.paidBy}</Text>
            </View>
            <View style={styles.detailItem}>
              <Receipt size={12} color="#6b7280" />
              <Text style={styles.detailText}>{getGroupName(item.groupId)}</Text>
            </View>
          </View>
          <View style={styles.participantsRow}>
            <Text style={styles.participantsLabel}>
              Split between {item.participants.length} people
            </Text>
          </View>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
          <Text style={styles.expenseDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.expenseTime}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: 'all' | 'week' | 'month', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>All your expense history</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-expense-quick')}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>${getTotalAmount().toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>
            {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
            {selectedFilter !== 'all' && ` in the last ${selectedFilter}`}
          </Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          {renderFilterButton('all', 'All Time')}
          {renderFilterButton('week', 'This Week')}
          {renderFilterButton('month', 'This Month')}
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseCard}
        keyExtractor={(item) => item.id}
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Receipt size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptyDescription}>
              {selectedFilter === 'all' 
                ? 'Start adding expenses to see them here'
                : `No transactions found for the selected time period`
              }
            </Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={() => router.push('/add-expense-quick')}
            >
              <Plus size={16} color="#2563eb" />
              <Text style={styles.addFirstText}>Add First Expense</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterButtonText: {
    color: '#2563eb',
  },
  transactionsList: {
    flex: 1,
  },
  transactionsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseContent: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  expenseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 2,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  participantsRow: {
    marginTop: 2,
  },
  participantsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 1,
  },
  expenseTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addFirstText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});