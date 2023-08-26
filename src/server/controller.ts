import Hapi from "@hapi/hapi";
import fs from "fs-extra";
import path from "path";
import { HandlerFunction } from "./handler";

export default abstract class Controller {
  readonly #url: string;
  readonly #handlers: Array<[string, string, HandlerFunction]> = [];

  constructor(url: string) {
    this.#url = url;
  }

  RegisterHandler(method: string, subroute: string, handler: HandlerFunction) {
    this.#handlers.push([method, subroute, handler]);
  }

  get Url() {
    return this.#url;
  }

  get Handlers(): Array<[string, string, HandlerFunction]> {
    return this.#handlers;
  }

  View(area: string, h: Hapi.ResponseToolkit) {
    h.response().header("Content-Type", "text/html");
    return fs.readFileSync(path.resolve(__dirname, "..", "..", "views", `${area}.html`), "utf-8");
  }
}
