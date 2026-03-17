-- ================================================================
-- MASTER SPIRIT — Migração: Grupos de Estudo + Acesso por Sala
-- Rodar no Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ================================================================

-- 1. Grupos de Estudo
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_id TEXT NOT NULL,
  coordinator_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- 2. Membros do Grupo (máx 10 por grupo, controlado na API)
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('coordinator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 3. Convites por email
CREATE TABLE IF NOT EXISTS study_group_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, email)
);

-- 4. Acesso avulso a salas (R$ 9,90/mês por sala)
CREATE TABLE IF NOT EXISTS room_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  room_id TEXT NOT NULL,
  granted_via TEXT DEFAULT 'purchase' CHECK (granted_via IN ('purchase', 'invite', 'plan')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, room_id)
);

-- 5. Adicionar campos de voz na tabela existente
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS voice_count INT DEFAULT 0;
ALTER TABLE user_usage ADD COLUMN IF NOT EXISTS voice_reset_date DATE;

-- 6. RLS (Row Level Security) — proteger dados
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_access ENABLE ROW LEVEL SECURITY;

-- Políticas: usuário vê seus próprios dados
CREATE POLICY "Users can view groups they belong to" ON study_groups
  FOR SELECT USING (
    coordinator_id = auth.uid() OR
    id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Coordinators can insert groups" ON study_groups
  FOR INSERT WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators can update their groups" ON study_groups
  FOR UPDATE USING (coordinator_id = auth.uid());

CREATE POLICY "Users can view their memberships" ON study_group_members
  FOR SELECT USING (user_id = auth.uid() OR group_id IN (SELECT id FROM study_groups WHERE coordinator_id = auth.uid()));

CREATE POLICY "Users can view invites for their email" ON study_group_invites
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    invited_by = auth.uid()
  );

CREATE POLICY "Users can view their room access" ON room_access
  FOR SELECT USING (user_id = auth.uid());

-- Service role pode tudo (usado pela API server-side)
-- Não precisa de policy adicional pois a API usa SUPABASE_SERVICE_KEY
