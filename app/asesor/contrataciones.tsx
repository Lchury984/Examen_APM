import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { ContractsRepository, Contract } from '../../src/data/repositories/contractsRepository';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

const repo = new ContractsRepository();

export default function ContratacionesPendientes() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await repo.getPendings();
      setItems(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (profile?.rol !== 'asesor_comercial') {
      router.replace('/');
      return;
    }
    load();
  }, [profile?.rol, authLoading]);

  async function updateStatus(id: string, estado: Contract['estado']) {
    try {
      await repo.updateStatus(id, estado);
      Alert.alert(
        'Estado actualizado', 
        `La solicitud ha sido ${estado === 'aprobado' ? 'aprobada' : 'rechazada'}`
      );
      load();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  }

  function getStatusColor(estado: string) {
    switch (estado) {
      case 'aprobado':
        return '#10B981';
      case 'rechazado':
        return '#EF4444';
      case 'en_proceso':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  }

  function getStatusLabel(estado: string) {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'en_proceso':
        return 'En Proceso';
      default:
        return estado;
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitudes de Contratación</Text>
      <Text style={styles.subtitle}>Gestiona las solicitudes de los clientes</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        onRefresh={load}
        refreshing={loading}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.userName}>{item.user_profile?.nombre || 'Usuario'}</Text>
                <Text style={styles.userEmail}>{item.user_profile?.email}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(item.estado) }]}>
                  {getStatusLabel(item.estado)}
                </Text>
              </View>
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.planName}>{item.planes_moviles?.nombre}</Text>
              <Text style={styles.planPrice}>${item.planes_moviles?.precio}/mes</Text>
            </View>

            <Text style={styles.date}>
              📅 {new Date(item.created_at).toLocaleDateString()} - {new Date(item.created_at).toLocaleTimeString()}
            </Text>

            {item.user_profile?.telefono ? (
              <Text style={styles.phone}>📞 {item.user_profile.telefono}</Text>
            ) : null}

            <View style={styles.buttons}>
              {item.estado === 'pendiente' ? (
                <>
                  <Pressable 
                    style={[styles.button, styles.approve]} 
                    onPress={() => updateStatus(item.id, 'aprobado')}
                  >
                    <Text style={styles.btnText}>✓ Aprobar</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.button, styles.reject]} 
                    onPress={() => updateStatus(item.id, 'rechazado')}
                  >
                    <Text style={styles.btnText}>✗ Rechazar</Text>
                  </Pressable>
                </>
              ) : null}
              
              <Pressable 
                style={[styles.button, styles.chat]} 
                onPress={() => router.push(`/chat/${item.id}` as any)}
              >
                <Text style={styles.btnText}>💬 Chat</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭</Text>
            <Text style={styles.empty}>No hay solicitudes en este momento</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#F9FAFB' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 4,
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planInfo: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  date: { 
    color: '#6B7280', 
    marginBottom: 4,
    fontSize: 13,
  },
  phone: {
    color: '#6B7280',
    marginBottom: 12,
    fontSize: 13,
  },
  buttons: { 
    flexDirection: 'row', 
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approve: { 
    backgroundColor: '#10B981',
  },
  reject: { 
    backgroundColor: '#EF4444',
  },
  chat: {
    backgroundColor: '#2563EB',
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  empty: { 
    textAlign: 'center', 
    color: '#6B7280',
    fontSize: 16,
  },
});