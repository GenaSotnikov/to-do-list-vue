CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  demo_email TEXT := 'demo@todo.local';
  demo_password TEXT := '123123';
  demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Migrations are immutable in Supabase. This migration force-repairs
  -- the demo auth row so credentials are valid for GoTrue.

  DELETE FROM auth.identities
  WHERE user_id = demo_user_id
     OR (
       provider = 'email'
       AND (identity_data->>'email') = demo_email
     );

  DELETE FROM auth.users
  WHERE id = demo_user_id
     OR email = demo_email;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    demo_user_id,
    'authenticated',
    'authenticated',
    demo_email,
    extensions.crypt(demo_password, extensions.gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    '',
    FALSE,
    FALSE
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    extensions.gen_random_uuid(),
    demo_user_id,
    jsonb_build_object(
      'sub', demo_user_id::text,
      'email', demo_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    demo_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  UPDATE public.todo_items
  SET owner_id = demo_user_id
  WHERE owner_id IS NULL OR owner_id <> demo_user_id;
END $$;
