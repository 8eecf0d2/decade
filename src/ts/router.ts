import * as http from "http";
import * as https from "https";
import { URL } from "url";

export class Router {
  constructor(
    private routes: Router.Route[],
  ) {
    this.routes = this.routes.map((route) => ({
      ...route,
      path: route.path,
    }));
  }

  public handle(request: http.IncomingMessage, response: http.ServerResponse) {
    const url = new URL(`http://localhost${request.url}`);
    for (const route of this.routes) {
      const match = route.path.exec(url.pathname);
      if (match && route.method === request.method) {
        return this.process(route, request, response);
      }
    }
    response.statusCode = 404;
    response.end();
  }

  private async process(route: Router.Route, request: Router.Route.Request, response: Router.Route.Response) {
    let result: Router.Route.Payload | void;
    try {
      for (const handler of route.handler) {
        result = await handler(request, response);
      }
    } catch (error) {
      result = {
        status: 500,
        body: "Internal Error",
      };
    }
    if (result) {
      result.headers = {
        "Content-Type": "application/json",
        ...(result.headers || {}),
      };
      for (const header of Object.keys(result.headers)) {
        response.setHeader(header, result.headers[header]);
      }
      response.statusCode = result.status;
      response.end(JSON.stringify(result.body));
    }
  }
}

export namespace Router {
  export namespace Route {
    export type Verb = "GET" | "POST";
    export interface Request extends http.IncomingMessage {
      body?: any;
    }
    export interface Response extends http.ServerResponse {}
    export interface Payload {
      headers?: http.OutgoingHttpHeaders;
      body: any;
      status: number;
    }
    export type Handler = (
      request: Router.Route.Request,
      response: Router.Route.Response,
    ) => Promise<void> | Promise<Router.Route.Payload>;
  }
  export interface Route {
    path: RegExp;
    method: Router.Route.Verb;
    handler: Router.Route.Handler[];
  }
}
