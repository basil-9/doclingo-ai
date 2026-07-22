create index if not exists idx_credit_transactions_user_created on public.credit_transactions(user_id, created_at desc);
create index if not exists idx_tool_usage_user_created on public.tool_usage(user_id, created_at desc);
create index if not exists idx_ai_results_user_created on public.ai_results(user_id, created_at desc);
NOTIFY pgrst, 'reload schema';
