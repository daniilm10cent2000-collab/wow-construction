-- TGRAF AI Construction Platform — PostgreSQL schema
-- Run as standalone SQL. No ORM.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');
CREATE TYPE project_status AS ENUM ('draft', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'cancelled');

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  role       user_role NOT NULL DEFAULT 'viewer',
  password_hash VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disabled_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_disabled_at ON users (disabled_at) WHERE disabled_at IS NULL;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  code        VARCHAR(64) UNIQUE,
  status      project_status NOT NULL DEFAULT 'draft',
  created_by  UUID NOT NULL REFERENCES users (id),
  starts_at   DATE,
  ends_at     DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_created_by ON projects (created_by);
CREATE INDEX idx_projects_starts_at ON projects (starts_at);
CREATE INDEX idx_projects_ends_at ON projects (ends_at);

-- ---------------------------------------------------------------------------
-- budgets (one row per project + category / line)
-- ---------------------------------------------------------------------------
CREATE TABLE budgets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  category       VARCHAR(128) NOT NULL,
  amount_planned NUMERIC(14, 2) NOT NULL CHECK (amount_planned >= 0),
  amount_actual  NUMERIC(14, 2) CHECK (amount_actual IS NULL OR amount_actual >= 0),
  currency       CHAR(3) NOT NULL DEFAULT 'USD',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, category)
);

CREATE INDEX idx_budgets_project_id ON budgets (project_id);

-- ---------------------------------------------------------------------------
-- contractors
-- ---------------------------------------------------------------------------
CREATE TABLE contractors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  company       VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(64),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contractors_name ON contractors (name);

-- ---------------------------------------------------------------------------
-- project_contractors (many-to-many)
-- ---------------------------------------------------------------------------
CREATE TABLE project_contractors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors (id) ON DELETE CASCADE,
  role         VARCHAR(128),
  started_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  ended_at     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, contractor_id),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_project_contractors_project_id ON project_contractors (project_id);
CREATE INDEX idx_project_contractors_contractor_id ON project_contractors (contractor_id);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
CREATE TABLE tasks (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  title                VARCHAR(255) NOT NULL,
  description          TEXT,
  status               task_status NOT NULL DEFAULT 'todo',
  assigned_user_id     UUID REFERENCES users (id) ON DELETE SET NULL,
  assigned_contractor_id UUID REFERENCES contractors (id) ON DELETE SET NULL,
  due_date             DATE,
  completed_at         TIMESTAMPTZ,
  created_by           UUID NOT NULL REFERENCES users (id),
  parent_id            UUID REFERENCES tasks (id) ON DELETE CASCADE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (assigned_user_id IS NULL OR assigned_contractor_id IS NULL)
);

CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_assigned_user_id ON tasks (assigned_user_id);
CREATE INDEX idx_tasks_assigned_contractor_id ON tasks (assigned_contractor_id);
CREATE INDEX idx_tasks_due_date ON tasks (due_date);
CREATE INDEX idx_tasks_parent_id ON tasks (parent_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at (EXECUTE PROCEDURE for PG < 14 compatibility)
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER contractors_updated_at
  BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER project_contractors_updated_at
  BEFORE UPDATE ON project_contractors FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
