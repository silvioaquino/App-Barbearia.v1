import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Alert, FlatList, RefreshControl, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function Loyalty() {
  const [config, setConfig] = useState({ points_per_real: 1, redemption_threshold: 100, reward_description: '1 Corte Grátis', is_active: true });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(null);
  const [history, setHistory] = useState([]);
  const [addForm, setAddForm] = useState({ client_phone: '', client_name: '', points: '' });
  const [configForm, setConfigForm] = useState({ ...config });

  const loadData = useCallback(async () => {
    try {
      const [configRes, clientsRes] = await Promise.all([
        api.get('/loyalty/config'),
        api.get('/loyalty/clients'),
      ]);
      setConfig(configRes.data);
      setConfigForm(configRes.data);
      setClients(clientsRes.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const saveConfig = async () => {
    try {
      await api.put('/loyalty/config', configForm);
      setConfig(configForm);
      setShowConfig(false);
      Alert.alert('Sucesso', 'Configuração salva');
    } catch (e) { Alert.alert('Erro', 'Falha ao salvar'); }
  };

  const addPoints = async () => {
    if (!addForm.client_phone || !addForm.points) { Alert.alert('Erro', 'Preencha telefone e pontos'); return; }
    try {
      await api.post('/loyalty/add-points', {
        client_phone: addForm.client_phone,
        client_name: addForm.client_name || null,
        points: parseInt(addForm.points),
        description: 'Pontos manuais',
      });
      setShowAdd(false);
      setAddForm({ client_phone: '', client_name: '', points: '' });
      loadData();
      Alert.alert('Sucesso', `${addForm.points} pontos adicionados`);
    } catch (e) { Alert.alert('Erro', 'Falha ao adicionar pontos'); }
  };

  const redeemPoints = async (phone) => {
    Alert.alert('Resgatar', `Resgatar ${config.redemption_threshold} pontos por "${config.reward_description}"?`, [
      { text: 'Cancelar' },
      { text: 'Resgatar', onPress: async () => {
        try {
          const res = await api.post('/loyalty/redeem', { client_phone: phone });
          Alert.alert('Sucesso', res.data.message);
          loadData();
        } catch (e) { Alert.alert('Erro', e.response?.data?.detail || 'Falha ao resgatar'); }
      }},
    ]);
  };

  const loadHistory = async (phone) => {
    try {
      const res = await api.get(`/loyalty/client/${phone}/history`);
      setHistory(res.data);
      setShowHistory(phone);
    } catch (e) { Alert.alert('Erro', 'Falha ao carregar histórico'); }
  };

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        <View style={s.header}>
          <Text style={s.title}>Programa de Fidelidade</Text>
          <TouchableOpacity onPress={() => setShowConfig(true)} data-testid="loyalty-config-btn">
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={s.configCard}>
          <View style={s.configRow}>
            <Text style={s.configLabel}>R$1 =</Text>
            <Text style={s.configValue}>{config.points_per_real} ponto(s)</Text>
          </View>
          <View style={s.configRow}>
            <Text style={s.configLabel}>Meta:</Text>
            <Text style={s.configValue}>{config.redemption_threshold} pts</Text>
          </View>
          <View style={s.configRow}>
            <Text style={s.configLabel}>Prêmio:</Text>
            <Text style={s.configValue}>{config.reward_description}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: config.is_active ? '#34C759' : '#FF3B30' }]}>
            <Text style={s.statusText}>{config.is_active ? 'Ativo' : 'Inativo'}</Text>
          </View>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Clientes ({clients.length})</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)} data-testid="add-points-btn">
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={s.addBtnText}>Adicionar Pontos</Text>
          </TouchableOpacity>
        </View>

        {clients.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="star-outline" size={48} color="#CCC" />
            <Text style={s.emptyText}>Nenhum cliente com pontos ainda</Text>
            <Text style={s.emptySubtext}>Pontos são concedidos automaticamente ao concluir serviços</Text>
          </View>
        ) : (
          clients.map((c) => (
            <View key={c.id} style={s.clientCard}>
              <View style={s.clientTop}>
                <View>
                  <Text style={s.clientName}>{c.client_name || c.client_phone}</Text>
                  <Text style={s.clientPhone}>{c.client_phone}</Text>
                </View>
                <View style={s.pointsBadge}>
                  <Text style={s.pointsNum}>{c.points}</Text>
                  <Text style={s.pointsLabel}>pts</Text>
                </View>
              </View>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${Math.min((c.points / config.redemption_threshold) * 100, 100)}%` }]} />
              </View>
              <Text style={s.progressText}>{Math.max(config.redemption_threshold - c.points, 0)} pontos para resgate</Text>
              <View style={s.clientActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => loadHistory(c.client_phone)}>
                  <Ionicons name="time-outline" size={16} color="#007AFF" />
                  <Text style={s.actionText}>Histórico</Text>
                </TouchableOpacity>
                {c.points >= config.redemption_threshold && (
                  <TouchableOpacity style={[s.actionBtn, s.redeemBtn]} onPress={() => redeemPoints(c.client_phone)}>
                    <Ionicons name="gift-outline" size={16} color="#FFF" />
                    <Text style={[s.actionText, { color: '#FFF' }]}>Resgatar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Config Modal */}
      <Modal visible={showConfig} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Configurar Fidelidade</Text>
            <Text style={s.inputLabel}>Pontos por R$1</Text>
            <TextInput style={s.input} value={String(configForm.points_per_real)} onChangeText={(v) => setConfigForm({...configForm, points_per_real: parseFloat(v) || 0})} keyboardType="numeric" />
            <Text style={s.inputLabel}>Meta de pontos para resgate</Text>
            <TextInput style={s.input} value={String(configForm.redemption_threshold)} onChangeText={(v) => setConfigForm({...configForm, redemption_threshold: parseInt(v) || 0})} keyboardType="numeric" />
            <Text style={s.inputLabel}>Descrição do prêmio</Text>
            <TextInput style={s.input} value={configForm.reward_description} onChangeText={(v) => setConfigForm({...configForm, reward_description: v})} />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowConfig(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={saveConfig}>
                <Text style={s.saveBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Points Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Adicionar Pontos</Text>
            <Text style={s.inputLabel}>Telefone do cliente</Text>
            <TextInput style={s.input} value={addForm.client_phone} onChangeText={(v) => setAddForm({...addForm, client_phone: v})} keyboardType="phone-pad" placeholder="(11) 99999-9999" />
            <Text style={s.inputLabel}>Nome (opcional)</Text>
            <TextInput style={s.input} value={addForm.client_name} onChangeText={(v) => setAddForm({...addForm, client_name: v})} placeholder="Nome do cliente" />
            <Text style={s.inputLabel}>Pontos</Text>
            <TextInput style={s.input} value={addForm.points} onChangeText={(v) => setAddForm({...addForm, points: v})} keyboardType="numeric" placeholder="100" />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAdd(false)}>
                <Text style={s.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={addPoints}>
                <Text style={s.saveBtnText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal visible={!!showHistory} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Histórico de Pontos</Text>
            {history.length === 0 ? (
              <Text style={s.emptyText}>Nenhuma transação</Text>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => (
                  <View style={s.historyItem}>
                    <View>
                      <Text style={s.historyDesc}>{item.description}</Text>
                      <Text style={s.historyDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <Text style={[s.historyPoints, { color: item.type === 'earn' ? '#34C759' : '#FF3B30' }]}>
                      {item.type === 'earn' ? '+' : '-'}{item.points}
                    </Text>
                  </View>
                )}
              />
            )}
            <TouchableOpacity style={[s.saveBtn, { marginTop: 16 }]} onPress={() => setShowHistory(null)}>
              <Text style={s.saveBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#333' },
  configCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  configLabel: { fontSize: 14, color: '#666' },
  configValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#BBB', marginTop: 4, textAlign: 'center' },
  clientCard: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  clientTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { fontSize: 16, fontWeight: '600', color: '#333' },
  clientPhone: { fontSize: 13, color: '#666', marginTop: 2 },
  pointsBadge: { alignItems: 'center' },
  pointsNum: { fontSize: 24, fontWeight: '800', color: '#007AFF' },
  pointsLabel: { fontSize: 11, color: '#666' },
  progressBar: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#999', marginTop: 4 },
  clientActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#007AFF' },
  actionText: { fontSize: 13, color: '#007AFF', fontWeight: '500' },
  redeemBtn: { backgroundColor: '#34C759', borderColor: '#34C759' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '600' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  historyDesc: { fontSize: 14, color: '#333' },
  historyDate: { fontSize: 12, color: '#999', marginTop: 2 },
  historyPoints: { fontSize: 16, fontWeight: '700' },
});
