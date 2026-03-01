CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  demo_email TEXT := 'demo@todo.local';
  demo_password TEXT := '123123';
  demo_user_id UUID;
BEGIN
  SELECT id
  INTO demo_user_id
  FROM auth.users
  WHERE email = demo_email
  LIMIT 1;

  IF demo_user_id IS NULL THEN
    demo_user_id := '11111111-1111-1111-1111-111111111111';

    INSERT INTO auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      demo_user_id,
      'authenticated',
      'authenticated',
      demo_email,
      extensions.crypt(demo_password, extensions.gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW()
    );
  ELSE
    UPDATE auth.users
    SET
      encrypted_password = extensions.crypt(demo_password, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = demo_user_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.identities
    WHERE provider = 'email'
      AND user_id = demo_user_id
  ) THEN
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      demo_email,
      demo_user_id,
      jsonb_build_object('sub', demo_user_id::text, 'email', demo_email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  ALTER TABLE public.todo_items
    ADD COLUMN IF NOT EXISTS owner_id UUID;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'todo_items_owner_id_fkey'
  ) THEN
    ALTER TABLE public.todo_items
      ADD CONSTRAINT todo_items_owner_id_fkey
      FOREIGN KEY (owner_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;

  UPDATE public.todo_items
  SET owner_id = demo_user_id
  WHERE owner_id IS NULL;

  ALTER TABLE public.todo_items
    ALTER COLUMN owner_id SET DEFAULT auth.uid(),
    ALTER COLUMN owner_id SET NOT NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_todo_items_owner_id ON public.todo_items(owner_id);

ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS todo_items_select_own ON public.todo_items;
DROP POLICY IF EXISTS todo_items_insert_own ON public.todo_items;
DROP POLICY IF EXISTS todo_items_update_own ON public.todo_items;
DROP POLICY IF EXISTS todo_items_delete_own ON public.todo_items;

CREATE POLICY todo_items_select_own
  ON public.todo_items
  FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY todo_items_insert_own
  ON public.todo_items
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY todo_items_update_own
  ON public.todo_items
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY todo_items_delete_own
  ON public.todo_items
  FOR DELETE
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS subtasks_select_own ON public.subtasks;
DROP POLICY IF EXISTS subtasks_insert_own ON public.subtasks;
DROP POLICY IF EXISTS subtasks_update_own ON public.subtasks;
DROP POLICY IF EXISTS subtasks_delete_own ON public.subtasks;

CREATE POLICY subtasks_select_own
  ON public.subtasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.todo_items t
      WHERE t.id = subtasks.task_id
        AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY subtasks_insert_own
  ON public.subtasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.todo_items t
      WHERE t.id = subtasks.task_id
        AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY subtasks_update_own
  ON public.subtasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.todo_items t
      WHERE t.id = subtasks.task_id
        AND t.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.todo_items t
      WHERE t.id = subtasks.task_id
        AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY subtasks_delete_own
  ON public.subtasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.todo_items t
      WHERE t.id = subtasks.task_id
        AND t.owner_id = auth.uid()
    )
  );
