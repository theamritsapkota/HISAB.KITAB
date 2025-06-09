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
import { Users, DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react-native';
import { Group } from '@/types';
import { apiService } from '@/services/api';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setError(null);
      const fetchedGroups = await apiService.getGroups();
      setGroups(fetchedGroups);
    } catch (err) {
      setError('Failed to load groups. Please try again.');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const renderGroupCard = ({ item }: { item: Group }) => {
    const hasBalance = Object.values(item.balances).some(balance => balance !== 0);
    const userOwes = Object.values(item.balances).reduce((sum, balance) => sum + Math.max(0, -balance), 0);
    const userOwed = Object.values(item.balances).reduce((sum, balance) => sum + Math.max(0, balance), 0);

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => router.push(`/group/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupDescription}>{item.description}</Text>
          </View>
          <View style={styles.membersBadge}>
            <Users size={14} color="#6b7280" />
            <Text style={styles.membersCount}>{item.members.length}</Text>
          </View>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <DollarSign size={16} color="#059669" />
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>${item.totalExpenses.toFixed(2)}</Text>
          </View>

          {userOwes > 0 && (
            <View style={styles.statItem}>
              <TrendingDown size={16} color="#dc2626" />
              <Text style={styles.statLabel}>You owe</Text>
              <Text style={[styles.statValue, styles.negativeAmount]}>${userOwes.toFixed(2)}</Text>
            </View>
          )}

          {userOwed > 0 && (
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#059669" />
              <Text style={styles.statLabel}>You are owed</Text>
              <Text style={[styles.statValue, styles.positiveAmount]}>${userOwed.toFixed(2)}</Text>
            </View>
          )}
        </View>

        {hasBalance && (
          <View style={styles.balanceIndicator}>
            <View style={[styles.balanceDot, userOwes > userOwed ? styles.negativeBalance : styles.positiveBalance]} />
            <Text style={styles.balanceText}>
              {userOwes > userOwed ? 'You owe money' : userOwed > userOwes ? 'You are owed money' : 'All settled up'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Groups</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-group')}
          >
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Groups</Text>
          <Text style={styles.subtitle}>Manage your shared expenses</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-group')}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchGroups}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id}
        style={styles.groupsList}
        contentContainerStyle={styles.groupsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Users size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first group to start splitting expenses with friends
            </Text>
            <TouchableOpacity 
              style={styles.createFirstButton}
              onPress={() => router.push('/add-group')}
            >
              <Plus size={16} color="#2563eb" />
              <Text style={styles.createFirstText}>Create First Group</Text>
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  groupsList: {
    flex: 1,
  },
  groupsContent: {
    padding: 20,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  groupInfo: {
    flex: 1,
    marginRight: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membersCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  positiveAmount: {
    color: '#059669',
  },
  negativeAmount: {
    color: '#dc2626',
  },
  balanceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  balanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  positiveBalance: {
    backgroundColor: '#059669',
  },
  negativeBalance: {
    backgroundColor: '#dc2626',
  },
  balanceText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
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
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  createFirstText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
});