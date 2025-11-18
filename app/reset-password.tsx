import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { requestPasswordReset } = useAuth();

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Campo requerido', 'Ingresa tu correo');
      return;
    }
    setSending(true);
    const result = await requestPasswordReset(email.trim());
    setSending(false);
    if (!result.success) {
      Alert.alert('Error', result.error ?? 'Intenta más tarde');
      return;
    }
    Alert.alert('Correo enviado', 'Revisa tu bandeja para restablecer tu contraseña');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restablecer contraseña</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <Pressable style={[styles.button, sending && styles.disabled]} onPress={handleSend} disabled={sending}>
        <Text style={styles.buttonText}>{sending ? 'Enviando...' : 'Enviar enlace'}</Text>
      </Pressable>

      <Pressable style={styles.linkButton} onPress={() => router.back()}>
        <Text style={styles.linkButtonText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  linkButton: {
    padding: 15,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#2563EB',
    fontSize: 15,
  },
});

