-- ══════════════════════════════════════════
-- MASTER SPIRIT — Tabelas de Estudo
-- Rodar no Supabase SQL Editor
-- ══════════════════════════════════════════

-- Salas de estudo do usuário
CREATE TABLE IF NOT EXISTS study_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  objetivo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estudos em andamento (cada tema/livro sendo estudado)
CREATE TABLE IF NOT EXISTS user_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES study_rooms(id) ON DELETE SET NULL,
  theme_id TEXT NOT NULL,
  name TEXT NOT NULL,
  ref TEXT DEFAULT '',
  facilitador TEXT DEFAULT '',
  facil_nome TEXT DEFAULT '',
  mode TEXT DEFAULT 'livre' CHECK (mode IN ('livre', 'agendado')),
  schedule JSONB DEFAULT '{}',
  completed_sessions INT DEFAULT 0,
  total_sessions INT DEFAULT 16,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessões concluídas (histórico de cada aula)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES user_studies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  session_title TEXT DEFAULT '',
  quiz_score INT DEFAULT 0,
  quiz_total INT DEFAULT 3,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_study_rooms_user ON study_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_studies_user ON user_studies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_studies_room ON user_studies(room_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_study ON study_sessions(study_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);

-- RLS (Row Level Security) — cada usuário só vê seus dados
ALTER TABLE study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users manage own rooms" ON study_rooms
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own studies" ON user_studies
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);
