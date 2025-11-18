import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { ContractsRepository, Contract } from '../../src/data/repositories/contractsRepository';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

const repo = new ContractsRepository();

export default function ContratacionesPendientes() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Contract[]>([]);

  async function load() {
    const data = await repo.getPendings();
    setItems(data);
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
      load();
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitudes pendientes</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.plan}>{item.planes_moviles?.nombre}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            <View style={styles.buttons}>
              <Pressable style={styles.approve} onPress={() => updateStatus(item.id, 'aprobado')}>
                <Text style={styles.btnText}>Aprobar</Text>
              </Pressable>
              <Pressable style={styles.reject} onPress={() => updateStatus(item.id, 'rechazado')}>
                <Text style={styles.btnText}>Rechazar</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No hay pendientes</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  plan: { fontSize: 18, fontWeight: '600' },
  date: { color: '#6B7280', marginBottom: 12 },
  buttons: { flexDirection: 'row', gap: 12 },
  approve: { flex: 1, backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center' },
  reject: { flex: 1, backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7280' },
});

