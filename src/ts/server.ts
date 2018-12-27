import * as http from "http";
import * as https from "https";

import { Logger, Deferred } from "./util";

export class Server {
  private servers: Server.Servers = {};
  private events: { [key: string]: Server.Event.Handler[] } = {};
  private logger: Logger = new Logger("decade");

  constructor(
    private options: Server.Options,
  ) {
    this.logger.info(`initializing`);

    if (options.http) {
      this.http();
    }
    if (options.https) {
      this.https();
    }
  }

  public async start(): Promise<void> {
    const promises = [ new Deferred(), new Deferred() ];

    if (this.servers.http) {
      this.servers.http.listen(this.options.http, () => {
        this.emit("start", "http");
        promises[0].resolve();
        this.logger.good(`[http]: http://localhost:${this.options.http}`);
      });
    } else {
      promises[0].resolve();
    }
    if (this.servers.https) {
      this.servers.https.listen(this.options.https, () => {
        this.emit("start", "https");
        promises[1].resolve();
        this.logger.good(`[https]: https://localhost:${this.options.https}`);
      });
    } else {
      promises[1].resolve();
    }

    await Promise.all(promises);
  }

  public stop(): void {
    if (this.servers.http) {
      this.servers.http.close(() => {
        this.emit("stop", "http");
        this.logger.good(`[http]: stopped`);
      });
    }
    if (this.servers.https) {
      this.servers.https.close(() => {
        this.emit("stop", "https");
        this.logger.good(`[https]: stopped`);
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
    this.logger.good(`[plugin]: <${plugin.constructor.name.toLowerCase()}>`);
    await plugin.register(this, new Logger(plugin.constructor.name.toLowerCase()));
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
    register: (server: Server, logger: Logger) => Promise<void>;
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
