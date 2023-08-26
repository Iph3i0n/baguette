import Hapi from "@hapi/hapi";
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

export default function Start(...controllers: Array<FinalContoller>) {
  const server = Hapi.server({ port: 3000, debug: { request: ["error"] }, routes: { files: { relativeTo: "./static" } } });

  for (const controller of controllers) {
    const instance = new controller();
    for (const [method, subroute, handler] of instance.Handlers) {
      server.route({
        method,
        path: instance.Url + subroute,
        handler: (r, h, t) => handler.call(instance, r, h, t, ParsePayload(r.payload)),
      });
    }
  }

  server.start().then(() => console.log("Server started"));
}
