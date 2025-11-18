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
  segmento: '',
  publico_objetivo: '',
  datos_moviles: '',
  minutos_voz: '',
  sms: '',
  velocidad: '',
  redes_sociales: '',
  whatsapp: '',
  llamadas_internacionales: '',
  roaming: '',
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
            segmento: data.segmento ?? '',
            publico_objetivo: data.publico_objetivo ?? '',
            datos_moviles: data.datos_moviles ?? '',
            minutos_voz: data.minutos_voz ?? '',
            sms: data.sms ?? '',
            velocidad: data.velocidad ?? '',
            redes_sociales: data.redes_sociales ?? '',
            whatsapp: data.whatsapp ?? '',
            llamadas_internacionales: data.llamadas_internacionales ?? '',
            roaming: data.roaming ?? '',
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
      segmento: normalize(form.segmento),
      publico_objetivo: normalize(form.publico_objetivo),
      datos_moviles: normalize(form.datos_moviles),
      minutos_voz: normalize(form.minutos_voz),
      sms: normalize(form.sms),
      velocidad: normalize(form.velocidad),
      redes_sociales: normalize(form.redes_sociales),
      whatsapp: normalize(form.whatsapp),
      llamadas_internacionales: normalize(form.llamadas_internacionales),
      roaming: normalize(form.roaming),
      activo: form.activo,
      imagenUri: imageUri ?? undefined,
    };

    try {
      if (isEdit && params.planId) {
        await repo.update(params.planId, payload as any);
      } else {
        await repo.create(payload as any);
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Editar plan' : 'Crear plan'}</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={form.nombre} onChangeText={(text) => handleChange('nombre', text)} />
      <TextInput style={styles.input} placeholder="Precio" keyboardType="decimal-pad" value={form.precio} onChangeText={(text) => handleChange('precio', text)} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Descripción"
        value={form.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        multiline
      />
      <Pressable style={[styles.toggle, form.activo ? styles.toggleOn : styles.toggleOff]} onPress={() => setForm((prev) => ({ ...prev, activo: !prev.activo }))}>
        <Text style={styles.toggleText}>Plan activo: {form.activo ? 'Sí' : 'No'}</Text>
      </Pressable>
      <TextInput style={styles.input} placeholder="Segmento" value={form.segmento} onChangeText={(text) => handleChange('segmento', text)} />
      <TextInput
        style={styles.input}
        placeholder="Público objetivo"
        value={form.publico_objetivo}
        onChangeText={(text) => handleChange('publico_objetivo', text)}
      />
      <TextInput style={styles.input} placeholder="Datos móviles" value={form.datos_moviles} onChangeText={(text) => handleChange('datos_moviles', text)} />
      <TextInput style={styles.input} placeholder="Minutos voz" value={form.minutos_voz} onChangeText={(text) => handleChange('minutos_voz', text)} />
      <TextInput style={styles.input} placeholder="SMS" value={form.sms} onChangeText={(text) => handleChange('sms', text)} />
      <TextInput style={styles.input} placeholder="Velocidad" value={form.velocidad} onChangeText={(text) => handleChange('velocidad', text)} />
      <TextInput
        style={styles.input}
        placeholder="Redes sociales"
        value={form.redes_sociales}
        onChangeText={(text) => handleChange('redes_sociales', text)}
      />
      <TextInput style={styles.input} placeholder="WhatsApp" value={form.whatsapp} onChangeText={(text) => handleChange('whatsapp', text)} />
      <TextInput
        style={styles.input}
        placeholder="Llamadas Internacionales"
        value={form.llamadas_internacionales}
        onChangeText={(text) => handleChange('llamadas_internacionales', text)}
      />
      <TextInput style={styles.input} placeholder="Roaming" value={form.roaming} onChangeText={(text) => handleChange('roaming', text)} />

      <Pressable style={styles.imageButton} onPress={handlePickImage}>
        <Text style={styles.imageButtonText}>{imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
      </Pressable>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      {!imageUri && existingImage ? <Image source={{ uri: existingImage }} style={styles.preview} /> : null}
      {!imageUri && plan?.imagen_path ? (
        <Text style={styles.helper}>Se conservará la imagen actual si no seleccionas una nueva.</Text>
      ) : null}

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{isEdit ? 'Guardar cambios' : 'Crear plan'}</Text>
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  helper: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  toggle: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  toggleOn: {
    backgroundColor: '#DCFCE7',
  },
  toggleOff: {
    backgroundColor: '#FEE2E2',
  },
  toggleText: {
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

