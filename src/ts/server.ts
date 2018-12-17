import * as http from "http";
import * as https from "https";

import { Logger } from "./util";
import { Router } from "./router";
import * as middleware from "./middleware";

export class Server {

  public static Middleware = middleware;

  private servers: Server.Servers = {};
  private router: Router;

  constructor(
    private options: Server.Options,
  ) {
    Logger.info(`...`);

    this.router = new Router(options.routes);

    if (options.http) {
      this.http();
    }
    if (options.https) {
      this.https();
    }
  }

  public start(): void {
    if (this.servers.http) {
      this.servers.http.listen(this.options.http, () => Logger.good(`[http]:  http://localhost:${this.options.http}`));
    }
    if (this.servers.https) {
      this.servers.https.listen(this.options.https, () => Logger.good(`[https]: https://localhost:${this.options.https}`));
    }
  }

  public stop(): void {
    if (this.servers.http) {
      this.servers.http.close(() => Logger.good(`http : stopped`));
    }
    if (this.servers.https) {
      this.servers.https.close(() => Logger.good(`https: stopped`));
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

  public plugin (plugin: Server.Plugin): void {
    Logger.good(`plugin: ${plugin.name}`);
    for (const route of plugin.routes) {
      this.router.register(route);
    }
  }
}

export namespace Server {
  export interface Plugin {
    name: string;
    routes: Router.Route[];
  }
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
