-- DocLingo AI V27 account settings
create or replace function public.update_profile_name(new_name text) returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); cleaned text := trim(new_name);
begin
  if uid is null then raise exception 'Sign in required'; end if;
  if char_length(cleaned) < 2 or char_length(cleaned) > 80 then raise exception 'Name must be between 2 and 80 characters'; end if;
  if cleaned ~ '[<>]' then raise exception 'Name contains unsupported characters'; end if;
  update public.profiles set full_name=cleaned,updated_at=now() where id=uid;
  return cleaned;
end;$$;
revoke all on function public.update_profile_name(text) from public;
grant execute on function public.update_profile_name(text) to authenticated;
NOTIFY pgrst, 'reload schema';
