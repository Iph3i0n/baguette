import Hapi from "@hapi/hapi";
import inert from "@hapi/inert";
import Controller from "./controller";
import { DoNotCare, IsRecord, IsString, IsSymbol, IsUnion } from "@ipheion/safe-type";
import set from "lodash/set";

type FinalContoller = new () => Controller;

function ParsePayload(payload: unknown) {
  if (!IsRecord(IsUnion(IsString, IsSymbol), DoNotCare)(payload)) return payload;

  const result: any = {};
  for (const key in payload) {
    set(result, key, payload[key]);
  }

  return result;
}

export default async function Start(...controllers: Array<FinalContoller>) {
  const server = Hapi.server({
    port: 3000,
    debug: { request: ["error"] },
  });

  await server.register({
    plugin: inert,
  });

  for (const controller of controllers) {
    const instance = new controller();
    for (const [method, subroute, handler, options] of instance.Handlers) {
      const path = instance.Url + subroute;
      server.route({
        method,
        path,
        handler: (r, h, t) => {
          console.log(`Handling call for ${method} at ${path}`);
          return handler.call(instance, r, h, t, ParsePayload(r.payload));
        },
        options,
      });
    }
  }

  server.start().then(() => console.log("Server started"));
}
