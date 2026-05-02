-- ============================================================
-- Pastport Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('student', 'admin', 'affiliate')) DEFAULT 'student',
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  school      TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PORTFOLIOS
-- ============================================================
CREATE TABLE portfolios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  owner_name      TEXT NOT NULL,
  faculty         TEXT NOT NULL,
  university      TEXT NOT NULL,
  school          TEXT NOT NULL,
  tags            TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  pdf_url         TEXT,
  is_admitted     BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL CHECK (status IN ('pending','under_review','approved','rejected','revision_needed')) DEFAULT 'pending',
  review_notes    TEXT,
  is_visible      BOOLEAN NOT NULL DEFAULT FALSE,
  view_count      INTEGER NOT NULL DEFAULT 0,
  like_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolios_status ON portfolios(status);
CREATE INDEX idx_portfolios_affiliate ON portfolios(affiliate_id);
CREATE INDEX idx_portfolios_faculty ON portfolios(faculty);
CREATE INDEX idx_portfolios_university ON portfolios(university);
CREATE INDEX idx_portfolios_visible ON portfolios(is_visible, status);
CREATE INDEX idx_portfolios_views ON portfolios(view_count DESC);

CREATE TRIGGER portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PORTFOLIO PAGES (audio per page)
-- ============================================================
CREATE TABLE portfolio_pages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  page_number  INTEGER NOT NULL,
  audio_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(portfolio_id, page_number)
);

CREATE INDEX idx_portfolio_pages_portfolio ON portfolio_pages(portfolio_id);

