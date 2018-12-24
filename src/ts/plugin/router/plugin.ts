import * as http from "http";
import { URL } from "url";

import { Server } from "../../server";
import { Logger } from "../../util";

import * as middleware from "./middleware";

export class Router implements Server.Plugin {
  public static middleware = middleware;
  private routes: Router.Route[] = [];
  private server: Server;

  constructor(
    routes: Router.Route[],
  ) {
    for(const route of routes) {
      this.route(route);
    }
  }

  public async register (server: Server): Promise<void> {
    this.server = server;
    this.server.on("request", this.handle.bind(this));
  }

  public route (route: Router.Route): void {
    Logger.info(`[route]: ${route.path}`);
    this.routes.push(route);
  }

  private async handle(options: Router.HandleOptions) {
    const url = new URL(`http://localhost${options.request.url}`);
    for (const route of this.routes) {
      const match = route.path.exec(url.pathname);
      if (match && route.method === options.request.method) {
        await this.process(route, options.request, options.response);
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
  export interface HandleOptions {
    request: http.IncomingMessage;
    response: http.ServerResponse;
  }
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
