CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  demo_email TEXT := 'demo@todo.local';
  demo_password TEXT := '123123';
  demo_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
  DELETE FROM auth.identities i
  USING auth.users u
  WHERE i.user_id = u.id
    AND u.email = demo_email
    AND u.id <> demo_user_id;

  DELETE FROM auth.users
  WHERE email = demo_email
    AND id <> demo_user_id;

  IF EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = demo_user_id
  ) THEN
    UPDATE auth.users
    SET
      email = demo_email,
      encrypted_password = extensions.crypt(demo_password, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      recovery_sent_at = COALESCE(recovery_sent_at, NOW()),
      last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb),
      confirmation_token = '',
      email_change = '',
      email_change_token_new = '',
      recovery_token = '',
      updated_at = NOW()
    WHERE id = demo_user_id;
  ELSE
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
      recovery_token
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
      ''
    );
  END IF;

  DELETE FROM auth.identities
  WHERE user_id = demo_user_id
    AND provider = 'email';

  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    demo_user_id::text,
    demo_user_id,
    jsonb_build_object(
      'sub', demo_user_id::text,
      'email', demo_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  UPDATE public.todo_items
  SET owner_id = demo_user_id
  WHERE owner_id IS NULL OR owner_id <> demo_user_id;
END $$;
