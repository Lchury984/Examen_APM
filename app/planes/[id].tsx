import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlansRepository } from '../../src/data/repositories/plansRepository';
import { Plan } from '../../src/domain/models/Plan';
import { getPublicImageUrl } from '../../src/services/storageService';
import { useAuth } from '../../src/context/AuthContext';
import { ContractsRepository } from '../../src/data/repositories/contractsRepository';

const plansRepo = new PlansRepository();
const contractsRepo = new ContractsRepository();

export default function PlanDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const isAsesor = profile?.rol === 'asesor_comercial';

  useEffect(() => {
    if (!params.id) return;
    plansRepo
      .getPlanById(params.id)
      .then((data) => setPlan(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleContract() {
    if (!plan) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (isAsesor) {
      router.push({ pathname: '/asesor/plan-form', params: { planId: plan.id } });
      return;
    }
    try {
      await contractsRepo.create(plan.id, user.id);
      Alert.alert('Solicitud enviada', 'Un asesor atenderá tu contratación.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text>Plan no disponible.</Text>
      </View>
    );
  }

  const imageUrl = getPublicImageUrl(plan.imagen_path);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{plan.nombre}</Text>
      <Text style={styles.price}>${plan.precio}/mes</Text>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.text}>{plan.descripcion ?? 'Sin descripción'}</Text>
      <Text style={styles.sectionTitle}>Características</Text>
      {plan.segmento ? <Text style={styles.item}>Segmento: {plan.segmento}</Text> : null}
      {plan.publico_objetivo ? <Text style={styles.item}>Público objetivo: {plan.publico_objetivo}</Text> : null}
      {plan.datos_moviles ? <Text style={styles.item}>Datos móviles: {plan.datos_moviles}</Text> : null}
      {plan.minutos_voz ? <Text style={styles.item}>Minutos voz: {plan.minutos_voz}</Text> : null}
      {plan.sms ? <Text style={styles.item}>SMS: {plan.sms}</Text> : null}
      {plan.velocidad ? <Text style={styles.item}>Velocidad: {plan.velocidad}</Text> : null}
      {plan.redes_sociales ? <Text style={styles.item}>Redes sociales: {plan.redes_sociales}</Text> : null}
      {plan.whatsapp ? <Text style={styles.item}>WhatsApp: {plan.whatsapp}</Text> : null}
      {plan.llamadas_internacionales ? <Text style={styles.item}>Llamadas internacionales: {plan.llamadas_internacionales}</Text> : null}
      {plan.roaming ? <Text style={styles.item}>Roaming: {plan.roaming}</Text> : null}

      <Pressable style={styles.button} onPress={handleContract}>
        <Text style={styles.buttonText}>{isAsesor ? 'Editar plan' : user ? 'Contratar' : 'Inicia sesión para contratar'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700' },
  price: { fontSize: 20, color: '#2563EB', marginBottom: 12 },
  image: { width: '100%', height: 220, borderRadius: 16, marginBottom: 16 },
  sectionTitle: { fontWeight: '700', marginTop: 16, marginBottom: 4 },
  text: { color: '#374151' },
  item: { marginBottom: 4, color: '#111827' },
  button: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

