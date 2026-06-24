-- Run this SQL in Supabase SQL Editor (once)
create extension if not exists vector;

create table if not exists graph_nodes (
    id text primary key,
    type text not null,
    label text not null,
    properties jsonb default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_graph_nodes_type on graph_nodes(type);

create table if not exists vector_memories (
    id text primary key,
    text_content text not null,
    metadata jsonb default '{}',
    embedding vector(384),
    created_at timestamptz default now()
);

create or replace function match_memories(
    query_embedding vector(384),
    match_threshold float default 0.25,
    match_count int default 12
) returns table (
    id text,
    text_content text,
    metadata jsonb,
    similarity float
) language plpgsql as $$
begin
    return query
    select
        vm.id,
        vm.text_content,
        vm.metadata,
        1 - (vm.embedding <=> query_embedding) as similarity
    from vector_memories vm
    where 1 - (vm.embedding <=> query_embedding) > match_threshold
    order by vm.embedding <=> query_embedding
    limit match_count;
end;
$$;
