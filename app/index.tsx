import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Plan } from '../src/domain/models/Plan';
import { PlanCard } from '../src/presentation/components/PlanCard';
import { PlansRepository } from '../src/data/repositories/plansRepository';
import { ContractsRepository } from '../src/data/repositories/contractsRepository';
import { useAuth } from '../src/context/AuthContext';

const plansRepo = new PlansRepository();
const contractsRepo = new ContractsRepository();

export default function CatalogScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { profile, user, loading: authLoading, signOut } = useAuth();

  const isAsesor = profile?.rol === 'asesor_comercial';
  const isLoggedIn = !!user;

  const headerActionLabel = useMemo(() => {
    if (authLoading) return '...';
    if (!isLoggedIn) return 'Login';
    return isAsesor ? 'Dashboard' : 'Mi cuenta';
  }, [authLoading, isLoggedIn, isAsesor]);

  async function load() {
    setLoading(true);
    try {
      const data = await plansRepo.getActivePlans();
      setPlans(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleContract(plan: Plan) {
    if (!user) {
      router.push({ pathname: '/planes/[id]', params: { id: plan.id } });
      return;
    }
    try {
      await contractsRepo.create(plan.id, user.id);
      Alert.alert('Solicitud enviada', 'Un asesor revisará tu contratación');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  useEffect(() => {
    load();
    const unsubscribe = plansRepo.subscribeToChanges(() => {
      load();
    });
    return unsubscribe;
  }, []);

  function handlePrimaryAction() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (isAsesor) {
      router.push('/asesor/dashboard');
    } else {
      router.push('/usuario/home');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Bienvenido a Tigo Conecta</Text>
          <Text style={styles.title}>Catálogo de Planes</Text>
        </View>
        <Pressable style={styles.loginButton} onPress={handlePrimaryAction}>
          <Text style={styles.loginButtonText}>{headerActionLabel}</Text>
        </Pressable>
      </View>

      {isLoggedIn ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            Alert.alert('Cerrar sesión', '¿Deseas salir de la aplicación?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut() },
            ]);
          }}
        >
          <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
        </Pressable>
      ) : null}

      <FlatList
        data={plans}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PlanCard
            plan={item}
            onContract={!isAsesor ? handleContract : undefined}
            contractLabel={isLoggedIn ? 'Solicitar' : 'Ver detalles'}
          />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={
          !loading ? <Text style={styles.empty}>No hay planes disponibles</Text> : null
        }
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#111827',
    textAlign: 'center',
    fontWeight: '500',
  },
  empty: {
    padding: 20,
    textAlign: 'center',
    color: '#6B7280',
  },
});
// app/index.tsx