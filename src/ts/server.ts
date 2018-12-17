import * as http from "http";
import * as https from "https";

import { Logger } from "./util";
import { Router } from "./router";
import * as middleware from "./middleware";

export class Server {

  public static Middleware = middleware;

  private servers: Server.Servers = {};
  private router: Router;
  private events: { [key: string]: Server.Event.Handler[] } = {};

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
      this.servers.http.listen(this.options.http, () => {
        this.emit("start", "http");
        Logger.good(`[http]: http://localhost:${this.options.http}`);
      });
    }
    if (this.servers.https) {
      this.servers.https.listen(this.options.https, () => {
        this.emit("start", "https");
        Logger.good(`[https]: https://localhost:${this.options.https}`);
      });
    }
  }

  public stop(): void {
    if (this.servers.http) {
      this.servers.http.close(() => {
        this.emit("stop", "http");
        Logger.good(`[http]: stopped`);
      });
    }
    if (this.servers.https) {
      this.servers.https.close(() => {
        this.emit("stop", "https");
        Logger.good(`[https]: stopped`);
      });
    }
  }

  private http(): void {
    this.servers.http = http.createServer();
    this.servers.http.on("request", (request, response) => {
      this.emit("request", { request, response });
      this.router.handle(request, response);
    });
  }

  private https(): void {
    this.servers.https = https.createServer(this.options.options);
    this.servers.https.on("request", (request, response) => {
      this.emit("request", { request, response });
      this.router.handle(request, response);
    });
  }

  public async plugin(plugin: Server.Plugin): Promise<void> {
    Logger.good(`[plugin]: "${plugin.name}"`);
    const instance = new plugin(this);
  }

  public on(event: Server.Event.Type, handler: Server.Event.Handler): void {
    if(!this.events.hasOwnProperty(event)) {
      this.events[event] = [];
    }

    this.events[event].push(handler);
  }

  public emit(event: Server.Event.Type, payload: any): void {
    if(!this.events.hasOwnProperty(event)) {
      return;
    }

    for(const handler of this.events[event]) {
      handler(payload);
    }
  }
}

export namespace Server {
  export interface Plugin {
    new(server: Server): any;
  }
  export namespace Event {
    export type Type = "start" | "stop" | "request";
    export type Handler = (...args: any[]) => any;
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
