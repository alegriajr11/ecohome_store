const userService = require("../services/userService");
const productService = require("../services/productService");

/**
 * GET /users/me/stats — contador de productos creados por el usuario autenticado.
 */
async function getMeStats(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const product_count = await productService.countProductsByCreatedBy(userId);

    return res.status(200).json({
      success: true,
      data: {
        user: { id: user.id, username: user.username },
        product_count
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMeStats
};
