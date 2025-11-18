# Tigo Conecta - Expo (Advanced)
Proyecto base preparado para el Examen I - Tigo Conecta.

## Objetivo
Implementa autenticación con Supabase, CRUD de planes, chat realtime, storage, roles y RLS.

## Cómo usar
1. Extrae el ZIP.
2. Crea un archivo `.env` y define:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
3. Ejecuta el script `sql/setup.sql` en el editor SQL de Supabase para crear tablas, columnas extendidas y políticas RLS (incluye storage).
4. Crea el bucket público `planes-imagenes` en Supabase Storage y limita las escrituras a asesores.
5. `npm install`
6. `npx expo start`
7. Escanea con Expo Go

## Archivos importantes
- `src/services/supabase.ts` - cliente Supabase
- `sql/setup.sql` - script para crear tablas, roles y RLS policies
- Rutas: `app/` contiene pantallas con `expo-router`.

## Roles & vistas
- **Invitado**: onboarding/catalogo, detalle de plan y login/registro.
- **Usuario registrado**: home, catálogo con contratación, historial, chat y perfil.
- **Asesor**: dashboard con CRUD de planes (incluye subida de imágenes), gestión de contrataciones y chat en tiempo real.

## Notas
- La app usa `expo-router` + contexto de autenticación para restringir pantallas.
- Supabase Realtime actualiza catálogo y chats sin recargar.
- Storage valida límite de 5 MB y extensiones (JPG/PNG). Al actualizar un plan se elimina la imagen previa.
