// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="usuario/home" />
        <Stack.Screen name="usuario/contrataciones" />
        <Stack.Screen name="planes/[id]" />
        <Stack.Screen name="asesor/dashboard" />
        <Stack.Screen name="asesor/plan-form" />
        <Stack.Screen name="asesor/contrataciones" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="perfil" />
      </Stack>
    </AuthProvider>
  );
}