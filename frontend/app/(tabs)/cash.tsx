import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useStore } from '../../src/store/useStore';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import Input from '../../src/components/Input';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Cash() {
  const { currentCashRegister, setCurrentCashRegister } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentCash();
  }, []);

  const loadCurrentCash = async () => {
    try {
      const response = await api.get('/cash-register/current');
      setCurrentCashRegister(response.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Alert.alert('Erro', 'Falha ao carregar caixa');
      }
      setCurrentCashRegister(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCurrentCash();
    setRefreshing(false);
  };

  const handleOpenCash = async () => {
    if (!openingBalance) {
      Alert.alert('Erro', 'Informe o saldo inicial');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/cash-register/open', {
        opening_balance: parseFloat(openingBalance),
      });
      setCurrentCashRegister(response.data);
      setOpenModalVisible(false);
      setOpeningBalance('');
      Alert.alert('Sucesso', 'Caixa aberto!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao abrir caixa');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!closingBalance) {
      Alert.alert('Erro', 'Informe o saldo final');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cash-register/close', {
        closing_balance: parseFloat(closingBalance),
      });
      setCurrentCashRegister(null);
      setCloseModalVisible(false);
      setClosingBalance('');
      Alert.alert('Sucesso', 'Caixa fechado!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fechar caixa');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue =
    (currentCashRegister?.total_services || 0) +
    (currentCashRegister?.total_products || 0);
  const expectedBalance =
    (currentCashRegister?.opening_balance || 0) + totalRevenue;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {!currentCashRegister ? (
        <View style={styles.closedCash}>
          <Card style={styles.closedCard}>
            <Ionicons name="lock-closed" size={64} color="#999" />
            <Text style={styles.closedTitle}>Caixa Fechado</Text>
            <Text style={styles.closedText}>
              Abra o caixa para começar a trabalhar
            </Text>
            <Button
              title="Abrir Caixa"
              onPress={() => setOpenModalVisible(true)}
              style={styles.openButton}
            />
          </Card>
        </View>
      ) : (
        <>
          <Card>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Caixa Aberto</Text>
            </View>
            <Text style={styles.openedTime}>
              Aberto em{' '}
              {format(
                new Date(currentCashRegister.opened_at),
                "dd/MM/yyyy 'às' HH:mm",
                { locale: ptBR }
              )}
            </Text>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Movimentações</Text>
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Saldo Inicial</Text>
              <Text style={styles.balanceValue}>
                R$ {currentCashRegister.opening_balance.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Serviços</Text>
              <Text style={[styles.balanceValue, styles.positive]}>
                + R$ {currentCashRegister.total_services.toFixed(2)}
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Produtos</Text>
              <Text style={[styles.balanceValue, styles.positive]}>
                + R$ {currentCashRegister.total_products.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, styles.totalLabel]}>
                Saldo Esperado
              </Text>
              <Text style={[styles.balanceValue, styles.totalValue]}>
                R$ {expectedBalance.toFixed(2)}
              </Text>
            </View>
          </Card>

          <Button
            title="Fechar Caixa"
            variant="danger"
            onPress={() => setCloseModalVisible(true)}
          />
        </>
      )}

      {/* Open Cash Modal */}
      <Modal
        visible={openModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Abrir Caixa</Text>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Informe o saldo inicial em dinheiro no caixa:
            </Text>
            <Input
              label="Saldo Inicial (R$)"
              value={openingBalance}
              onChangeText={setOpeningBalance}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <Button
              title="Abrir Caixa"
              onPress={handleOpenCash}
              loading={loading}
            />
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setOpenModalVisible(false)}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Close Cash Modal */}
      <Modal
        visible={closeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Fechar Caixa</Text>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Saldo esperado: R$ {expectedBalance.toFixed(2)}
            </Text>
            <Text style={styles.modalSubtext}>
              Informe o saldo real em dinheiro:
            </Text>
            <Input
              label="Saldo Final (R$)"
              value={closingBalance}
              onChangeText={setClosingBalance}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <Button
              title="Fechar Caixa"
              variant="danger"
              onPress={handleCloseCash}
              loading={loading}
            />
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => setCloseModalVisible(false)}
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  closedCash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  closedCard: {
    alignItems: 'center',
    padding: 32,
  },
  closedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  closedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  openButton: {
    minWidth: 200,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  openedTime: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  positive: {
    color: '#34C759',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  modal: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalContent: {
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cancelButton: {
    marginTop: 12,
  },
});
