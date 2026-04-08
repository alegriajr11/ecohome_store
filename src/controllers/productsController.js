const productService = require("../services/productService");

async function getProducts(req, res, next) {
  try {
    const limit = Number(req.query.limit || 50);
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
    const { name, price } = req.body;
    const product = await productService.createProduct({ name, price });

    console.log(
      `[${new Date().toISOString()}] create_product user_id=${req.user.id} product_id=${product.id}`
    );

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
