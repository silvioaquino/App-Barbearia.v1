import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../src/services/api';

export default function WhatsAppSettings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/whatsapp/settings');
      if (res.data) {
        setPhoneNumberId(res.data.phone_number_id || '');
        setBusinessPhone(res.data.business_phone || '');
        setIsActive(res.data.is_active || false);
        setHasToken(res.data.has_token || false);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: any = {
        phone_number_id: phoneNumberId || null,
        business_phone: businessPhone || null,
        is_active: isActive,
      };
      if (accessToken) data.access_token = accessToken;
      await api.put('/whatsapp/settings', data);
      setHasToken(!!accessToken || hasToken);
      const msg = 'Configurações salvas com sucesso!';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao salvar';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Erro', msg);
    } finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await api.post('/whatsapp/test');
      const msg = res.data.message || 'Mensagem enviada!';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Sucesso', msg);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro no teste';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Erro', msg);
    } finally { setTesting(false); }
  };

  if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#25D366" /></View>;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text style={styles.headerTitle}>WhatsApp Business</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Status */}
          <View style={[styles.statusCard, isActive && hasToken ? styles.statusActive : styles.statusInactive]}>
            <Ionicons name={isActive && hasToken ? "checkmark-circle" : "alert-circle"} size={24} color={isActive && hasToken ? "#25D366" : "#FF9500"} />
            <Text style={styles.statusText}>
              {isActive && hasToken ? "WhatsApp integrado e ativo" : "WhatsApp não configurado"}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#1A73E8" />
            <Text style={styles.infoText}>
              Configure a API oficial do WhatsApp Business para enviar notificações automáticas de agendamentos aos clientes.
            </Text>
          </View>

          {/* Form */}
          <Text style={styles.sectionTitle}>Credenciais da API</Text>

          <Text style={styles.label}>Phone Number ID</Text>
          <TextInput style={styles.input} value={phoneNumberId} onChangeText={setPhoneNumberId} placeholder="Ex: 123456789012345" placeholderTextColor="#999" />

          <Text style={styles.label}>Access Token</Text>
          <TextInput style={styles.input} value={accessToken} onChangeText={setAccessToken} placeholder={hasToken ? "••••••• (token salvo)" : "Cole seu access token aqui"} placeholderTextColor="#999" secureTextEntry multiline />

          <Text style={styles.label}>Número do Negócio (para testes)</Text>
          <TextInput style={styles.input} value={businessPhone} onChangeText={setBusinessPhone} placeholder="5511999998888" placeholderTextColor="#999" keyboardType="phone-pad" />

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Ativar notificações</Text>
              <Text style={styles.toggleHint}>Enviar mensagens automáticas</Text>
            </View>
            <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: '#25D366', false: '#CCC' }} />
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#FFF" /> : (
              <><Ionicons name="save" size={18} color="#FFF" /><Text style={styles.saveBtnText}>Salvar Configurações</Text></>
            )}
          </TouchableOpacity>

          {isActive && hasToken && (
            <TouchableOpacity style={styles.testBtn} onPress={handleTest} disabled={testing}>
              {testing ? <ActivityIndicator color="#25D366" /> : (
                <><Ionicons name="paper-plane" size={18} color="#25D366" /><Text style={styles.testBtnText}>Enviar Mensagem de Teste</Text></>
              )}
            </TouchableOpacity>
          )}

          {/* How to get credentials */}
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Como obter as credenciais?</Text>
            <Text style={styles.helpStep}>1. Acesse developers.facebook.com</Text>
            <Text style={styles.helpStep}>2. Crie um app do tipo "Business"</Text>
            <Text style={styles.helpStep}>3. Adicione o produto "WhatsApp"</Text>
            <Text style={styles.helpStep}>4. Em WhatsApp {'>'} API Setup, copie o Phone Number ID e o Access Token</Text>
            <Text style={styles.helpStep}>5. Configure um número de telefone verificado</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  backBtn: { marginRight: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12, marginBottom: 16 },
  statusActive: { backgroundColor: '#E8F5E9' },
  statusInactive: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 15, fontWeight: '600', color: '#333' },

  infoBox: { flexDirection: 'row', gap: 8, padding: 14, backgroundColor: '#E8F0FE', borderRadius: 10, marginBottom: 20 },
  infoText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 18 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 16 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  toggleHint: { fontSize: 12, color: '#999', marginTop: 2 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#25D366', paddingVertical: 14, borderRadius: 12, marginTop: 20 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#25D366', marginTop: 12 },
  testBtnText: { color: '#25D366', fontSize: 14, fontWeight: '700' },

  helpBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginTop: 24, borderWidth: 1, borderColor: '#E8E8E8' },
  helpTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 },
  helpStep: { fontSize: 13, color: '#666', lineHeight: 22 },
});
