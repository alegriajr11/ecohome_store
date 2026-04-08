const pool = require("../config/db");

async function getProducts({ limit, offset }) {
  const query = `
    SELECT id, name, price, created_at, updated_at
    FROM products
    ORDER BY id ASC
    LIMIT $1 OFFSET $2
  `;
  const { rows } = await pool.query(query, [limit, offset]);
  return rows;
}

async function getProductById(id) {
  const query = `
    SELECT id, name, price, created_at, updated_at
    FROM products
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

async function createProduct({ name, price }) {
  const query = `
    INSERT INTO products (name, price)
    VALUES ($1, $2)
    RETURNING id, name, price, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [name, price]);
  return rows[0];
}

async function updateProduct(id, { name, price }) {
  const query = `
    UPDATE products
    SET name = $1,
        price = $2,
        updated_at = now()
    WHERE id = $3
    RETURNING id, name, price, created_at, updated_at
  `;
  const { rows } = await pool.query(query, [name, price, id]);
  return rows[0] || null;
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
    RETURNING id, name, price, created_at, updated_at
  `;
  values.push(id);

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

async function deleteProduct(id) {
  const query = `
    DELETE FROM products
    WHERE id = $1
    RETURNING id, name
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
  deleteProduct
};
