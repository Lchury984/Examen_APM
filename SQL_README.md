## SQL & RLS instructions

1. Abra su proyecto en Supabase.
2. Cree las tablas ejecutando `sql/setup.sql`.
3. En Storage, cree un bucket llamado `planes-imagenes` y marque público.
4. Añada policies más estrictas si lo requiere (ej: permitir subir solo a asesores).
5. Recuerde añadir perfiles en la tabla `perfiles` mapeando `user_id` a `auth.users(id)` con el rol correcto.
