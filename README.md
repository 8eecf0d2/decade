# Decade ☄️

[![Travis CI badge](https://travis-ci.org/8eecf0d2/decade.svg?branch=develop)](https://travis-ci.org/8eecf0d2/decade)
[![Codeclimate maintainability](https://img.shields.io/codeclimate/maintainability-percentage/8eecf0d2/decade.svg)](https://codeclimate.com/github/8eecf0d2/decade)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=8eecf0d2/decade)](https://dependabot.com)

Dead simple HTTP/s Server Wrapper with zero dependencies written with Typescript in about 200 lines.

This library encourages users to work with built in Node modules and the built in Router only supports two Http verbs, `GET` and `POST`, because the other ones are trash.

### Install
Install with yarn.
```bash
yarn add decade
```

### Usage
Create a `http` and `https` server.
```ts
import { Server } from "decade";

const server = new Server({
  http: 3080,
  https: 3443,
  options: {
    key: "...",
    cert: "...",
  },
});
```

### Plugin
Decade provides a simple **Plugin** system, a plugin should be _something_ with a `register` method which will receive the **Server** instance and a **Logger** instance, from there you can listen for and emit events.

```ts
import { Server, Logger } from "decade";
export class MyPlugin implements Server.Plugin {
  ...
  async register(server: Server, logger: Logger): Promise<void> {
    this.server = server;
    this.logger = logger;
    server.on("request", this.doSomething.bind(this));
  }

  async someOtherMethod() {
    this.logger.info("something happened!");
    this.server.emit("customevent", "foo");
  }
}
```

To use a plugin, pass it into the `Server.plugin` method.
```ts
import { Server } from "decade";
import { FooPlugin } from "decade-foo-plugin";

const server = new Server({...});
server.plugin(new FooPlugin("bar"));
```

### Router
There's a built in **Router** plugin available for import which can be initialized with an array of `Router.Route` objects.

```ts
import { Server, Router } from "decade";
import * as routes from "./routes";

const server = new Server({...})

const router = new Router(Object.values(routes));

server.plugin(router);
```

For simple `JSON` responses you can return a `Router.Route.Payload` object from a handler which will be parsed and sent to the client.
```ts
import { Router } from "decade";

export const simpleRoute: Router.Route = {
  path: /^\/[a-z]+$/,
  method: "GET",
  handler: [
    async () => {
      return {
        status: 200,
        headers: {
          "Foo-Bar": "Baz-Qak",
        },
        body: {
          foo: "bar",
        },
      };
    },
  ]
}
```

If you need more control, you can craft your own response and simply return `void` from the handler - handlers are called in-order so you can drop in middleware wherever suits.
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

Routes resolve sequentially so if you have multiple routes which match the request URL they will all be called in the order that they were added to the Router.

_A common oversight is resolving routes too early, like the proxy route above which resolves immediately. Routes should only resolve once they are finished interacting with the request and response objects._

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

### Examples

#### 404 Not Found
There is no built in helper to detect that no routes match the request, however when a request is received all matching routes will be called in order of instantiation so you can craft your own 404 handler by adding a "catch all" path `/.*/` as the last route.

```ts
export const notFoundRoute: Router.Route = {
  path: /.*/,
  method: "GET",
  handler: [
    async (request, response) => {
      if(response.headersSent) {
        return
      }

      return {
        status: 404,
        body: "Not Found",
      };
    },
  ],
}
```

#### Cookies
If you're adventurous you can bake your own cookies but it's recommended to use a library like [`cookie`](https://npmjs.com/package/cookie), afterwards you can set them as usual.

```ts
import * as cookie from "cookie";

export const cookieRoute: Router.Route = {
  ...
  handler: [
    async (request, response) => {
      return {
        status: 200,
        headers: {
          "Set-Cookie": "foo=bar",
          // or
          "Set-Cookie": cookie.serialize("foo", "bar", {...}),
        },
        body: "Cookies!",
      };
    },
  ],
}
```

#### Outgoing Transformations
It's pretty common practice to log or tag requests as they head back to the client, as an example let's create a middleware that adds a `timestamp` header to responses - if you're using the "simple" method of returning a `Router.Route.Payload` it is passed along to future middlewares as the third argument.

You can do this in two ways, the first by using the `http.ServerResponse` object and the `setHeader()` method, the second by mutating the `Router.Route.Payload` object's `headers` property.

```ts
export const timestampMiddleware: Router.Route.Handler = async (request, response, payload) => {
  response.setHeader("timestamp", new Date().getTime().toString());

  return payload;

  // or

  payload.headers = {
    ...payload.headers,
    timestamp: new Date().getTime().toString(),
  }

  return payload;
}

export const transformedRoute: Router.Route = {
  ...
  handler: [
    async () => {
      return {
        ...
      };
    },
    timestampMiddleware,
  ],
}
```
