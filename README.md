# Decade

[![Travis CI badge](https://travis-ci.org/8eecf0d2/decade.svg?branch=develop)](https://travis-ci.org/8eecf0d2/decade)
[![Codeclimate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/8eecf0d2/decade.svg)](https://codeclimate.com/github/8eecf0d2/decade)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=8eecf0d2/decade)](https://dependabot.com)

Dead simple HTTP/s Server with zero dependencies written with Typescript in about 150 lines.

This library only supports two Http verbs, `GET` and `POST`, it encourages users to work with built in Node modules.

### Install
Install with yarn.
```bash
yarn add decade
```

### Usage
Create a `http` and `https` server.
```ts
import { Server } from "decade";
import * as routes from "./routes";

const server = new Server({
  http: 3080,
  https: 3443,
  options: {
    key: "...",
    cert: "...",
  },
  routes: Object.values(routes),
});
```

For simple `JSON` responses you can return a `Router.Route.Response` object from a handler which will be parsed and sent to the client.
```ts
import { Router } from "decade";

export const simpleRoute: Router.Route = {
  path: /^\/[a-z]+$/,
  method: "GET",
  handler: [
    async () => {
      return {
        status: 200,
        body: {
          foo: "bar",
        },
      };
    },
  ]
}
```

If you need more control, you can craft your own response and simply return `void` from the handler - handlers are called in order so you can drop in middleware wherever suits.
```ts
import { Router } from "decade";
import { fooMiddleware } from "./middleware"

export const detailedRoute: Router.Route = {
  path: /^\/proxy$/,
  method: "GET",
  handler: [
    fooMiddleware,
    async (request, response) => {
      https.get('https://www.example.com', (proxy) => {
        response.setHeader('Content-Type', proxy.headers['content-type']);
        proxy.pipe(response);
      });
    },
  ]
}
```

### Middleware
By default incoming `request` objects aren't parsed for `JSON` or `URL Encoded` payloads but you can use built in Middleware to do this.

#### `json`
```ts
import { Server, Router } from "decade";

export const jsonRoute: Router.Route = {
  ...
  handler: [
    Server.Middleware.json,
    ...
  ]
}
```

#### `urlencoded`
```ts
import { Server, Router } from "decade";

export const jsonRoute: Router.Route = {
  ...
  handler: [
    Server.Middleware.urlencoded,
    ...
  ]
}
```

If you need support for `Multipart` form data or anything else you can write your own middleware or use a fully featured library like [**body-parser**](https://www.npmjs.com/package/body-parser).
