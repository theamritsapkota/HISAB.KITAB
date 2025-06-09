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
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, DollarSign, Calendar, User } from 'lucide-react-native';
import { Group, Expense } from '@/types';
import { apiService } from '@/services/api';

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupData = async () => {
    if (!id) return;

    try {
      setError(null);
      const [groupData, expenseData] = await Promise.all([
        apiService.getGroup(id),
        apiService.getGroupExpenses(id),
      ]);
      
      setGroup(groupData);
      setExpenses(expenseData);
    } catch (err) {
      setError('Failed to load group data. Please try again.');
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroupData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderExpenseCard = ({ item }: { item: Expense }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseDescription}>{item.description}</Text>
          <View style={styles.expenseDetails}>
            <View style={styles.detailItem}>
              <User size={12} color="#6b7280" />
              <Text style={styles.detailText}>Paid by {item.paidBy}</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={12} color="#6b7280" />
              <Text style={styles.detailText}>{formatDate(item.date)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          <Text style={styles.participants}>
            Split {item.participants.length} ways
          </Text>
        </View>
      </View>
      
      {item.participants.length > 0 && (
        <View style={styles.participantsContainer}>
          <Text style={styles.participantsLabel}>Participants:</Text>
          <Text style={styles.participantsList}>
            {item.participants.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderBalanceCard = () => {
    if (!group || Object.keys(group.balances).length === 0) return null;

    return (
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Balances</Text>
        {Object.entries(group.balances).map(([member, balance]) => (
          <View key={member} style={styles.balanceRow}>
            <Text style={styles.memberName}>{member}</Text>
            <Text style={[
              styles.balanceAmount,
              balance > 0 ? styles.positiveBalance : balance < 0 ? styles.negativeBalance : styles.neutralBalance
            ]}>
              {balance > 0 ? `+$${balance.toFixed(2)}` : balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : '$0.00'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading group data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Group not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchGroupData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.subtitle}>{group.description}</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <DollarSign size={20} color="#059669" />
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryValue}>${group.totalExpenses.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <User size={20} color="#2563eb" />
            <Text style={styles.summaryLabel}>Members</Text>
            <Text style={styles.summaryValue}>{group.members.length}</Text>
          </View>
        </View>
      </View>

      {renderBalanceCard()}

      <View style={styles.expensesHeader}>
        <Text style={styles.expensesTitle}>Expenses</Text>
        <TouchableOpacity
          style={styles.addExpenseButton}
          onPress={() => router.push(`/add-expense/${id}`)}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addExpenseText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseCard}
        keyExtractor={(item) => item.id}
        style={styles.expensesList}
        contentContainerStyle={styles.expensesContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <DollarSign size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyDescription}>
              Add your first expense to start tracking shared costs
            </Text>
            <TouchableOpacity
              style={styles.addFirstExpenseButton}
              onPress={() => router.push(`/add-expense/${id}`)}
            >
              <Plus size={16} color="#2563eb" />
              <Text style={styles.addFirstExpenseText}>Add First Expense</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    color: '#374151',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveBalance: {
    color: '#059669',
  },
  negativeBalance: {
    color: '#dc2626',
  },
  neutralBalance: {
    color: '#6b7280',
  },
  expensesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  expensesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addExpenseText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  expensesList: {
    flex: 1,
  },
  expensesContent: {
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  expenseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  participants: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  participantsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  participantsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  participantsList: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
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
  addFirstExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addFirstExpenseText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});