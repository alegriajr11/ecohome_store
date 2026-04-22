const productService = require("../services/productService");
const userService = require("../services/userService");

async function getProducts(req, res, next) {
  try {
    // Límite por defecto 100 para que productos nuevos no queden fuera de la primera página.
    const limit = Number(req.query.limit || 100);
    const offset = Number(req.query.offset || 0);
    const products = await productService.getProducts({ limit, offset });
    return res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { name, price } = req.body;
    const product = await productService.createProduct({
      name,
      price,
      createdByUserId: userId
    });

    console.log(
      `[${new Date().toISOString()}] create_product user_id=${userId} product_id=${product.id} created_by=${product.created_by}`
    );

    const io = req.app.get("io");
    if (io) {
      const creatorUser = await userService.findUserById(userId);
      const username = creatorUser?.username ?? req.user.email ?? "unknown";
      const product_count = await productService.countProductsByCreatedBy(userId);

      const flatProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        created_at: product.created_at,
        updated_at: product.updated_at,
        created_by: product.created_by,
        creator_id: product.creator?.id ?? userId,
        creator_username: product.creator?.username ?? username,
        creator: product.creator ?? { id: userId, username }
      };

      io.emit("product-created", { product: flatProduct });
      io.emit("user-stats-updated", { userId, username, product_count });
    }

    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function putProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, price } = req.body;
    const product = await productService.updateProduct(id, { name, price });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      `[${new Date().toISOString()}] update_product user_id=${req.user.id} product_id=${product.id}`
    );

    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

async function patchProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await productService.patchProduct(id, req.body);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      `[${new Date().toISOString()}] patch_product user_id=${req.user.id} product_id=${product.id}`
    );

    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const removed = await productService.deleteProduct(id);

    if (!removed) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(
      `[${new Date().toISOString()}] delete_product user_id=${req.user.id} product_id=${removed.id}`
    );

    return res.status(200).json({ message: "Product deleted", product: removed });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  putProduct,
  patchProduct,
  deleteProduct
};
