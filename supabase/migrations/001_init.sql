-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- ─── Documents ───────────────────────────────────────────────────────────────
create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null default 'default_user',
  name        text not null,
  type        text not null check (type in ('pdf', 'markdown', 'text')),
  size        bigint not null default 0,
  storage_path text,
  content     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Document Chunks (for RAG) ────────────────────────────────────────────────
create table if not exists document_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid references documents(id) on delete cascade,
  content      text not null,
  embedding    vector(1536),
  chunk_index  int not null default 0,
  created_at   timestamptz not null default now()
);

-- Vector similarity search index
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ─── Notes ────────────────────────────────────────────────────────────────────
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null default 'default_user',
  title      text not null default 'Untitled Note',
  content    text not null default '',
  tags       text[] not null default '{}',
  category   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Chat History ─────────────────────────────────────────────────────────────
create table if not exists chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null default 'default_user',
  title      text not null default 'New Chat',
  mode       text not null check (mode in ('general', 'document')) default 'general',
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant', 'system')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- ─── Quizzes ──────────────────────────────────────────────────────────────────
create table if not exists quizzes (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null default 'default_user',
  title       text not null,
  document_id uuid references documents(id) on delete set null,
  topic       text,
  created_at  timestamptz not null default now()
);

create table if not exists quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid references quizzes(id) on delete cascade,
  question    text not null,
  options     jsonb not null default '[]',
  correct_idx int not null default 0,
  explanation text,
  created_at  timestamptz not null default now()
);

-- ─── Quiz Attempts / Error Book ──────────────────────────────────────────────
create table if not exists quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null default 'default_user',
  question_id  uuid references quiz_questions(id) on delete cascade,
  selected_idx int not null,
  is_correct   boolean not null,
  created_at   timestamptz not null default now()
);

-- ─── Learning Stats ───────────────────────────────────────────────────────────
create table if not exists learning_stats (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null default 'default_user',
  topic           text not null,
  mastery_score   float not null default 0,
  questions_asked int not null default 0,
  correct_answers int not null default 0,
  updated_at      timestamptz not null default now(),
  unique(user_id, topic)
);

-- ─── Helper function for similarity search ────────────────────────────────────
create or replace function match_chunks(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count     int    default 5
)
returns table (
  id          uuid,
  document_id uuid,
  content     text,
  similarity  float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;

-- ─── Updated_at trigger ──────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_documents_updated_at before update on documents
  for each row execute function update_updated_at();

create trigger set_notes_updated_at before update on notes
  for each row execute function update_updated_at();
