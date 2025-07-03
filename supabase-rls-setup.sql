-- Add new tables for scalable target/scoring system

-- 1. Disciplines
create table if not exists disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

-- 2. Scoring Systems
create table if not exists scoring_systems (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logic jsonb not null
);

-- 3. Target Types
create table if not exists target_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  shape text not null, -- e.g. 'bullseye', 'silhouette', 'polygon', 'custom'
  zone_definitions jsonb not null,
  scoring_system_id uuid references scoring_systems(id)
);

-- 4. Update Targets table
alter table targets
  add column if not exists discipline_id uuid references disciplines(id),
  add column if not exists target_type_id uuid references target_types(id),
  add column if not exists zone_config jsonb;

-- Existing tables (sessions, shot_placements) remain unchanged

-- Indexes for performance
create index if not exists idx_targets_discipline_id on targets(discipline_id);
create index if not exists idx_targets_target_type_id on targets(target_type_id);
create index if not exists idx_target_types_scoring_system_id on target_types(scoring_system_id);
