import { Router } from "../";
import { Deferred } from "../../../util";

import * as querystring from "querystring";

export const urlencoded: Router.Route.Handler = async (request, response) => {
  if (request.headers["content-type"] !== "application/x-www-form-urlencoded") {

    return;
  }

  const deferred = new Deferred<void>();

  let chunks = "";
  request.on("data", (chunk) => chunks += chunk);
  request.on("end", () => {
    try {
      request.body = querystring.parse(chunks);
    } catch (error) {
      return deferred.reject();
    }
    return deferred.resolve();
  });

  return deferred.promise;
};
