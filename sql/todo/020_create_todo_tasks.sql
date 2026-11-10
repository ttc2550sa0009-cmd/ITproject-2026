-- TODO アプリ V1 用テーブル
-- Neon SQL Editor で手動実行する。Git に保存する SQL と、手動実行は別工程にする。

CREATE TABLE IF NOT EXISTS todo_tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
