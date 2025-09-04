-- XNEMA Platform - Supabase Database Setup
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'creator', 'admin')),
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'cancelled', 'expired')),
    subscription_plan VARCHAR(20) CHECK (subscription_plan IN ('monthly', 'yearly', 'lifetime')),
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de conteúdo
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('movie', 'series', 'documentary')),
    genre TEXT[] NOT NULL DEFAULT '{}',
    release_year INTEGER NOT NULL,
    duration_minutes INTEGER,
    poster_url TEXT,
    video_url TEXT,
    quality VARCHAR(10) NOT NULL DEFAULT '1080p' CHECK (quality IN ('720p', '1080p', '4K')),
    is_premium BOOLEAN NOT NULL DEFAULT false,
    creator_id UUID REFERENCES users(id),
    views_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(2,1) NOT NULL DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de histórico de visualizações
CREATE TABLE IF NOT EXISTS user_watch_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- 4. Tabela de avaliações de usuários
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    rated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- 5. Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50) NOT NULL,
    transaction_id TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de sessões de pagamento
CREATE TABLE IF NOT EXISTS payment_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_is_premium ON content(is_premium);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content USING gin(genre);
CREATE INDEX IF NOT EXISTS idx_content_rating ON content(rating);
CREATE INDEX IF NOT EXISTS idx_content_views_count ON content(views_count);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content_id ON user_watch_history(content_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_watched_at ON user_watch_history(watched_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 8. Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_sessions_updated_at BEFORE UPDATE ON payment_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Função para incrementar views
CREATE OR REPLACE FUNCTION increment_views(content_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE content 
    SET views_count = views_count + 1 
    WHERE id = content_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Row Level Security (RLS) - Opcional, para maior segurança
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para usuários poderem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para histórico de visualizações
CREATE POLICY "Users can view own watch history" ON user_watch_history
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Política para avaliações
CREATE POLICY "Users can manage own ratings" ON user_ratings
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Política para pagamentos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- 11. Inserir dados de exemplo
INSERT INTO users (email, name, password_hash, role, is_premium, subscription_status, subscription_plan) VALUES
('admin@xnema.com', 'Administrador XNEMA', '$2a$10$example_hash', 'admin', true, 'active', 'lifetime'),
('demo@xnema.com', 'Usuário Demo', '$2a$10$example_hash', 'subscriber', true, 'active', 'monthly')
ON CONFLICT (email) DO NOTHING;

INSERT INTO content (title, description, type, genre, release_year, duration_minutes, quality, is_premium, rating) VALUES
('Filme Demo Premium', 'Um filme incrível disponível apenas para assinantes premium', 'movie', ARRAY['Action', 'Adventure'], 2024, 120, '4K', true, 4.8),
('Série Demo Gratuita', 'Uma série disponível para todos os usuários', 'series', ARRAY['Drama', 'Comedy'], 2023, 45, '1080p', false, 4.2),
('Documentário Natureza', 'Documentário sobre a vida selvagem', 'documentary', ARRAY['Documentary', 'Nature'], 2024, 90, '4K', true, 4.9),
('Comédia Clássica', 'Um clássico da comédia nacional', 'movie', ARRAY['Comedy'], 2020, 105, '1080p', false, 4.0),
('Drama Moderno', 'Drama contemporâneo premiado', 'movie', ARRAY['Drama'], 2023, 135, '4K', true, 4.7)
ON CONFLICT DO NOTHING;

-- 12. Verificar se tudo foi criado corretamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('users', 'content', 'user_watch_history', 'user_ratings', 'payments', 'payment_sessions')
ORDER BY tablename;

-- Mostrar contagem de registros
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
    'content' as table_name, COUNT(*) as count FROM content
UNION ALL
SELECT 
    'payments' as table_name, COUNT(*) as count FROM payments;

-- Script concluído com sucesso!
-- Agora você pode usar a aplicação XNEMA com o Supabase configurado.
