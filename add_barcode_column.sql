-- ✅ Script SQL para agregar la columna 'barcode' a la tabla 'products'
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar la columna barcode (puede ser NULL ya que no todos los productos tienen barcode)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Crear un índice para mejorar las búsquedas por barcode
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Agregar un comentario descriptivo a la columna
COMMENT ON COLUMN products.barcode IS 'Código de barras del producto escaneado';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'barcode';
