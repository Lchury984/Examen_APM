import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ContractsRepository, Contract } from '../../src/data/repositories/contractsRepository';
import { useAuth } from '../../src/context/AuthContext';

const repo = new ContractsRepository();

export default function MisContratacionesScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await repo.getByUser(user.id);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    load();
  }, [user, authLoading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis contrataciones</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.plan}>{item.planes_moviles?.nombre}</Text>
            <Text style={styles.price}>${item.planes_moviles?.precio}</Text>
            <Text style={styles.status}>Estado: {item.estado}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Sin registros</Text> : null}
      />
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  plan: {
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    color: '#2563EB',
    marginBottom: 4,
  },
  status: {
    fontWeight: '500',
  },
  date: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
  },
});

