const pool = require("../config/db");

/**
 * Formato de respuesta API: campos de producto + creator (auditoría).
 * Ignora columnas internas del JOIN (creator_id / creator_username crudos).
 */
function toProductDto(row) {
  if (!row) return null;
  const cid = row.creator_id;
  const hasCreator =
    cid !== undefined && cid !== null && String(cid).length > 0;
  const creator = hasCreator
    ? {
        id: Number(cid),
        username: row.creator_username ?? null
      }
    : null;
  return {
    id: row.id != null ? Number(row.id) : row.id,
    name: row.name,
    price: row.price,
    created_at: row.created_at,
    updated_at: row.updated_at,
    created_by:
      row.created_by !== undefined && row.created_by !== null
        ? Number(row.created_by)
        : null,
    creator
  };
}

async function getProducts({ limit, offset }) {
  const query = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.created_at,
      p.updated_at,
      p.created_by,
      u.id AS creator_id,
      u.username AS creator_username
    FROM products p
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.id DESC
    LIMIT $1 OFFSET $2
  `;
  const { rows } = await pool.query(query, [limit, offset]);
  return rows.map(toProductDto);
}

async function getProductById(id) {
  const query = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.created_at,
      p.updated_at,
      p.created_by,
      u.id AS creator_id,
      u.username AS creator_username
    FROM products p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [id]);
  return toProductDto(rows[0] || null);
}

async function createProduct({ name, price, createdByUserId }) {
  const query = `
    INSERT INTO products (name, price, created_by)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const { rows } = await pool.query(query, [name, price, createdByUserId]);
  if (!rows[0]) return null;
  return getProductById(rows[0].id);
}

async function updateProduct(id, { name, price }) {
  const query = `
    UPDATE products
    SET name = $1,
        price = $2,
        updated_at = now()
    WHERE id = $3
    RETURNING id
  `;
  const { rows } = await pool.query(query, [name, price, id]);
  if (!rows[0]) return null;
  return getProductById(id);
}

async function patchProduct(id, payload) {
  const fields = [];
  const values = [];
  let index = 1;

  if (payload.name !== undefined) {
    fields.push(`name = $${index++}`);
    values.push(payload.name);
  }

  if (payload.price !== undefined) {
    fields.push(`price = $${index++}`);
    values.push(payload.price);
  }

  if (fields.length === 0) {
    return getProductById(id);
  }

  fields.push("updated_at = now()");

  const query = `
    UPDATE products
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING id
  `;
  values.push(id);

  const { rows } = await pool.query(query, values);
  if (!rows[0]) return null;
  return getProductById(id);
}

async function countProductsByCreatedBy(userId) {
  const query = `
    SELECT COUNT(*)::int AS cnt
    FROM products
    WHERE created_by = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0] ? Number(rows[0].cnt) : 0;
}

async function deleteProduct(id) {
  const query = `
    DELETE FROM products
    WHERE id = $1
    RETURNING id, name, created_by
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  countProductsByCreatedBy,
  toProductDto
};
