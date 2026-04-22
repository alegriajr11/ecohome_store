-- Trazabilidad: producto asociado al usuario creador (auditoría).
-- FK ON DELETE SET NULL: si se elimina el usuario, el producto permanece.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS created_by INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_created_by_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END$$;
