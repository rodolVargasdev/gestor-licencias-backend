-- Update NULL values in codigo column
UPDATE tipos_licencias 
SET codigo = 'TEMP-' || id::text 
WHERE codigo IS NULL;

-- Truncate any codes longer than 10 characters
UPDATE tipos_licencias 
SET codigo = LEFT(codigo, 10)
WHERE LENGTH(codigo) > 10;

-- Add length constraint to codigo column
ALTER TABLE tipos_licencias 
ALTER COLUMN codigo TYPE varchar(10);

-- Add NOT NULL constraint
ALTER TABLE tipos_licencias 
ALTER COLUMN codigo SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'tipos_licencias_codigo_key'
    ) THEN
        ALTER TABLE tipos_licencias 
        ADD CONSTRAINT tipos_licencias_codigo_key UNIQUE (codigo);
    END IF;
END $$; 