import { Router } from "../";
import { Deferred } from "../../../util";

export const json: Router.Route.Handler = async (request, response) => {
  if (request.method !== "POST" || request.headers["content-type"] !== "application/json") {

    return;
  }

  const deferred = new Deferred<void>();

  let chunks = "";
  request.on("data", (chunk) => chunks += chunk);
  request.on("end", () => {
    try {
      request.body = JSON.parse(chunks);
    } catch (error) {
      return deferred.reject();
    }
    return deferred.resolve();
  });

  return deferred.promise;
};
