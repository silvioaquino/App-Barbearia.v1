import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useStore } from '../../src/store/useStore';
import Card from '../../src/components/Card';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../../src/services/notifications';

export default function Dashboard() {
  const { user } = useAuth();
  const { appointments, services, currentCashRegister, setAppointments, setServices, setCurrentCashRegister } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalServices: 0,
  });

  useEffect(() => {
    loadData();
    setupPushNotifications();

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
        // Refresh data when notification is received
        loadData();
      },
      (response) => {
        console.log('Notification clicked:', response);
        // Navigate to appointments if needed
      }
    );

    return cleanup;
  }, []);

  const setupPushNotifications = async () => {
    try {
      await registerForPushNotificationsAsync();
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const loadData = async () => {
    try {
      const [appointmentsRes, servicesRes, cashRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/services'),
        api.get('/cash-register/current').catch(() => ({ data: null })),
      ]);

      setAppointments(appointmentsRes.data);
      setServices(servicesRes.data);
      setCurrentCashRegister(cashRes.data);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsRes.data.filter((a: any) => 
        a.scheduled_time.startsWith(today)
      ).length;
      const pending = appointmentsRes.data.filter((a: any) => 
        a.status === 'pending'
      ).length;

      setStats({
        todayAppointments: todayAppts,
        pendingAppointments: pending,
        totalServices: servicesRes.data.length,
      });
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Alert.alert('Erro', 'Falha ao carregar dados');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcome}>
        <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
        <Text style={styles.welcomeSubtext}>
          {currentCashRegister ? 'Caixa aberto' : 'Caixa fechado'}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="calendar"
          title="Hoje"
          value={stats.todayAppointments}
          color="#007AFF"
        />
        <StatCard
          icon="time"
          title="Pendentes"
          value={stats.pendingAppointments}
          color="#FF9500"
        />
        <StatCard
          icon="cut"
          title="Serviços"
          value={stats.totalServices}
          color="#34C759"
        />
      </View>

      {!currentCashRegister && (
        <Card style={styles.warningCard}>
          <View style={styles.warning}>
            <Ionicons name="warning" size={24} color="#FF9500" />
            <Text style={styles.warningText}>
              Abra o caixa para começar a trabalhar
            </Text>
          </View>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Agendamentos Recentes</Text>
        {appointments.slice(0, 5).length === 0 ? (
          <Text style={styles.emptyText}>Nenhum agendamento</Text>
        ) : (
          appointments.slice(0, 5).map((apt: any) => (
            <View key={apt.id} style={styles.appointmentItem}>
              <View>
                <Text style={styles.appointmentTime}>
                  {new Date(apt.scheduled_time).toLocaleString('pt-BR')}
                </Text>
                <Text style={styles.appointmentStatus}>
                  Status: {apt.status}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function StatCard({ icon, title, value, color }: any) {
  return (
    <Card style={styles.statCard}>
      <Ionicons name={icon} size={32} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  welcome: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  appointmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentStatus: {
    fontSize: 12,
    color: '#666',
  },
});
