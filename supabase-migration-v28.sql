-- DocLingo AI V28 secure admin foundation
alter table public.profiles add column if not exists role text not null default 'user' check (role in ('user','admin'));

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.admin_platform_stats()
returns table(total_users bigint,total_credits bigint,total_tool_uses bigint,total_ai_results bigint)
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  return query select
    (select count(*) from public.profiles),
    (select coalesce(sum(credits),0) from public.profiles),
    (select count(*) from public.tool_usage),
    (select count(*) from public.ai_results);
end;$$;

create or replace function public.admin_list_users(row_limit integer default 50)
returns table(id uuid,email text,full_name text,credits integer,role text,created_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  return query select p.id,p.email,p.full_name,p.credits,p.role,p.created_at from public.profiles p order by p.created_at desc limit least(greatest(row_limit,1),100);
end;$$;

create or replace function public.admin_adjust_credits(target_user uuid,credit_delta integer,adjustment_reason text)
returns integer language plpgsql security definer set search_path=public as $$
declare new_balance integer;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if credit_delta=0 or abs(credit_delta)>1000 then raise exception 'Invalid credit adjustment'; end if;
  if char_length(trim(adjustment_reason))<3 then raise exception 'Reason is required'; end if;
  update public.profiles set credits=credits+credit_delta,updated_at=now() where id=target_user and credits+credit_delta>=0 returning credits into new_balance;
  if new_balance is null then raise exception 'User not found or balance would be negative'; end if;
  insert into public.credit_transactions(user_id,amount,transaction_type,description) values(target_user,credit_delta,'admin',left(trim(adjustment_reason),200));
  return new_balance;
end;$$;

revoke all on function public.admin_platform_stats() from public;
revoke all on function public.admin_list_users(integer) from public;
revoke all on function public.admin_adjust_credits(uuid,integer,text) from public;
grant execute on function public.admin_platform_stats() to authenticated;
grant execute on function public.admin_list_users(integer) to authenticated;
grant execute on function public.admin_adjust_credits(uuid,integer,text) to authenticated;

-- IMPORTANT: replace the email below with your own Supabase login email, then Run once.
-- update public.profiles set role='admin' where email='YOUR_EMAIL@example.com';

NOTIFY pgrst, 'reload schema';
