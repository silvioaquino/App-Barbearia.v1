import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, TextInput, Switch, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import api from '../../src/services/api';
import Button from '../../src/components/Button';

export default function Products() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [sellingProduct, setSellingProduct] = useState<any>(null);
  const [sellQty, setSellQty] = useState('1');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });

  useFocusEffect(useCallback(() => { loadProducts(); }, []));

  const loadProducts = async () => {
    try {
      const res = await api.get('/products/?active_only=false');
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const onRefresh = async () => { setRefreshing(true); await loadProducts(); setRefreshing(false); };

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', stock: '' });
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock) });
    setShowModal(true);
  };

  const openSell = (p: any) => {
    setSellingProduct(p);
    setSellQty('1');
    setShowSellModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Erro', 'Nome é obrigatório'); return; }
    if (!form.price || isNaN(Number(form.price))) { Alert.alert('Erro', 'Preço inválido'); return; }

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      };
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data);
        Alert.alert('Sucesso', 'Produto atualizado!');
      } else {
        await api.post('/products/', data);
        Alert.alert('Sucesso', 'Produto criado!');
      }
      setShowModal(false);
      await loadProducts();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.detail || 'Falha ao salvar produto');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (p: any) => {
    try {
      await api.put(`/products/${p.id}/toggle-active`);
      await loadProducts();
    } catch (err) { Alert.alert('Erro', 'Falha ao alterar status'); }
  };

  const handleSell = async () => {
    const qty = parseInt(sellQty);
    if (!qty || qty < 1) { Alert.alert('Erro', 'Quantidade inválida'); return; }

    try {
      const res = await api.post(`/products/${sellingProduct.id}/sell`, null, { params: { quantity: qty } });
      Alert.alert('Venda Registrada', `${res.data.message}\nTotal: R$ ${res.data.total.toFixed(2).replace('.', ',')}\nEstoque restante: ${res.data.remaining_stock}`);
      setShowSellModal(false);
      await loadProducts();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.detail || 'Falha na venda');
    }
  };

  const handleDelete = (p: any) => {
    Alert.alert('Excluir Produto', `Deseja excluir "${p.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try { await api.delete(`/products/${p.id}`); await loadProducts(); } catch (err) { Alert.alert('Erro', 'Falha ao excluir'); }
      }},
    ]);
  };

  return (
    <View style={styles.container}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produtos</Text>
        
      </View>
    </View>
      {/* Header 
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produtos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Novo</Text>
        </TouchableOpacity>
      </View>*/}
      


      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
                <Button
                  title="Adicionar Produto"
                  onPress={openAdd}
                  style={styles.addButton}
                />
                }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
              <Text style={styles.emptyBtnText}>Adicionar Produto</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.is_active && styles.cardInactive]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.name}</Text>
                {item.description ? <Text style={styles.productDesc}>{item.description}</Text> : null}
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.priceText}>R$ {Number(item.price).toFixed(2).replace('.', ',')}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.stockBadge}>
                <Ionicons name="cube" size={14} color={item.stock > 0 ? '#34C759' : '#FF3B30'} />
                <Text style={[styles.stockText, { color: item.stock > 0 ? '#34C759' : '#FF3B30' }]}>
                  Estoque: {item.stock}
                </Text>
              </View>
              <View style={styles.activeToggle}>
                <Text style={styles.activeLabel}>{item.is_active ? 'Ativo' : 'Inativo'}</Text>
                <Switch value={item.is_active} onValueChange={() => handleToggleActive(item)} trackColor={{ true: '#34C759', false: '#CCC' }} />
              </View>
            </View>

            <View style={styles.actionsRow}>
              {item.is_active && item.stock > 0 && (
                <TouchableOpacity style={styles.sellBtn} onPress={() => openSell(item)}>
                  <Ionicons name="cart" size={16} color="#FFF" />
                  <Text style={styles.sellBtnText}>Vender</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={16} color="#1A73E8" />
                <Text style={styles.editBtnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}><Text style={styles.modalCancel}>Cancelar</Text></TouchableOpacity>
              <Text style={styles.modalTitle}>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</Text>
              <TouchableOpacity onPress={handleSave} disabled={saving}><Text style={styles.modalSave}>{saving ? 'Salvando...' : 'Salvar'}</Text></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
              <Text style={styles.label}>Nome *</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={v => setForm({...form, name: v})} placeholder="Nome do produto" />
              <Text style={styles.label}>Descrição</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.description} onChangeText={v => setForm({...form, description: v})} placeholder="Descrição" multiline numberOfLines={3} />
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput style={styles.input} value={form.price} onChangeText={v => setForm({...form, price: v})} placeholder="0.00" keyboardType="decimal-pad" />
              <Text style={styles.label}>Estoque</Text>
              <TextInput style={styles.input} value={form.stock} onChangeText={v => setForm({...form, stock: v})} placeholder="0" keyboardType="number-pad" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sell Modal */}
      <Modal visible={showSellModal} animationType="fade" transparent onRequestClose={() => setShowSellModal(false)}>
        <View style={styles.sellOverlay}>
          <View style={styles.sellCard}>
            <Text style={styles.sellTitle}>Vender Produto</Text>
            <Text style={styles.sellProductName}>{sellingProduct?.name}</Text>
            <Text style={styles.sellPrice}>R$ {Number(sellingProduct?.price || 0).toFixed(2).replace('.', ',')} / un</Text>
            <Text style={styles.sellStock}>Estoque: {sellingProduct?.stock}</Text>

            <Text style={styles.label}>Quantidade</Text>
            <TextInput style={styles.input} value={sellQty} onChangeText={setSellQty} keyboardType="number-pad" />

            {sellQty && !isNaN(Number(sellQty)) && (
              <Text style={styles.sellTotal}>Total: R$ {(Number(sellingProduct?.price || 0) * Number(sellQty)).toFixed(2).replace('.', ',')}</Text>
            )}

            <View style={styles.sellActions}>
              <TouchableOpacity style={styles.sellCancelBtn} onPress={() => setShowSellModal(false)}>
                <Text style={styles.sellCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sellConfirmBtn} onPress={handleSell}>
                <Ionicons name="cart" size={18} color="#FFF" />
                <Text style={styles.sellConfirmText}>Confirmar Venda</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    marginBottom: 16,
  },
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 26, backgroundColor: '#1A73E8', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF'},
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A73E8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, gap: 4 },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: '#999' },
  emptyBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1A73E8', borderRadius: 8 },
  emptyBtnText: { color: '#FFF', fontWeight: '600' },

  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E8E8E8' },
  cardInactive: { opacity: 0.6, borderColor: '#DDD' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  productName: { fontSize: 16, fontWeight: '700', color: '#333' },
  productDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  priceBox: { backgroundColor: '#E8F0FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 16, fontWeight: '800', color: '#1A73E8' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockText: { fontSize: 13, fontWeight: '600' },
  activeToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeLabel: { fontSize: 12, color: '#666' },
  actionsRow: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  sellBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#34C759', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  sellBtnText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1A73E8' },
  editBtnText: { color: '#1A73E8', fontWeight: '600', fontSize: 13 },
  deleteBtn: { padding: 8 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  modalCancel: { fontSize: 16, color: '#666' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  modalSave: { fontSize: 16, fontWeight: '700', color: '#1A73E8' },
  modalScroll: { flex: 1 },
  modalContent: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#DDD', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#333' },
  textArea: { height: 80, textAlignVertical: 'top' },

  // Sell Modal
  sellOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  sellCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24 },
  sellTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 8 },
  sellProductName: { fontSize: 16, fontWeight: '600', color: '#1A73E8' },
  sellPrice: { fontSize: 14, color: '#666', marginTop: 4 },
  sellStock: { fontSize: 13, color: '#999', marginBottom: 16 },
  sellTotal: { fontSize: 18, fontWeight: '800', color: '#34C759', textAlign: 'center', marginTop: 12 },
  sellActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  sellCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  sellCancelText: { color: '#666', fontWeight: '600' },
  sellConfirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#34C759', paddingVertical: 12, borderRadius: 10 },
  sellConfirmText: { color: '#FFF', fontWeight: '700' },
});
