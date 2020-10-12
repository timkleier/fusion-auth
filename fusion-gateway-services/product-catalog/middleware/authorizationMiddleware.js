const { JWT_SIGNING_KEY } = process.env;
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    console.log('authorization: ' + authorization);
    if (!authorization)
    {
      console.log('Authorization header missing. Denying request.')
      res.redirect(401, 'http://localhost:3000');
      return;
    }

    const bearer = authorization.split(' ');
    if (!bearer || bearer.length != 2)
    {
      console.log('Bearer header value malformed. Denying request.')
      res.redirect(401, 'http://localhost:3000');
      return;
    }

    token = bearer[1];
    if (!token)
    {
      console.log('Token not provided. Denying request.')
      res.redirect(401, 'http://localhost:3000');
      return;
    }

    const decoded_token = jwt.verify(token, JWT_SIGNING_KEY);
    req.session.roles = decoded_token.roles;

  } catch(err) {
    console.error(err);
    res.redirect(401, 'http://localhost:3000');
    return;
  }

  next();
};
