import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function UsuarioHome() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || profile?.rol === 'asesor_comercial') {
      router.replace('/login');
    }
  }, [user, profile?.rol, loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hola {user?.email}</Text>
      <Text style={styles.subtitle}>¿Qué deseas hacer hoy?</Text>

      <Pressable style={styles.card} onPress={() => router.push('/')}>
        <Text style={styles.cardTitle}>Ver catálogo</Text>
        <Text style={styles.cardDescription}>Explora los planes disponibles</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/usuario/contrataciones')}>
        <Text style={styles.cardTitle}>Mis contrataciones</Text>
        <Text style={styles.cardDescription}>Consulta el estado de tus solicitudes</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push('/chat/soporte')}>
        <Text style={styles.cardTitle}>Chat con asesor</Text>
        <Text style={styles.cardDescription}>Comunícate en tiempo real</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
});
