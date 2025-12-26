-- 워크아웃 세션 테이블 생성
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_order_index ON workout_sessions(order_index);

-- 기존 workouts 테이블에서 description, video_url 컬럼 제거 (선택사항)
-- 기존 데이터가 있다면 먼저 마이그레이션 후 실행
-- ALTER TABLE workouts DROP COLUMN IF EXISTS description;
-- ALTER TABLE workouts DROP COLUMN IF EXISTS video_url;

