
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{profile?.rol}</Text>
      </View>
      <Pressable style={styles.button} onPress={() => router.push('/reset-password')}>
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  label: { color: '#6B7280', fontSize: 12, textTransform: 'uppercase', marginTop: 8 },
  value: { fontSize: 16, fontWeight: '500' },
  button: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#1D4ED8', fontWeight: '600' },
  logout: { backgroundColor: '#FEE2E2' },
  logoutText: { color: '#DC2626', fontWeight: '600' },
});

