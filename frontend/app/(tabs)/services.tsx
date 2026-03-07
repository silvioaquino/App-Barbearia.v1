import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  Switch,
} from 'react-native';
import { useStore } from '../../src/store/useStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function Services() {
  const { services, setServices } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/services?active_only=false');
      setServices(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar serviços');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '30',
    });
    setModalVisible(true);
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.duration_minutes) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, data);
        Alert.alert('Sucesso', 'Serviço atualizado!');
      } else {
        await api.post('/services/', data);
        Alert.alert('Sucesso', 'Serviço criado!');
      }

      setModalVisible(false);
      await loadServices();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao salvar serviço');
    }
  };

  const handleToggleActive = async (service: any) => {
    try {
      await api.put(`/services/${service.id}/toggle-active`);
      await loadServices();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar serviço');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Button
            title="Adicionar Serviço"
            onPress={handleAdd}
            style={styles.addButton}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cut-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum serviço cadastrado</Text>
          </View>
        }
        renderItem={({ item }: any) => (
          <Card>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.serviceDescription}>
                    {item.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleToggleActive(item)}
                style={[
                  styles.statusDot,
                  { backgroundColor: item.is_active ? '#34C759' : '#999' },
                ]}
              />
            </View>

            <View style={styles.serviceDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  R$ {item.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {item.duration_minutes} min
                </Text>
              </View>
            </View>

            <Button
              title="Editar"
              variant="secondary"
              onPress={() => handleEdit(item)}
              style={styles.editButton}
            />
          </Card>
        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Nome *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Corte de cabelo"
            />

            <Input
              label="Descrição"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Descrição do serviço"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Preço *"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />

            <Input
              label="Duração (minutos) *"
              value={formData.duration_minutes}
              onChangeText={(text) =>
                setFormData({ ...formData, duration_minutes: text })
              }
              placeholder="30"
              keyboardType="number-pad"
            />

            <Button title="Salvar" onPress={handleSave} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
  },
  addButton: {
    marginBottom: 16,
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    marginTop: 8,
  },
  modal: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
});
