-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- Tabla de Perfiles de Usuario (Localizado México)
create table public.perfiles (
    id uuid references auth.users on delete cascade primary key,
    nombre text not null,
    empresa text,
    rfc text check (rfc ~ '^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$'), -- Validación básica de RFC mexicano
    divisa text default 'MXN',
    creado_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
alter table public.perfiles enable row level security;

-- Políticas de Acceso Seguro (Runas de Protección)
create policy "Usuarios pueden leer su propio perfil" 
    on public.perfiles for select 
    using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil" 
    on public.perfiles for update 
    using (auth.uid() = id);

-- Trigger automático al crear usuario en Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.perfiles (id, nombre, rfc, divisa)
    values (new.id, coalesce(new.raw_user_meta_data->>'nombre', 'Usuario Nuevo'), null, 'MXN');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
