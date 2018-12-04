import * as mocha from "mocha";
import * as assert from "assert";

import { Server } from "../../dist";

mocha.describe("Server", () => {
  mocha.describe("http", () => {
    mocha.it("should start and stop", async () => {
      const server = new Server({
        http: 3000,
        routes: [],
      });

      server.start();

      // @ts-ignore
      assert.notEqual(server.servers.http.address(), null);

      server.stop();

      // @ts-ignore
      assert.equal(server.servers.http.address(), null);
    });
  });
});
