const express = require('express');
const router = express.Router();

router.get('/branches/:id/products', function(req, res, next) {
  const roles = req.session.roles;

  if (roles && roles.includes('admin')) {
    res.json(`Products for branch #${req.params.id}`);
  } else {
    res.redirect(403, 'http://localhost:3000');
    return;
  }
});

module.exports = router;
