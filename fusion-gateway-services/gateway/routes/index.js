const request = require('request');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {FusionAuthClient} = require('@fusionauth/typescript-client');
// TODO: Ideally these should be pulled from a secret store.
const clientId = '7f013799-8fb3-4f23-a159-9f735147dfda';
const clientSecret = 'kQ6JBzU6gdAFsA94fDVuMEuPG7rsm-SNxqsDJBuLKhY';
const jwtSigningKey = 'AVnx4v4zlOo/Z657ZswYPDeHYGvG37e13oVz0X8xM8s=';
const client = new FusionAuthClient('noapikeyneeded', 'http://localhost:9011');
const checkAuthentication = require('../middleware/checkAuthentication');

/* GET home page. */
router.get('/', function (req, res, next) {
  const stateValue = Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
  req.session.stateValue = stateValue
  res.render('index', {user: req.session.user, stateValue: stateValue, title: 'FusionAuth Example'});
});

/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function (req, res, next) {
  // This code stores the user in a server-side session
  const stateFromServer = req.query.state;
  if (stateFromServer !== req.session.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log("Saw: "+stateFromServer+ ", but expected: "+req.session.stateValue);
    res.redirect(302, '/');
    return;
  }
  client.exchangeOAuthCodeForAccessToken(req.query.code,
                                         clientId,
                                         clientSecret,
                                         'http://localhost:3000/oauth-redirect')
      .then((response) => {
        req.session.access_token = response.response.access_token;
        return client.retrieveUserUsingJWT(response.response.access_token);
      })
      .then((response) => {
        req.session.user = response.response.user;
      })
      .then((response) => {
        res.redirect(302, '/');
      }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});

/* PRODUCT CATALOG ROUTES */
const productUrl = 'http://localhost:3001';

router.get('/products', function(req, res, next) {
  const bearerToken = getGatewayBearerToken(req);
  const options = {
    url: `${productUrl}/products`,
    headers: { authorization: bearerToken }
  };
  request(options).pipe(res);
});

router.get('/products/:id', function(req, res, next) {
  const bearerToken = getGatewayBearerToken(req);
  const options = {
    url: `${productUrl}/products/${req.params.id}`,
    headers: { authorization: bearerToken }
  };
  request(options).pipe(res);
});

/* PRODUCT INVENTORY ROUTES */
router.get('/branches/:id/products', checkAuthentication, function(req, res, next) {
  const bearerToken = getUserBearerToken(req);
  const options = {
    url: `http://localhost:3002/branches/${req.params.id}/products`,
    headers: { authorization: bearerToken }
  };
  request(options).pipe(res);
});

module.exports = router;

function getGatewayBearerToken(req) {
  // TODO: Consider using an access_token from an OAuth 2.0 Client Credentials flow instead when supported by FusionAuth.
  // See https://github.com/FusionAuth/fusionauth-issues/issues/155
  var token = jwt.sign({ data: req.url }, jwtSigningKey, { expiresIn: '10m', subject: 'gateway', issuer: req.get('host') });
  return 'Bearer ' + token;
}

function getUserBearerToken(req) {
  return 'Bearer ' + req.session.access_token;
}