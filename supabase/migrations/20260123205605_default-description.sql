-- Update existing NULL descriptions to empty string
UPDATE todo_items SET description = '' WHERE description IS NULL;

-- Alter column to NOT NULL with default empty string
ALTER TABLE todo_items
  ALTER COLUMN description SET DEFAULT '',
  ALTER COLUMN description SET NOT NULL;
