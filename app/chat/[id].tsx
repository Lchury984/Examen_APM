import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { useAuth } from '../../src/context/AuthContext';

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_rol: 'asesor_comercial' | 'usuario_registrado';
  user_id: string;
};

export default function ChatRoom() {
  const params = useLocalSearchParams();
  const contratacionId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const { user, profile } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase
        .from('mensajes_chat')
        .select('*')
        .eq('contratacion_id', contratacionId)
        .order('created_at', { ascending: true });
      
      if (mounted && data) {
        setMessages(data as Message[]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }

    if (contratacionId) load();

    const subscription = supabase
      .channel(`chat_${contratacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(subscription);
    };
  }, [contratacionId]);

  async function send() {
    if (!text.trim() || !user || !profile?.rol || !contratacionId) return;

    const messageToSend = text.trim();
    setText('');

    await supabase.from('mensajes_chat').insert({
      contratacion_id: contratacionId,
      user_id: user.id,
      sender_rol: profile.rol,
      content: messageToSend,
    });
  }

  if (!contratacionId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró la conversación</Text>
      </View>
    );
  }

  const isAsesor = profile?.rol === 'asesor_comercial';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {isAsesor ? '💬 Conversación con Cliente' : '💬 Chat con Asesor'}
        </Text>
        <Text style={styles.subtitle}>Contratación #{contratacionId.slice(0, 8)}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isOwn = item.user_id === user?.id;
          return (
            <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
              <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
                <Text style={styles.sender}>
                  {isOwn ? 'Tú' : item.sender_rol === 'asesor_comercial' ? 'Asesor' : 'Cliente'}
                </Text>
                <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
                  {item.content}
                </Text>
                <Text style={[styles.time, isOwn && styles.ownTime]}>
                  {new Date(item.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe tu mensaje..."
          style={styles.input}
          multiline
          maxLength={500}
        />
        <Pressable 
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]} 
          onPress={send}
          disabled={!text.trim()}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#EF4444',
    fontSize: 16,
  },
  list: { 
    flexGrow: 1, 
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sender: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  time: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  ownTime: {
    color: '#DBEAFE',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});