const { PRODUCT_CATALOG_API_KEY } = process.env;

module.exports = function(req, res, next) {
  if (req.headers['x-api-key'] !== PRODUCT_CATALOG_API_KEY) {
    res.redirect(401, 'http://localhost:3000');
  }
  next();
};