-- ============================================================
-- PORTFOLIO PINS
-- ============================================================
CREATE TABLE portfolio_pins (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  page_number  INTEGER NOT NULL,
  x_position   FLOAT NOT NULL DEFAULT 50,
  y_position   FLOAT NOT NULL DEFAULT 50,
  audio_url    TEXT,
  note_text    TEXT,
  note_link    TEXT,
  pin_type     TEXT NOT NULL CHECK (pin_type IN ('audio','note','both')) DEFAULT 'note',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_pins_portfolio ON portfolio_pins(portfolio_id);
CREATE INDEX idx_portfolio_pins_page ON portfolio_pins(portfolio_id, page_number);

-- ============================================================
-- BANNER ADS
-- ============================================================
CREATE TABLE banner_ads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  link_url    TEXT,
  position    TEXT NOT NULL CHECK (position IN ('top','bottom','sidebar','in_feed')) DEFAULT 'top',
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INTEGER NOT NULL DEFAULT 1,
  click_count INTEGER NOT NULL DEFAULT 0,
  view_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banner_ads_visible ON banner_ads(is_visible, position);
CREATE INDEX idx_banner_ads_order ON banner_ads(order_index);

CREATE TRIGGER banner_ads_updated_at BEFORE UPDATE ON banner_ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PORTFOLIO VIEWS (KPI tracking)
-- ============================================================
CREATE TABLE portfolio_views (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id     UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id       TEXT NOT NULL,
  pages_viewed     INTEGER[] DEFAULT '{}',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_views_portfolio ON portfolio_views(portfolio_id);
CREATE INDEX idx_portfolio_views_user ON portfolio_views(user_id);
CREATE INDEX idx_portfolio_views_created ON portfolio_views(created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_admin_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_type    TEXT NOT NULL CHECK (target_type IN ('all','students','affiliates','specific_user')),
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  message        TEXT NOT NULL,
  is_read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_target ON notifications(target_user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(target_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- REVIEW CHECKLISTS (Q1 Standard)
-- ============================================================
CREATE TABLE review_checklists (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES profiles(id),
  criteria     JSONB NOT NULL DEFAULT '{}',
  total_score  INTEGER NOT NULL DEFAULT 0,
  decision     TEXT NOT NULL CHECK (decision IN ('approved','rejected','revision_needed')),
  feedback     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_checklists_portfolio ON review_checklists(portfolio_id);

-- ============================================================
-- KPI SETTINGS
-- ============================================================
CREATE TABLE kpi_settings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  view_rate        FLOAT NOT NULL DEFAULT 0.5,
  completion_rate  FLOAT NOT NULL DEFAULT 2.0,
  like_rate        FLOAT NOT NULL DEFAULT 1.0,
  min_threshold    FLOAT NOT NULL DEFAULT 100.0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default KPI
INSERT INTO kpi_settings (view_rate, completion_rate, like_rate, min_threshold, is_active)
VALUES (0.5, 2.0, 1.0, 100.0, true);

-- ============================================================
-- AFFILIATE PAYMENTS
-- ============================================================
CREATE TABLE affiliate_payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id     UUID NOT NULL REFERENCES profiles(id),
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  total_views      INTEGER NOT NULL DEFAULT 0,
  total_completions INTEGER NOT NULL DEFAULT 0,
  total_likes      INTEGER NOT NULL DEFAULT 0,
  amount           FLOAT NOT NULL DEFAULT 0,
  status           TEXT NOT NULL CHECK (status IN ('pending','paid')) DEFAULT 'pending',
  kpi_data         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_affiliate_payments_affiliate ON affiliate_payments(affiliate_id);
CREATE INDEX idx_affiliate_payments_status ON affiliate_payments(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payments ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read own, admin can read all
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Portfolios: public can read approved visible, affiliates manage own, admins manage all
CREATE POLICY "portfolios_read_public" ON portfolios FOR SELECT
  USING (
    (status = 'approved' AND is_visible = true)
    OR auth.uid() = affiliate_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "portfolios_insert_affiliate" ON portfolios FOR INSERT
  WITH CHECK (
    auth.uid() = affiliate_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'affiliate')
  );

CREATE POLICY "portfolios_update" ON portfolios FOR UPDATE
  USING (
    auth.uid() = affiliate_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "portfolios_delete_admin" ON portfolios FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Portfolio pages & pins: public can read if portfolio is approved
CREATE POLICY "portfolio_pages_read" ON portfolio_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_id
      AND (portfolios.status = 'approved' OR portfolios.affiliate_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "portfolio_pages_write" ON portfolio_pages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.affiliate_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "portfolio_pins_read" ON portfolio_pins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_id
      AND (portfolios.status = 'approved' OR portfolios.affiliate_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "portfolio_pins_write" ON portfolio_pins FOR ALL
  USING (
    EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.affiliate_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Banner Ads: public can read visible, admin manages all
CREATE POLICY "banner_ads_read" ON banner_ads FOR SELECT
  USING (is_visible = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "banner_ads_admin" ON banner_ads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Portfolio Views: anyone can insert, admin/affiliate can read own
CREATE POLICY "portfolio_views_insert" ON portfolio_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "portfolio_views_read" ON portfolio_views FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'affiliate'))
  );

-- Notifications: users read own
CREATE POLICY "notifications_read" ON notifications FOR SELECT
  USING (
    target_user_id = auth.uid() OR
    target_type IN ('all', 'students', 'affiliates') OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (target_user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Review checklists: admin manages
CREATE POLICY "review_checklists_admin" ON review_checklists FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "review_checklists_read_affiliate" ON review_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_id AND portfolios.affiliate_id = auth.uid()
    )
  );

-- KPI Settings: admin manages, others read
CREATE POLICY "kpi_settings_read" ON kpi_settings FOR SELECT USING (true);
CREATE POLICY "kpi_settings_admin" ON kpi_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Affiliate payments: affiliate reads own, admin manages all
CREATE POLICY "affiliate_payments_read" ON affiliate_payments FOR SELECT
  USING (affiliate_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "affiliate_payments_admin" ON affiliate_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('portfolio-files', 'portfolio-files', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "portfolio_files_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-files');

CREATE POLICY "portfolio_files_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-files' AND auth.role() = 'authenticated');

CREATE POLICY "portfolio_files_delete" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio-files' AND (
      auth.uid()::text = (storage.foldername(name))[2] OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
