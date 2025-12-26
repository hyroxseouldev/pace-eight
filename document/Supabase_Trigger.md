```jsx
-- 1. 새로운 유저를 위한 프로필 생성 함수
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name', -- 소셜 로그인 시 이름
    new.raw_user_meta_data->>'avatar_url', -- 소셜 로그인 시 프로필 사진
    'subscriber' -- 기본 역할은 구독자로 설정
  );
  return new;
end;
$$;
```

```jsx
-- 2. auth.users 테이블에 유저가 추가되면 함수 실행
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Supabase의 `auth.users` 테이블에 유저가 가입될 때, 우리가 만든 `public.profiles` 테이블에 자동으로 데이터를 넣어주는 **Database Trigger** SQL입니다.

이 코드를 Supabase 대시보드의 **SQL Editor**에 복사해서 실행하세요.
