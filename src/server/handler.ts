import Hapi from "@hapi/hapi";
import Controller from "./controller";

export type HandlerFunction = (...params: [...Parameters<Hapi.Lifecycle.Method>, unknown]) => ReturnType<Hapi.Lifecycle.Method>;

export default function Handler(method: string, subroute?: string) {
  return (target: HandlerFunction, ctx: ClassMethodDecoratorContext<Controller, HandlerFunction>) => {
    ctx.addInitializer(function () {
      this.RegisterHandler(method, subroute ?? "", target);
    });
  };
}
