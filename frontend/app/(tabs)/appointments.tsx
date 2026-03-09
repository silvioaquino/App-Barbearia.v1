import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useStore } from '../../src/store/useStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Appointments() {
  const { appointments, setAppointments } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar agendamentos');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.post(`/appointments/${id}/confirm`);
      if (Platform.OS === 'web') alert('Agendamento confirmado!');
      else Alert.alert('Sucesso', 'Agendamento confirmado!');
      await loadAppointments();
    } catch (error) {
      if (Platform.OS === 'web') alert('Falha ao confirmar agendamento');
      else Alert.alert('Erro', 'Falha ao confirmar agendamento');
    }
  };

  const handleCancel = async (id: number) => {
    const doCancel = async () => {
      try {
        await api.post(`/appointments/${id}/cancel`);
        if (Platform.OS === 'web') alert('Agendamento cancelado');
        else Alert.alert('Sucesso', 'Agendamento cancelado');
        await loadAppointments();
      } catch (error) {
        if (Platform.OS === 'web') alert('Falha ao cancelar agendamento');
        else Alert.alert('Erro', 'Falha ao cancelar agendamento');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
        doCancel();
      }
    } else {
      Alert.alert('Cancelar Agendamento', 'Tem certeza que deseja cancelar este agendamento?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', style: 'destructive', onPress: doCancel },
      ]);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.post(`/appointments/${id}/complete`);
      if (Platform.OS === 'web') alert('Agendamento concluído!');
      else Alert.alert('Sucesso', 'Agendamento concluído!');
      await loadAppointments();
    } catch (error) {
      if (Platform.OS === 'web') alert('Falha ao completar agendamento');
      else Alert.alert('Erro', 'Falha ao completar agendamento');
    }
  };

  const getFilteredAppointments = () => {
    if (filter === 'all') return appointments;
    return appointments.filter((a: any) => a.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      case 'completed':
        return '#007AFF';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <FilterButton
          title="Todos"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterButton
          title="Pendentes"
          active={filter === 'pending'}
          onPress={() => setFilter('pending')}
        />
        <FilterButton
          title="Confirmado"
          active={filter === 'confirmed'}
          onPress={() => setFilter('confirmed')}
        />
        <FilterButton
          title="Concluídos"
          active={filter === 'completed'}
          onPress={() => setFilter('completed')}
        />
      </View>

      <FlatList
        data={getFilteredAppointments()}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum agendamento</Text>
          </View>
        }
        renderItem={({ item }: any) => (
          <Card>
            <View style={styles.appointmentHeader}>
              <View>
                <Text style={styles.appointmentDate}>
                  {format(new Date(item.scheduled_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Text>
                <Text style={styles.appointmentTime}>
                  {format(new Date(item.scheduled_time), 'HH:mm')}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>

            {(item.client_name || item.client_phone) && (
              <View style={styles.clientInfo}>
                {item.client_name && (
                  <View style={styles.clientRow}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.clientText}>{item.client_name}</Text>
                  </View>
                )}
                {item.client_phone && (
                  <View style={styles.clientRow}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.clientText}>{item.client_phone}</Text>
                  </View>
                )}
              </View>
            )}

            {(item.service_name || item.service_price) && (
              <View style={styles.serviceInfo}>
                <Ionicons name="cut-outline" size={16} color="#f78504" />
                <Text style={styles.serviceName}>{item.service_name || 'Serviço'}</Text>
                {item.service_price != null && (
                  <Text style={styles.servicePrice}>
                    R$ {Number(item.service_price).toFixed(2).replace('.', ',')}
                  </Text>
                )}
              </View>
            )}

            {item.notes && (
              <Text style={styles.notes}>Observações: {item.notes}</Text>
            )}

            {item.status === 'pending' && (
              <View style={styles.actions}>
                <Button
                  title="Confirmar"
                  variant="success"
                  onPress={() => handleConfirm(item.id)}
                  style={styles.actionButton}
                />
                <Button
                  title="Cancelar"
                  variant="danger"
                  onPress={() => handleCancel(item.id)}
                  style={styles.actionButton}
                />
              </View>
            )}

            {item.status === 'confirmed' && (
              <View style={styles.actions}>
                <Button
                  title="Concluir"
                  variant="primary"
                  onPress={() => handleComplete(item.id)}
                />
              </View>
            )}
          </Card>
        )}
      />
    </View>
  );
}

function FilterButton({ title, active, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1818',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1a1818',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 1,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#f78504',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFF',
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f78504',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  clientInfo: {
    marginBottom: 12,
    gap: 6,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#F0F7FF',
    padding: 10,
    borderRadius: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f78504',
    flex: 1,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34C759',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
});
