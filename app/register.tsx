import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<'usuario_registrado' | 'asesor_comercial'>('usuario_registrado');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !nombre) {
      Alert.alert('Campos incompletos', 'Completa todos los campos obligatorios');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validación', 'Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    const result = await signUp(email.trim(), password, nombre.trim(), telefono.trim(), rol);
    setSubmitting(false);
    
    if (!result.success) {
      Alert.alert('Error al registrarse', result.error ?? 'Intenta más tarde');
      return;
    }
    
    Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.');
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* Selector de Rol */}
      <Text style={styles.label}>Tipo de cuenta</Text>
      <View style={styles.rolSelector}>
        <Pressable
          style={[styles.rolButton, rol === 'usuario_registrado' && styles.rolButtonActive]}
          onPress={() => setRol('usuario_registrado')}
        >
          <Text style={[styles.rolButtonText, rol === 'usuario_registrado' && styles.rolButtonTextActive]}>
            Usuario
          </Text>
        </Pressable>
        <Pressable
          style={[styles.rolButton, rol === 'asesor_comercial' && styles.rolButtonActive]}
          onPress={() => setRol('asesor_comercial')}
        >
          <Text style={[styles.rolButtonText, rol === 'asesor_comercial' && styles.rolButtonTextActive]}>
            Asesor
          </Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="Nombre completo *"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />

      <TextInput
        placeholder="Teléfono (opcional)"
        value={telefono}
        onChangeText={setTelefono}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Contraseña *"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Confirmar Contraseña *"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      <Pressable 
        style={[styles.button, submitting && styles.disabled]} 
        onPress={handleRegister} 
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Volver al Login</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  rolSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rolButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  rolButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  rolButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  rolButtonTextActive: {
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});