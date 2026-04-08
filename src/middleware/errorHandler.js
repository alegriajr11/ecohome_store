function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] Unhandled error`, err);

  if (err.code === "23505") {
    return res.status(400).json({ message: "Unique constraint violation" });
  }

  return res.status(500).json({ message: "Internal server error" });
}

module.exports = errorHandler;
