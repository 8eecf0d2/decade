import * as http from "http";
import * as https from "https";

import { Logger } from "./util";

export class Server {
  private servers: Server.Servers = {};
  private events: { [key: string]: Server.Event.Handler[] } = {};

  constructor(
    private options: Server.Options,
  ) {
    Logger.info(`initializing`);

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
    this.servers.http.on("request", (request, response) => this.emit("request", { request, response }));
  }

  private https(): void {
    this.servers.https = https.createServer(this.options.options);
    this.servers.https.on("request", (request, response) => this.emit("request", { request, response }));
  }

  public async plugin(plugin: Server.Plugin): Promise<void> {
    Logger.good(`[plugin]: "${plugin.constructor.name}"`);
    await plugin.register(this);
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
    register: (server: Server) => Promise<void>;
  }
  export namespace Event {
    export type Type = "start" | "stop" | "request";
    export type Handler = (...args: any[]) => any;
  }
  export interface Options {
    http?: number;
    https?: number;
    options?: https.ServerOptions;
  }
  export interface Servers {
    http?: http.Server;
    https?: https.Server;
  }
}
