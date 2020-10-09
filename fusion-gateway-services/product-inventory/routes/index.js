const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/branches/:id/products', function(req, res, next) {
  // TODO: Consider moving authorization logic to middleware.
  try {
    const authorization = req.headers.authorization;
    if (!authorization)
    {
      res.redirect(403, 'http://localhost:3000');
      return;
    }

    const token = authorization.split(' ')[1];
    if (!token)
    {
      res.redirect(403, 'http://localhost:3000');
      return;
    }

    // TODO: Obtain FusionAuth signing key from environment.
    var decoded = jwt.verify(token, 'AVnx4v4zlOo/Z657ZswYPDeHYGvG37e13oVz0X8xM8s=');
  } catch(err) {
    console.log('Error verifying access token: ' + err);
    res.redirect(403, 'http://localhost:3000');
    return;
  }

  console.log('decoded access token: ' + JSON.stringify(decoded));

  const roles = decoded.roles;
  if (roles && roles.includes('admin')) {
    res.json(`Products for branch #${req.params.id}`);
  } else {
    res.redirect(403, 'http://localhost:3000');
    return;
  }
});

module.exports = router;
