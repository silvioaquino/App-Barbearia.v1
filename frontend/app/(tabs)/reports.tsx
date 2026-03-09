import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

const PERIODS = [
  { key: 'day', label: 'Hoje' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
];

export default function Reports() {
  const [period, setPeriod] = useState('day');
  const [financial, setFinancial] = useState(null);
  const [topServices, setTopServices] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [finRes, topRes, dailyRes] = await Promise.all([
        api.get(`/reports/financial?period=${period}`),
        api.get(`/reports/top-services?period=${period}`),
        api.get('/reports/daily-breakdown?days=7'),
      ]);
      setFinancial(finRes.data);
      setTopServices(topRes.data);
      setDailyData(dailyRes.data);
    } catch (e) { console.log(e); } finally { setLoading(false); setRefreshing(false); }
  }, [period]);

  useEffect(() => { setLoading(true); loadData(); }, [loadData]);

  const maxRevenue = Math.max(...dailyData.map(d => d.services + d.products), 1);

  if (loading) return <View style={s.container}><ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} /></View>;

  return (
    <View style={s.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>

        <View style={s.periodBar}>
          {PERIODS.map((p) => (
            <TouchableOpacity key={p.key} style={[s.periodBtn, period === p.key && s.periodActive]} onPress={() => setPeriod(p.key)} data-testid={`period-${p.key}`}>
              <Text style={[s.periodText, period === p.key && s.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {financial && (
          <>
            <View style={s.revenueCard}>
              <Text style={s.revenueLabel}>Faturamento Total</Text>
              <Text style={s.revenueValue}>R$ {financial.total_revenue.toFixed(2).replace('.', ',')}</Text>
              <View style={s.revenueBreakdown}>
                <View style={s.revItem}>
                  <View style={[s.revDot, { backgroundColor: '#007AFF' }]} />
                  <Text style={s.revText}>Serviços: R$ {financial.total_services.toFixed(2).replace('.', ',')}</Text>
                </View>
                <View style={s.revItem}>
                  <View style={[s.revDot, { backgroundColor: '#34C759' }]} />
                  <Text style={s.revText}>Produtos: R$ {financial.total_products.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            </View>

            <View style={s.statsRow}>
              <StatCard icon="checkmark-circle" color="#34C759" value={financial.completed_appointments} label="Concluídos" />
              <StatCard icon="close-circle" color="#FF3B30" value={financial.cancelled_appointments} label="Cancelados" />
              <StatCard icon="time" color="#FF9500" value={financial.pending_appointments} label="Pendentes" />
              <StatCard icon="cube" color="#007AFF" value={financial.product_sales_count} label="Vendas" />
            </View>
          </>
        )}

        {/* Simple Bar Chart */}
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Últimos 7 dias</Text>
          <View style={s.chart}>
            {dailyData.map((d, i) => {
              const total = d.services + d.products;
              const height = maxRevenue > 0 ? (total / maxRevenue) * 120 : 0;
              return (
                <View key={i} style={s.barCol}>
                  <Text style={s.barValue}>{total > 0 ? `${total.toFixed(0)}` : ''}</Text>
                  <View style={s.barContainer}>
                    <View style={[s.bar, { height: Math.max(height, 2) }]}>
                      {d.products > 0 && <View style={[s.barSegment, { height: (d.products / total) * Math.max(height, 2), backgroundColor: '#34C759' }]} />}
                    </View>
                  </View>
                  <Text style={s.barLabel}>{d.day_name}</Text>
                  <Text style={s.barSub}>{d.appointments}x</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Services */}
        <View style={s.topCard}>
          <Text style={s.chartTitle}>Top Serviços</Text>
          {topServices.length === 0 ? (
            <Text style={s.emptyText}>Nenhum serviço concluído no período</Text>
          ) : (
            topServices.map((svc, i) => (
              <View key={i} style={s.topRow}>
                <View style={s.topRank}><Text style={s.topRankText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.topName}>{svc.name}</Text>
                  <Text style={s.topCount}>{svc.count}x realizados</Text>
                </View>
                <Text style={s.topRevenue}>R$ {svc.revenue.toFixed(2).replace('.', ',')}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, color, value, label }) {
  return (
    <View style={s.statCard}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1818' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#333' },
  periodBar: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#E8E8E8', borderRadius: 10, padding: 3 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  periodActive: { backgroundColor: '#f78504' },
  periodText: { fontSize: 14, fontWeight: '600', color: '#666' },
  periodTextActive: { color: '#FFF' },
  revenueCard: { margin: 16, marginTop: 0, backgroundColor: '#f78504', borderRadius: 16, padding: 20 },
  revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  revenueValue: { color: '#FFF', fontSize: 32, fontWeight: '800', marginTop: 4 },
  revenueBreakdown: { flexDirection: 'row', gap: 16, marginTop: 12 },
  revItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  revDot: { width: 8, height: 8, borderRadius: 4 },
  revText: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  statsRow: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 16, gap: 6 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#333', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  chartCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  barContainer: { height: 120, justifyContent: 'flex-end' },
  bar: { width: 24, backgroundColor: '#f78504', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barSegment: { width: '100%', borderRadius: 0 },
  barValue: { fontSize: 10, color: '#999', marginBottom: 2 },
  barLabel: { fontSize: 12, color: '#666', marginTop: 4, fontWeight: '600' },
  barSub: { fontSize: 10, color: '#999' },
  topCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  topRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  topRankText: { fontSize: 13, fontWeight: '700', color: '#333' },
  topName: { fontSize: 14, fontWeight: '600', color: '#333' },
  topCount: { fontSize: 12, color: '#999' },
  topRevenue: { fontSize: 15, fontWeight: '700', color: '#34C759' },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
});