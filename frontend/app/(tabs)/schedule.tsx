import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import api from '../../src/services/api';

const DAYS = [
  { key: 0, label: 'Segunda-feira', short: 'Seg' },
  { key: 1, label: 'Terça-feira', short: 'Ter' },
  { key: 2, label: 'Quarta-feira', short: 'Qua' },
  { key: 3, label: 'Quinta-feira', short: 'Qui' },
  { key: 4, label: 'Sexta-feira', short: 'Sex' },
  { key: 5, label: 'Sábado', short: 'Sáb' },
  { key: 6, label: 'Domingo', short: 'Dom' },
];

const TIME_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

const DURATION_OPTIONS = [15, 20, 30, 45, 60];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state - support multiple blocks
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [blocks, setBlocks] = useState<{start: string, end: string}[]>([
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '20:00' },
  ]);
  const [slotDuration, setSlotDuration] = useState(30);

  useFocusEffect(
    useCallback(() => {
      loadSchedules();
    }, [])
  );

  const loadSchedules = async () => {
    try {
      const res = await api.get('/schedule/');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddForDay = (dayKey: number) => {
    setSelectedDay(dayKey);
    // Pre-fill with existing blocks for this day
    const daySchedules = schedules.filter(s => s.day_of_week === dayKey);
    if (daySchedules.length > 0) {
      setBlocks(daySchedules.map(s => ({ start: s.start_time, end: s.end_time })));
      setSlotDuration(daySchedules[0].slot_duration_minutes || 30);
    } else {
      setBlocks([{ start: '09:00', end: '12:00' }, { start: '14:00', end: '20:00' }]);
      setSlotDuration(30);
    }
    setShowModal(true);
  };

  const addBlock = () => {
    setBlocks([...blocks, { start: '14:00', end: '18:00' }]);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) {
      Alert.alert('Atenção', 'Precisa ter pelo menos 1 bloco de horário');
      return;
    }
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, field: 'start' | 'end', value: string) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    // Validate blocks
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].start >= blocks[i].end) {
        Alert.alert('Erro', `Bloco ${i + 1}: Horário inicial deve ser antes do final`);
        return;
      }
    }

    setSaving(true);
    try {
      // First delete existing schedules for this day
      const existingForDay = schedules.filter(s => s.day_of_week === selectedDay);
      for (const existing of existingForDay) {
        await api.delete(`/schedule/${existing.id}`);
      }

      // Create new blocks
      for (const block of blocks) {
        await api.post('/schedule/', {
          day_of_week: selectedDay,
          start_time: block.start,
          end_time: block.end,
          slot_duration_minutes: slotDuration,
          recurrence_type: 'weekly',
        });
      }

      Alert.alert('Sucesso', `Horários de ${DAYS[selectedDay].label} salvos!`);
      setShowModal(false);
      await loadSchedules();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao salvar';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDay = (dayKey: number) => {
    const daySchedules = schedules.filter(s => s.day_of_week === dayKey);
    if (daySchedules.length === 0) return;

    Alert.alert(
      'Remover dia',
      `Remover todos os horários de ${DAYS[dayKey].label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const s of daySchedules) {
                await api.delete(`/schedule/${s.id}`);
              }
              await loadSchedules();
            } catch (err) {
              Alert.alert('Erro', 'Falha ao remover');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert('Limpar tudo', 'Remover todos os horários da agenda?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete('/schedule/');
            await loadSchedules();
          } catch (err) {
            Alert.alert('Erro', 'Falha ao limpar');
          }
        },
      },
    ]);
  };

  // Quick setup
  const handleQuickSetup = () => {
    Alert.alert(
      'Configuração Rápida',
      'Configurar Seg-Sex, 09:00-12:00 e 14:00-20:00 (com almoço)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Configurar',
          onPress: async () => {
            setSaving(true);
            try {
              // Clear all first
              await api.delete('/schedule/');
              // Create for Mon-Fri with lunch break
              for (let day = 0; day <= 4; day++) {
                await api.post('/schedule/', {
                  day_of_week: day,
                  start_time: '09:00',
                  end_time: '12:00',
                  slot_duration_minutes: 30,
                  recurrence_type: 'weekly',
                });
                await api.post('/schedule/', {
                  day_of_week: day,
                  start_time: '14:00',
                  end_time: '20:00',
                  slot_duration_minutes: 30,
                  recurrence_type: 'weekly',
                });
              }
              Alert.alert('Sucesso', 'Agenda configurada: Seg-Sex, 09-12h e 14-20h');
              await loadSchedules();
            } catch (err) {
              Alert.alert('Erro', 'Falha na configuração');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  // Group schedules by day
  const schedulesByDay = DAYS.map(day => ({
    ...day,
    schedules: schedules.filter(s => s.day_of_week === day.key).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)),
  }));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.quickSetupBtn} onPress={handleQuickSetup}>
            <Ionicons name="flash" size={18} color="#FFF" />
            <Text style={styles.quickSetupText}>Config. Rápida</Text>
          </TouchableOpacity>
          {schedules.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              <Text style={styles.clearBtnText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Days list */}
        {schedulesByDay.map(day => (
          <View key={day.key} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayLeft}>
                <View style={[styles.dayBadge, day.schedules.length > 0 ? styles.dayBadgeActive : styles.dayBadgeInactive]}>
                  <Text style={styles.dayBadgeText}>{day.short}</Text>
                </View>
                <Text style={styles.dayLabel}>{day.label}</Text>
              </View>
              <View style={styles.dayActions}>
                {day.schedules.length > 0 && (
                  <TouchableOpacity style={styles.dayDeleteBtn} onPress={() => handleDeleteDay(day.key)}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.dayEditBtn} onPress={() => openAddForDay(day.key)}>
                  <Ionicons name={day.schedules.length > 0 ? 'create-outline' : 'add'} size={18} color="#1A73E8" />
                </TouchableOpacity>
              </View>
            </View>

            {day.schedules.length === 0 ? (
              <TouchableOpacity style={styles.dayEmpty} onPress={() => openAddForDay(day.key)}>
                <Text style={styles.dayEmptyText}>Folga - Toque para configurar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.blocksContainer}>
                {day.schedules.map((schedule: any, idx: number) => (
                  <View key={schedule.id} style={styles.blockRow}>
                    <View style={styles.blockTime}>
                      <Ionicons name="time-outline" size={14} color="#1A73E8" />
                      <Text style={styles.blockTimeText}>
                        {schedule.start_time} - {schedule.end_time}
                      </Text>
                    </View>
                    <Text style={styles.blockMeta}>{schedule.slot_duration_minutes}min/slot</Text>
                    {idx < day.schedules.length - 1 && (
                      <View style={styles.lunchIndicator}>
                        <Ionicons name="restaurant-outline" size={12} color="#FF9500" />
                        <Text style={styles.lunchText}>Intervalo</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{DAYS[selectedDay]?.label}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#1A73E8" /> : <Text style={styles.modalSave}>Salvar</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
            <Text style={styles.sectionTitle}>Blocos de Horário</Text>
            <Text style={styles.sectionHint}>Adicione intervalos para configurar almoço ou pausas</Text>

            {blocks.map((block, idx) => (
              <View key={idx} style={styles.blockCard}>
                <View style={styles.blockCardHeader}>
                  <Text style={styles.blockCardTitle}>
                    {idx === 0 ? 'Manhã / Período 1' : idx === 1 ? 'Tarde / Período 2' : `Período ${idx + 1}`}
                  </Text>
                  {blocks.length > 1 && (
                    <TouchableOpacity onPress={() => removeBlock(idx)}>
                      <Ionicons name="close-circle" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.fieldLabel}>Início</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timeRow}>
                    {TIME_OPTIONS.map(t => (
                      <TouchableOpacity
                        key={`s-${idx}-${t}`}
                        style={[styles.timeChip, block.start === t && styles.timeChipActive]}
                        onPress={() => updateBlock(idx, 'start', t)}
                      >
                        <Text style={[styles.timeChipText, block.start === t && styles.timeChipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={styles.fieldLabel}>Término</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.timeRow}>
                    {TIME_OPTIONS.map(t => (
                      <TouchableOpacity
                        key={`e-${idx}-${t}`}
                        style={[styles.timeChip, block.end === t && styles.timeChipActive]}
                        onPress={() => updateBlock(idx, 'end', t)}
                      >
                        <Text style={[styles.timeChipText, block.end === t && styles.timeChipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {idx < blocks.length - 1 && (
                  <View style={styles.lunchBanner}>
                    <Ionicons name="restaurant" size={16} color="#FF9500" />
                    <Text style={styles.lunchBannerText}>Intervalo / Almoço</Text>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addBlockBtn} onPress={addBlock}>
              <Ionicons name="add-circle-outline" size={20} color="#1A73E8" />
              <Text style={styles.addBlockText}>Adicionar Bloco</Text>
            </TouchableOpacity>

            {/* Slot duration */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Duração do Slot</Text>
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, slotDuration === d && styles.durationChipActive]}
                  onPress={() => setSlotDuration(d)}
                >
                  <Text style={[styles.durationText, slotDuration === d && styles.durationTextActive]}>{d} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Resumo</Text>
              {blocks.map((b, i) => (
                <Text key={i} style={styles.previewText}>
                  {i === 0 ? '🌅' : i === 1 ? '🌇' : '🌙'} {b.start} às {b.end} ({Math.floor(((parseInt(b.end.split(':')[0]) * 60 + parseInt(b.end.split(':')[1])) - (parseInt(b.start.split(':')[0]) * 60 + parseInt(b.start.split(':')[1]))) / slotDuration)} slots de {slotDuration}min)
                </Text>
              ))}
              {blocks.length > 1 && (
                <Text style={styles.previewLunch}>
                  🍽️ Intervalo: {blocks[0].end} às {blocks[1].start}
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#333' },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  quickSetupBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A73E8', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, gap: 6 },
  quickSetupText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FF3B30', gap: 4 },
  clearBtnText: { color: '#FF3B30', fontWeight: '600', fontSize: 13 },

  dayCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E8E8E8' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  dayBadgeActive: { backgroundColor: '#1A73E8' },
  dayBadgeInactive: { backgroundColor: '#CCC' },
  dayBadgeText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  dayLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
  dayActions: { flexDirection: 'row', gap: 8 },
  dayDeleteBtn: { padding: 6 },
  dayEditBtn: { padding: 6, backgroundColor: '#E8F0FE', borderRadius: 6 },

  dayEmpty: { marginTop: 8, paddingVertical: 8 },
  dayEmptyText: { fontSize: 13, color: '#999', fontStyle: 'italic' },

  blocksContainer: { marginTop: 10, gap: 4 },
  blockRow: { paddingVertical: 4 },
  blockTime: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  blockTimeText: { fontSize: 14, fontWeight: '600', color: '#333' },
  blockMeta: { fontSize: 11, color: '#999', marginLeft: 20, marginTop: 2 },
  lunchIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 20, marginTop: 4, marginBottom: 2 },
  lunchText: { fontSize: 11, color: '#FF9500', fontStyle: 'italic' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  modalCancel: { fontSize: 16, color: '#666' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  modalSave: { fontSize: 16, fontWeight: '700', color: '#1A73E8' },
  modalScroll: { flex: 1 },
  modalContent: { padding: 16, paddingBottom: 40 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  sectionHint: { fontSize: 12, color: '#999', marginBottom: 12 },

  blockCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E8E8E8' },
  blockCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  blockCardTitle: { fontSize: 14, fontWeight: '700', color: '#1A73E8' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 8 },
  timeRow: { flexDirection: 'row', gap: 6 },
  timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#E0E0E0' },
  timeChipActive: { backgroundColor: '#1A73E8', borderColor: '#1A73E8' },
  timeChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  timeChipTextActive: { color: '#FFF' },

  lunchBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingVertical: 8, backgroundColor: '#FFF3E0', borderRadius: 8 },
  lunchBannerText: { fontSize: 13, fontWeight: '600', color: '#FF9500' },

  addBlockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderWidth: 1.5, borderColor: '#1A73E8', borderRadius: 10, borderStyle: 'dashed' },
  addBlockText: { fontSize: 14, fontWeight: '600', color: '#1A73E8' },

  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  durationChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#DDD' },
  durationChipActive: { backgroundColor: '#1A73E8', borderColor: '#1A73E8' },
  durationText: { fontSize: 14, fontWeight: '600', color: '#666' },
  durationTextActive: { color: '#FFF' },

  previewBox: { backgroundColor: '#E8F0FE', borderRadius: 12, padding: 16, marginTop: 20 },
  previewTitle: { fontSize: 14, fontWeight: '700', color: '#1A73E8', marginBottom: 8 },
  previewText: { fontSize: 13, color: '#333', marginBottom: 4 },
  previewLunch: { fontSize: 13, color: '#FF9500', fontWeight: '600', marginTop: 4 },
});