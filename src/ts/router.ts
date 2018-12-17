import * as http from "http";
import { URL } from "url";

import { Logger } from "./util";

export class Router {
  private routes: Router.Route[] = [];

  constructor(
    routes: Router.Route[],
  ) {
    for (const route of routes) {
      this.register(route);
    }
  }

  public register (route: Router.Route): void {
    Logger.info(`[route]: ${route.path}`);
    this.routes.push(route);
  }

  public async handle(request: http.IncomingMessage, response: http.ServerResponse) {
    const url = new URL(`http://localhost${request.url}`);
    for (const route of this.routes) {
      const match = route.path.exec(url.pathname);
      if (match && route.method === request.method) {
        await this.process(route, request, response);
      }
    }
  }

  private async process(route: Router.Route, request: Router.Route.Request, response: Router.Route.Response) {
    let result: void | Router.Route.Payload;
    try {
      for (const handler of route.handler) {
        result = await handler(request, response, result);
      }
    } catch (error) {
      result = {
        status: 500,
        body: "Internal Error",
      };
    }

    if (result) {
      result.headers = {
        "content-type": "application/json",
        ...(result.headers || {}),
      };
      for (const header of Object.keys(result.headers)) {
        response.setHeader(header, result.headers[header]);
      }
      response.statusCode = result.status;
      response.end(result.headers["content-type"] === "application/json" ? JSON.stringify(result.body) : result.body);
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
    export type Handler<RequestType = Router.Route.Request, PayloadType = Router.Route.Payload> = (
      request: RequestType,
      response: Router.Route.Response,
      previous: void | PayloadType,
    ) => Promise<void | PayloadType>;
  }
  export interface Route {
    path: RegExp;
    method: Router.Route.Verb;
    handler: Router.Route.Handler[];
  }
}
