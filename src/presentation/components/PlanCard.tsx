import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { Plan } from '../../domain/models/Plan';
import { getPublicImageUrl } from '../../services/storageService';

interface Props {
  plan: Plan;
  onContract?: (plan: Plan) => void;
  onEdit?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
  contractLabel?: string;
}

export function PlanCard({ plan, onContract, onEdit, onDelete, contractLabel }: Props) {
  const imageUrl = getPublicImageUrl(plan.imagen_path);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.nombre}</Text>
        <Text style={styles.price}>${plan.precio}/mes</Text>
      </View>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" /> : null}
      <Text style={styles.description}>{plan.descripcion}</Text>
      <View style={styles.meta}>
        {plan.segmento ? <Text style={styles.badge}>Segmento: {plan.segmento}</Text> : null}
        {plan.publico_objetivo ? <Text style={styles.badge}>Público: {plan.publico_objetivo}</Text> : null}
      </View>
      {onContract || onEdit || onDelete ? (
        <View style={styles.actions}>
          {onContract ? (
            <View style={styles.actionButton}>
              <Button title={contractLabel ?? 'Contratar'} onPress={() => onContract(plan)} />
            </View>
          ) : null}
          {onEdit ? (
            <View style={styles.actionButton}>
              <Button title="Editar" onPress={() => onEdit(plan)} />
            </View>
          ) : null}
          {onDelete ? (
            <View style={styles.actionButton}>
              <Button title="Eliminar" color="#ff3b30" onPress={() => onDelete(plan)} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#F3F4F6',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  meta: {
    marginBottom: 12,
  },
  badge: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
