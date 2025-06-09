import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Mail, Phone, CreditCard as Edit3, DollarSign, Users, Receipt, Star } from 'lucide-react-native';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Mock user data
  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    joinDate: 'January 2024',
    totalGroups: 5,
    totalExpenses: 1250.50,
    totalTransactions: 23,
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            console.log('User logged out');
          }
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    showChevron: boolean = true
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (showChevron && (
        <ChevronRight size={20} color="#9ca3af" />
      ))}
    </TouchableOpacity>
  );

  const renderStatsCard = (icon: React.ReactNode, label: string, value: string | number) => (
    <View style={styles.statsCard}>
      <View style={styles.statsIcon}>
        {icon}
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Edit3 size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.joinDate}>Member since {userData.joinDate}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard(
              <Users size={20} color="#2563eb" />,
              'Groups',
              userData.totalGroups
            )}
            {renderStatsCard(
              <DollarSign size={20} color="#059669" />,
              'Total Expenses',
              `$${userData.totalExpenses.toFixed(2)}`
            )}
            {renderStatsCard(
              <Receipt size={20} color="#ea580c" />,
              'Transactions',
              userData.totalTransactions
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <Mail size={20} color="#6b7280" />,
              'Email',
              userData.email,
              () => console.log('Edit email')
            )}
            {renderSettingItem(
              <Phone size={20} color="#6b7280" />,
              'Phone',
              userData.phone,
              () => console.log('Edit phone')
            )}
            {renderSettingItem(
              <Shield size={20} color="#6b7280" />,
              'Privacy & Security',
              'Manage your account security',
              () => console.log('Privacy settings')
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <Bell size={20} color="#6b7280" />,
              'Notifications',
              'Push notifications for expenses',
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#f3f4f6', true: '#bfdbfe' }}
                thumbColor={notificationsEnabled ? '#2563eb' : '#9ca3af'}
              />,
              false
            )}
            {renderSettingItem(
              <Settings size={20} color="#6b7280" />,
              'App Settings',
              'Language, currency, and more',
              () => console.log('App settings')
            )}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <HelpCircle size={20} color="#6b7280" />,
              'Help & Support',
              'Get help with the app',
              () => console.log('Help')
            )}
            {renderSettingItem(
              <Star size={20} color="#6b7280" />,
              'Rate the App',
              'Share your feedback',
              () => console.log('Rate app')
            )}
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.settingsGroup}>
            {renderSettingItem(
              <LogOut size={20} color="#dc2626" />,
              'Logout',
              undefined,
              handleLogout,
              undefined,
              false
            )}
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
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
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});