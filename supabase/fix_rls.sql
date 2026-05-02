-- ============================================================
-- FIX: Recursive RLS policies → use SECURITY DEFINER function
-- Run this in Supabase SQL Editor
-- ============================================================

-- Helper function that bypasses RLS to check current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- DROP all old policies
-- ============================================================

DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;

DROP POLICY IF EXISTS "portfolios_read_public" ON portfolios;
DROP POLICY IF EXISTS "portfolios_insert_affiliate" ON portfolios;
DROP POLICY IF EXISTS "portfolios_update" ON portfolios;
DROP POLICY IF EXISTS "portfolios_delete_admin" ON portfolios;

DROP POLICY IF EXISTS "portfolio_pages_read" ON portfolio_pages;
DROP POLICY IF EXISTS "portfolio_pages_write" ON portfolio_pages;

DROP POLICY IF EXISTS "portfolio_pins_read" ON portfolio_pins;
DROP POLICY IF EXISTS "portfolio_pins_write" ON portfolio_pins;

DROP POLICY IF EXISTS "banner_ads_read" ON banner_ads;
DROP POLICY IF EXISTS "banner_ads_admin" ON banner_ads;

DROP POLICY IF EXISTS "portfolio_views_insert" ON portfolio_views;
DROP POLICY IF EXISTS "portfolio_views_read" ON portfolio_views;

DROP POLICY IF EXISTS "notifications_read" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;

DROP POLICY IF EXISTS "review_checklists_admin" ON review_checklists;
DROP POLICY IF EXISTS "review_checklists_read_affiliate" ON review_checklists;

DROP POLICY IF EXISTS "kpi_settings_read" ON kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_admin" ON kpi_settings;

DROP POLICY IF EXISTS "affiliate_payments_read" ON affiliate_payments;
DROP POLICY IF EXISTS "affiliate_payments_admin" ON affiliate_payments;

-- ============================================================
-- RECREATE policies using get_my_role() (no recursion)
-- ============================================================

-- Profiles
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT
  USING (auth.uid() = id OR get_my_role() = 'admin');

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id OR get_my_role() = 'admin');

CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE
  USING (get_my_role() = 'admin');

-- Portfolios
CREATE POLICY "portfolios_read_public" ON portfolios FOR SELECT
  USING (
    (status = 'approved' AND is_visible = true)
    OR auth.uid() = affiliate_id
    OR get_my_role() = 'admin'
  );

CREATE POLICY "portfolios_insert_affiliate" ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = affiliate_id AND get_my_role() = 'affiliate');

CREATE POLICY "portfolios_update" ON portfolios FOR UPDATE
  USING (auth.uid() = affiliate_id OR get_my_role() = 'admin');

CREATE POLICY "portfolios_delete_admin" ON portfolios FOR DELETE
  USING (get_my_role() = 'admin');

-- Portfolio pages
CREATE POLICY "portfolio_pages_read" ON portfolio_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_id
      AND (portfolios.status = 'approved' OR portfolios.affiliate_id = auth.uid())
    )
    OR get_my_role() = 'admin'
  );

CREATE POLICY "portfolio_pages_write" ON portfolio_pages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.affiliate_id = auth.uid())
    OR get_my_role() = 'admin'
  );

-- Portfolio pins
CREATE POLICY "portfolio_pins_read" ON portfolio_pins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_id
      AND (portfolios.status = 'approved' OR portfolios.affiliate_id = auth.uid())
    )
    OR get_my_role() = 'admin'
  );

CREATE POLICY "portfolio_pins_write" ON portfolio_pins FOR ALL
  USING (
    EXISTS (SELECT 1 FROM portfolios WHERE portfolios.id = portfolio_id AND portfolios.affiliate_id = auth.uid())
    OR get_my_role() = 'admin'
  );

-- Banner ads
CREATE POLICY "banner_ads_read" ON banner_ads FOR SELECT
  USING (is_visible = true OR get_my_role() = 'admin');

CREATE POLICY "banner_ads_admin" ON banner_ads FOR ALL
  USING (get_my_role() = 'admin');

-- Portfolio views
CREATE POLICY "portfolio_views_insert" ON portfolio_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "portfolio_views_read" ON portfolio_views FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'affiliate'));

-- Notifications
CREATE POLICY "notifications_read" ON notifications FOR SELECT
  USING (
    target_user_id = auth.uid()
    OR target_type IN ('all', 'students', 'affiliates')
    OR get_my_role() = 'admin'
  );

CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  USING (target_user_id = auth.uid() OR get_my_role() = 'admin');

-- Review checklists
CREATE POLICY "review_checklists_admin" ON review_checklists FOR ALL
  USING (get_my_role() = 'admin');

CREATE POLICY "review_checklists_read_affiliate" ON review_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_id AND portfolios.affiliate_id = auth.uid()
    )
  );

-- KPI settings
CREATE POLICY "kpi_settings_read" ON kpi_settings FOR SELECT USING (true);
CREATE POLICY "kpi_settings_admin" ON kpi_settings FOR ALL
  USING (get_my_role() = 'admin');

-- Affiliate payments
CREATE POLICY "affiliate_payments_read" ON affiliate_payments FOR SELECT
  USING (affiliate_id = auth.uid() OR get_my_role() = 'admin');

CREATE POLICY "affiliate_payments_admin" ON affiliate_payments FOR ALL
  USING (get_my_role() = 'admin');
