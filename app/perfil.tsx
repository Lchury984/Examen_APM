import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState(profile?.nombre ?? '');
  const [telefono, setTelefono] = useState(profile?.telefono ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ nombre, telefono });
    setSaving(false);
    
    if (!result.success) {
      Alert.alert('Error', result.error ?? 'No se pudo actualizar el perfil');
      return;
    }
    
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNombre(profile?.nombre ?? '');
    setTelefono(profile?.telefono ?? '');
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      
      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Correo</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>
            {profile?.rol === 'asesor_comercial' ? 'Asesor Comercial' : 'Usuario Registrado'}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          {isEditing ? (
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              placeholder="Ingresa tu nombre"
            />
          ) : (
            <Text style={styles.value}>{profile?.nombre || 'No especificado'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Teléfono</Text>
          {isEditing ? (
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              style={styles.input}
              placeholder="Ingresa tu teléfono"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{profile?.telefono || 'No especificado'}</Text>
          )}
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editButtons}>
          <Pressable 
            style={[styles.button, styles.saveButton, saving && styles.disabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Guardar</Text>
            )}
          </Pressable>
          <Pressable 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Editar perfil</Text>
        </Pressable>
      )}

      <Pressable style={[styles.button, styles.resetButton]} onPress={() => router.push('/reset-password')}>
        <Text style={styles.buttonText}>Restablecer contraseña</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.logout]}
        onPress={async () => {
          await signOut();
          router.replace('/');
        }}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 20 
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: { 
    color: '#6B7280', 
    fontSize: 12, 
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },
  value: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#2563EB',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButton: {
    backgroundColor: '#DBEAFE',
  },
  logout: { 
    backgroundColor: '#FEE2E2' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutText: { 
    color: '#DC2626', 
    fontWeight: '600',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
});