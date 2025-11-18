import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PlansRepository } from '../../src/data/repositories/plansRepository';
import { Plan } from '../../src/domain/models/Plan';
import { getPublicImageUrl } from '../../src/services/storageService';

const repo = new PlansRepository();

const defaultState = {
  nombre: '',
  precio: '',
  descripcion: '',
  datos_moviles: '',
  minutos_voz: '',
  promocion: '',
  activo: true,
};

export default function PlanFormScreen() {
  const params = useLocalSearchParams<{ planId?: string }>();
  const router = useRouter();
  const [form, setForm] = useState(defaultState);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const isEdit = Boolean(params.planId);
  const existingImage = plan?.imagen_path ? getPublicImageUrl(plan.imagen_path) : null;

  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();
    if (params.planId) {
      repo
        .getPlanById(params.planId)
        .then((data) => {
          setPlan(data);
          setForm({
            nombre: data.nombre,
            precio: data.precio.toString(),
            descripcion: data.descripcion ?? '',
            datos_moviles: data.datos_moviles ?? '',
            minutos_voz: data.minutos_voz ?? '',
            promocion: data.promocion ?? '',
            activo: data.activo,
          });
        })
        .catch(() => {
          Alert.alert('Error', 'No se pudo cargar el plan');
          router.back();
        });
    }
  }, [params.planId, router]);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!form.nombre.trim()) {
      Alert.alert('Validación', 'El nombre del plan es obligatorio');
      return;
    }

    const precioNumber = parseFloat(form.precio);
    if (Number.isNaN(precioNumber)) {
      Alert.alert('Validación', 'Ingresa un precio válido');
      return;
    }

    const normalize = (value: string) => (value.trim().length ? value : null);

    const payload = {
      nombre: form.nombre.trim(),
      precio: precioNumber,
      descripcion: normalize(form.descripcion),
      datos_moviles: normalize(form.datos_moviles),
      minutos_voz: normalize(form.minutos_voz),
      promocion: normalize(form.promocion),
      activo: form.activo,
      imagenUri: imageUri ?? undefined,
    };

    try {
      if (isEdit && params.planId) {
        await repo.update(params.planId, payload as any);
      } else {
        await repo.create(payload as any);
      }
      Alert.alert('Éxito', isEdit ? 'Plan actualizado' : 'Plan creado');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Editar Plan' : 'Crear Nuevo Plan'}</Text>
      
      <Text style={styles.sectionTitle}>Información Básica</Text>
      
      <Text style={styles.label}>Nombre del Plan *</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: Plan Smart 5GB" 
        value={form.nombre} 
        onChangeText={(text) => handleChange('nombre', text)} 
      />

      <Text style={styles.label}>Precio Mensual * (USD)</Text>
      <TextInput 
        style={styles.input} 
        placeholder="15.99" 
        keyboardType="decimal-pad" 
        value={form.precio} 
        onChangeText={(text) => handleChange('precio', text)} 
      />

      <Text style={styles.label}>Gigas de Datos *</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: 5GB" 
        value={form.datos_moviles} 
        onChangeText={(text) => handleChange('datos_moviles', text)} 
      />

      <Text style={styles.label}>Minutos en Llamadas *</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: 100 minutos" 
        value={form.minutos_voz} 
        onChangeText={(text) => handleChange('minutos_voz', text)} 
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Describe las características del plan..."
        value={form.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Promoción (Opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: ¡50% de descuento por 3 meses!"
        value={form.promocion}
        onChangeText={(text) => handleChange('promocion', text)}
      />

      <Pressable 
        style={[styles.toggle, form.activo ? styles.toggleOn : styles.toggleOff]} 
        onPress={() => setForm((prev) => ({ ...prev, activo: !prev.activo }))}
      >
        <Text style={styles.toggleText}>
          Plan {form.activo ? 'ACTIVO' : 'INACTIVO'}
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Imagen del Plan</Text>

      <Pressable style={styles.imageButton} onPress={handlePickImage}>
        <Text style={styles.imageButtonText}>
          {imageUri ? '✓ Cambiar imagen' : '📷 Seleccionar imagen'}
        </Text>
      </Pressable>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : existingImage ? (
        <Image source={{ uri: existingImage }} style={styles.preview} />
      ) : null}

      {!imageUri && plan?.imagen_path ? (
        <Text style={styles.helper}>
          Se conservará la imagen actual si no seleccionas una nueva
        </Text>
      ) : null}

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {isEdit ? '💾 Guardar Cambios' : '✨ Crear Plan'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#374151',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  imageButtonText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 16,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  helper: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  toggle: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#D1FAE5',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  toggleOff: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});