-- Supabase SQL setup for Tigo Conecta (execute in SQL editor)
-- Tables: perfiles, planes_moviles, contrataciones, mensajes_chat
create table if not exists perfiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  rol text not null check (rol in ('asesor_comercial','usuario_registrado')),
  nombre text,
  created_at timestamptz default now()
);

create table if not exists planes_moviles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric not null,
  descripcion text,
  segmento text,
  publico_objetivo text,
  datos_moviles text,
  minutos_voz text,
  sms text,
  velocidad text,
  redes_sociales text,
  whatsapp text,
  llamadas_internacionales text,
  roaming text,
  activo boolean default true,
  imagen_path text,
  created_at timestamptz default now()
);

create table if not exists contrataciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references planes_moviles(id) on delete cascade,
  estado text default 'pendiente' check (estado in ('pendiente','en_proceso','aprobado','rechazado')),
  created_at timestamptz default now()
);

create table if not exists mensajes_chat (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null,
  user_id uuid references auth.users(id),
  sender_rol text check (sender_rol in ('asesor_comercial','usuario_registrado')),
  content text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table planes_moviles enable row level security;
alter table contrataciones enable row level security;
alter table mensajes_chat enable row level security;

-- Policies for planes_moviles
create policy if not exists "asesor_planes_all" on planes_moviles
  for all
  using (exists (select 1 from perfiles p where p.user_id = auth.uid() and p.rol = 'asesor_comercial'))
  with check (exists (select 1 from perfiles p where p.user_id = auth.uid() and p.rol = 'asesor_comercial'));

create policy if not exists "usuarios_planes_select" on planes_moviles
  for select
  using (activo = true);

-- Policies for contrataciones
create policy if not exists "usuarios_contrataciones_select" on contrataciones
  for select
  using (user_id = auth.uid());

create policy if not exists "usuarios_contrataciones_insert" on contrataciones
  for insert
  with check (user_id = auth.uid());

create policy if not exists "usuarios_contrataciones_update" on contrataciones
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "asesores_contrataciones_manage" on contrataciones
  for all
  using (exists (select 1 from perfiles p where p.user_id = auth.uid() and p.rol = 'asesor_comercial'));

-- Policies for mensajes_chat
create policy if not exists "chat_insert_authenticated" on mensajes_chat
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "chat_select_room" on mensajes_chat
  for select
  using (auth.uid() = user_id or exists (select 1 from perfiles p where p.user_id = auth.uid() and p.rol = 'asesor_comercial'));

-- Storage instructions:
-- 1. Crear bucket 'planes-imagenes' (público).
-- 2. Política de objeto: solo asesores (rol) pueden subir/eliminar. Cualquier usuario puede leer URLs públicas.
