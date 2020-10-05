# FusionAuth API Key Management With Microservices
In a recent article on [Centralized Authentication with a Microservices Gateway](https://fusionauth.io/blog/2020/09/15/microservices-gateway), we set up an API gateway with microservices for an eCommerce enterprise. FusionAuth handled our centralized authentication and then we passed user details for authorization to the microservices.

In this article, we'll build on the [example project](https://github.com/FusionAuth/fusionauth-example-node-services-gateway), focusing in on managing API keys for the microservices. This is a critical security concern because we don't want to allow just any application to call our microservices. We only want to allow the gateway to communicate to them, so we'll use FusionAuth to generate static API keys unique to each microservice and then require the gateway to send a header (`x-api-key`) that corresponds to the API key of the relevant microservice.

## Basic Implementation
In the [Product Catalog microservice](https://github.com/FusionAuth/fusionauth-example-node-services-gateway/tree/master/product-catalog), we're going to add middleware to our `app.js` file to ensure all requests have the right `x-api-key` header for this microservice:

```
  ... // other require statements
  var apiKeyMiddleware = require('./middleware/apiKeyMiddleware');
  var indexRouter = require('./routes/index');

  ... // other middleware
  app.use(apiKeyMiddleware);
  app.use('/', indexRouter);
```

Our middleware (in `middleware/apiKeyMiddleware.js`) to check the API key is pretty simple...
```
  const { PRODUCT_CATALOG_API_KEY } = process.env;

  module.exports = function(req, res, next) {
    if (req.headers['x-api-key'] !== PRODUCT_CATALOG_API_KEY) {
      res.redirect(401, 'http://localhost:3000');
    }
    next();
  };
```

It checks to make sure the `x-api-key` header matches that of the `PRODUCT_CATALOG_API_KEY` environment variable, and if it doesn't, it will redirect back to the gateway with a `401 Unauthorized`. Otherwise, it will continue on to the next middleware (the `indexRouter`).

This is a simple way to do API Key authorization, ensuring any requesting applications have access (by having the API key) to our Product Catalog microservice.

The process would be the same for the Product Inventory service. And, of course, the gateway application would need to send the correct `x-api-key` header for the microservice it wishes to call.

In the gateway application [router index file](https://github.com/FusionAuth/fusionauth-example-node-services-gateway/blob/master/gateway/routes/index.js), we'll add an `x-api-key` header to the `/products` route:

```
  /* PRODUCT CATALOG ROUTES */
  const productUrl = 'http://localhost:3001';

  router.get('/products', function(req, res, next) {
    req.headers['x-api-key'] = '12345';
    req.pipe(request(`${productUrl}/products`)).pipe(res);
  });
```

## Storing API Keys Securely
Use FusionAuth to generate API Keys. Alternatively, generate and store them in your environment, not in your code. Could use a params manager.

## Rotating Keys
Although our API keys are nearly impossible to guess, it's not a bad idea to rotate them every few months. Here's how to do it right, without breaking consumer applications.

## Revoking Access
Revoking access to a particular application (requires whitelisting).

## Alternatives (?)
Consumer-specific API keys (for multi-tenant support), JWTs, etc.
