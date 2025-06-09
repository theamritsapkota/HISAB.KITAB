import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react-native';
import { Group, Expense } from '@/types';
import { apiService } from '@/services/api';

export default function HomeScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const groupsData = await apiService.getGroups();
      setGroups(groupsData);
      
      // Get recent expenses from all groups
      const allExpenses: Expense[] = [];
      for (const group of groupsData.slice(0, 3)) { // Limit to first 3 groups for performance
        const expenses = await apiService.getGroupExpenses(group.id);
        allExpenses.push(...expenses);
      }
      
      // Sort by date and take the 5 most recent
      const sortedExpenses = allExpenses
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      setRecentExpenses(sortedExpenses);
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

  const totalBalance = groups.reduce((sum, group) => {
    const userBalance = Object.values(group.balances).reduce((total, balance) => total + balance, 0);
    return sum + userBalance;
  }, 0);

  const totalOwed = groups.reduce((sum, group) => {
    const owed = Object.values(group.balances).reduce((total, balance) => total + Math.max(0, balance), 0);
    return sum + owed;
  }, 0);

  const totalOwing = groups.reduce((sum, group) => {
    const owing = Object.values(group.balances).reduce((total, balance) => total + Math.max(0, -balance), 0);
    return sum + owing;
  }, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Here's your expense overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-expense-quick')}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <DollarSign size={24} color="#2563eb" />
              <Text style={styles.balanceTitle}>Net Balance</Text>
            </View>
            <Text style={[
              styles.balanceAmount,
              totalBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              {totalBalance >= 0 ? '+' : ''}${totalBalance.toFixed(2)}
            </Text>
            <Text style={styles.balanceSubtext}>
              {totalBalance >= 0 ? 'You are owed overall' : 'You owe overall'}
            </Text>
          </View>

          <View style={styles.balanceRow}>
            <View style={[styles.balanceCard, styles.smallCard]}>
              <View style={styles.balanceHeader}>
                <ArrowUpRight size={20} color="#059669" />
                <Text style={styles.smallCardTitle}>You're Owed</Text>
              </View>
              <Text style={[styles.balanceAmount, styles.positiveBalance, styles.smallAmount]}>
                ${totalOwed.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.balanceCard, styles.smallCard]}>
              <View style={styles.balanceHeader}>
                <ArrowDownRight size={20} color="#dc2626" />
                <Text style={styles.smallCardTitle}>You Owe</Text>
              </View>
              <Text style={[styles.balanceAmount, styles.negativeBalance, styles.smallAmount]}>
                ${totalOwing.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/groups')}
            >
              <Users size={24} color="#2563eb" />
              <Text style={styles.actionTitle}>View Groups</Text>
              <Text style={styles.actionSubtitle}>{groups.length} active groups</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/add-group')}
            >
              <Plus size={24} color="#059669" />
              <Text style={styles.actionTitle}>New Group</Text>
              <Text style={styles.actionSubtitle}>Start splitting expenses</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentExpenses.length > 0 ? (
            <View style={styles.activityList}>
              {recentExpenses.map((expense) => {
                const group = groups.find(g => g.id === expense.groupId);
                return (
                  <View key={expense.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <DollarSign size={16} color="#6b7280" />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{expense.description}</Text>
                      <Text style={styles.activitySubtitle}>
                        {group?.name} • Paid by {expense.paidBy}
                      </Text>
                    </View>
                    <View style={styles.activityRight}>
                      <Text style={styles.activityAmount}>${expense.amount.toFixed(2)}</Text>
                      <Text style={styles.activityDate}>{formatDate(expense.createdAt)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No recent activity</Text>
              <Text style={styles.emptySubtitle}>Start adding expenses to see them here</Text>
            </View>
          )}
        </View>

        {/* Active Groups Preview */}
        {groups.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Groups</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/groups')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupsScroll}>
              {groups.slice(0, 5).map((group) => {
                const userBalance = Object.values(group.balances).reduce((sum, balance) => sum + balance, 0);
                return (
                  <TouchableOpacity
                    key={group.id}
                    style={styles.groupPreviewCard}
                    onPress={() => router.push(`/group/${group.id}`)}
                  >
                    <View style={styles.groupPreviewHeader}>
                      <Text style={styles.groupPreviewName}>{group.name}</Text>
                      <View style={styles.membersBadge}>
                        <Users size={12} color="#6b7280" />
                        <Text style={styles.membersCount}>{group.members.length}</Text>
                      </View>
                    </View>
                    <Text style={styles.groupPreviewTotal}>${group.totalExpenses.toFixed(2)}</Text>
                    <Text style={[
                      styles.groupPreviewBalance,
                      userBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
                    ]}>
                      {userBalance >= 0 ? '+' : ''}${userBalance.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-expense-quick')}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceSection: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  positiveBalance: {
    color: '#059669',
  },
  negativeBalance: {
    color: '#dc2626',
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    marginBottom: 0,
  },
  smallCardTitle: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  smallAmount: {
    fontSize: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  groupsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  groupPreviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  groupPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  membersCount: {
    marginLeft: 2,
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  groupPreviewTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  groupPreviewBalance: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});