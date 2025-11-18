import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { useAuth } from '../../src/context/AuthContext';

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_rol: 'asesor_comercial' | 'usuario_registrado';
};

export default function ChatRoom() {
  const params = useLocalSearchParams();
  const roomId = params.id as string | undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase
        .from('mensajes_chat')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (mounted) setMessages((data as Message[]) || []);
    }
    if (roomId) load();

    if (!roomId) return () => undefined;

    const subscription = supabase
      .channel(`room_${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes_chat', filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
    };
  }, [roomId]);

  async function send() {
    if (!text || !user || !profile?.rol || !roomId) return;
    await supabase
      .from('mensajes_chat')
      .insert({ room_id: roomId, user_id: user.id, sender_rol: profile.rol, content: text });
    setText('');
  }

  if (!roomId) {
    return (
      <View style={styles.container}>
        <Text>No se encontró la sala de chat.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat {roomId}</Text>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender_rol === 'usuario_registrado' ? styles.userMessage : styles.asesorMessage]}>
            <Text style={styles.sender}>{item.sender_rol === 'usuario_registrado' ? 'Tú' : 'Asesor'}</Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      <TextInput value={text} onChangeText={setText} placeholder="Escribe..." style={styles.input} />
      <Button title="Enviar" onPress={send} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  list: { flexGrow: 1, marginBottom: 12 },
  message: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#DBEAFE',
    alignSelf: 'flex-end',
  },
  asesorMessage: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
  },
  sender: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});
