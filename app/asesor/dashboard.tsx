import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { PlansRepository } from '../../src/data/repositories/plansRepository';
import { Plan } from '../../src/domain/models/Plan';
import { PlanCard } from '../../src/presentation/components/PlanCard';
import { useAuth } from '../../src/context/AuthContext';

const repo = new PlansRepository();

export default function AsesorDashboard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await repo.getAll();
      setPlans(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (profile?.rol !== 'asesor_comercial') {
      router.replace('/');
      return;
    }
    load();
  }, [profile?.rol, authLoading, load]);

  async function handleDelete(plan: Plan) {
    Alert.alert('Eliminar plan', `¿Deseas eliminar ${plan.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await repo.delete(plan.id);
          load();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel Asesor</Text>
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/asesor/plan-form' as never)}>
          <Text style={styles.primaryButtonText}>Crear plan</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/asesor/contrataciones' as never)}>
          <Text style={styles.secondaryText}>Contrataciones</Text>
        </Pressable>
      </View>

      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        onRefresh={load}
        refreshing={loading}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onEdit={() => router.push({ pathname: '/asesor/plan-form', params: { planId: item.id } } as never)}
            onDelete={handleDelete}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
