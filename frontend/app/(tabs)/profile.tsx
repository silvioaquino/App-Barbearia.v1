import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import api from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { user, logout, checkAuth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    const doLogout = async () => {
      setLoading(true);
      try {
        await logout();
      } catch (e) {
        console.error('Logout error:', e);
      }
      setLoading(false);
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza que deseja sair?')) {
        doLogout();
      }
    } else {
      Alert.alert('Sair', 'Tem certeza que deseja sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const handlePromoteToBarber = async () => {
    if (user?.role === 'barber') {
      Alert.alert('Aviso', 'Você já é um barbeiro!');
      return;
    }

    Alert.alert(
      'Promover para Barbeiro',
      'Deseja se tornar um barbeiro? Isso permitirá acessar todas as funcionalidades de gerenciamento.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, promover',
          onPress: async () => {
            try {
              await api.post('/auth/promote-to-barber');
              await checkAuth(); // Refresh user data in context
              Alert.alert('Sucesso', 'Você agora é um barbeiro! Todas as funcionalidades de gerenciamento foram desbloqueadas.');
            } catch (error) {
              Alert.alert('Erro', 'Falha ao promover usuário');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        {user?.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#999" />
          </View>
        )}
        
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.roleBadge}>
          <Ionicons 
            name={user?.role === 'barber' ? 'cut' : 'person'} 
            size={16} 
            color="#FFF" 
          />
          <Text style={styles.roleText}>
            {user?.role === 'barber' ? 'Barbeiro' : 'Cliente'}
          </Text>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        
        <Card>
          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Meu Perfil', `Nome: ${user?.name}\nEmail: ${user?.email}\nRole: ${user?.role === 'barber' ? 'Barbeiro' : 'Cliente'}`)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>Meu Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Notificações', 'As notificações push estão ativas para novos agendamentos. Você será notificado quando um cliente marcar um horário.')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>Notificações</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Ajuda', 'Barbershop Manager v1.0.0\n\nPara dúvidas ou suporte, entre em contato com o desenvolvedor.\n\nDicas:\n• Use a aba Agenda para configurar seus horários\n• Clientes podem agendar pela página pública\n• Confirme agendamentos na aba Agendamentos')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>Ajuda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </Card>
      </View>

      {user?.role === 'barber' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrações</Text>
          <Card>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/whatsapp-settings')}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <Text style={styles.menuItemText}>WhatsApp Business</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/server-config')}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="server-outline" size={24} color="#007AFF" />
                <Text style={styles.menuItemText}>Configurar Servidor</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </Card>
        </View>
      )}

      {user?.role !== 'barber' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <Button
            title="Tornar-se Barbeiro"
            variant="success"
            onPress={handlePromoteToBarber}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <Card>
          <Text style={styles.aboutText}>
            Barbershop Manager v1.0.0
          </Text>
          <Text style={styles.aboutSubtext}>
            Sistema completo de gerenciamento para barbearias
          </Text>
        </Card>
      </View>

      <Button
        title="Sair"
        variant="danger"
        onPress={handleLogout}
        loading={loading}
        style={styles.logoutButton}
      />
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});
