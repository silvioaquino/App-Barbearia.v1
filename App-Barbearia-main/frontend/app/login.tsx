import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Button from '../src/components/Button';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>💈</Text>
          <Text style={styles.title}>Barbershop Manager</Text>
          <Text style={styles.subtitle}>
            Gerencie sua barbearia de forma simples e eficiente
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="📅" text="Gerenciar agendamentos" />
          <FeatureItem icon="✂️" text="Controlar serviços" />
          <FeatureItem icon="💰" text="Controle de caixa" />
          <FeatureItem icon="📊" text="Relatórios financeiros" />
        </View>

        <View style={styles.footer}>
          <Button
            title="Entrar com Google"
            onPress={handleLogin}
            loading={loading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    marginTop: 40,
  },
});
