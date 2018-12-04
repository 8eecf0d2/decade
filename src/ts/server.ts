import * as http from "http";
import * as https from "https";

import { Router } from "./router";
import * as middleware from "./middleware";

export class Server {

  public static Middleware = middleware;

  constructor(
    private options: Server.Options,
  ) {
    this.router = new Router(options.routes);

    if (options.http) {
      this.http();
    }
    if (options.https) {
      this.https();
    }
  }
  private servers: Server.Servers = {};
  private router: Router;

  public start(): void {
    if (this.servers.http) {
      this.servers.http.listen(this.options.http);
    }
    if (this.servers.https) {
      this.servers.https.listen(this.options.https);
    }
  }

  public stop(): void {
    if (this.servers.http) {
      this.servers.http.close();
    }
    if (this.servers.https) {
      this.servers.https.close();
    }
  }

  private http(): void {
    this.servers.http = http.createServer();
    this.servers.http.on("request", this.router.handle.bind(this.router));
  }

  private https(): void {
    this.servers.https = https.createServer(this.options.options);
    this.servers.https.on("request", this.router.handle.bind(this.router));
  }
}

export namespace Server {
  export interface Options {
    routes: Router.Route[];
    http?: number;
    https?: number;
    options?: https.ServerOptions;
  }
  export interface Servers {
    http?: http.Server;
    https?: https.Server;
  }
}
