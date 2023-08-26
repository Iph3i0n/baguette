import Hapi from "@hapi/hapi";
import fs from "fs-extra";
import path from "path";

import Controller, { Handler } from "../server";

export default class PagesController extends Controller {
  constructor() {
    super("");
  }

  @Handler("GET", "/{slug*}")
  async Home(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return this.View("index", h);
  }

  @Handler("GET", "/components/{name}")
  async Component(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return this.View(`components/${request.params.name}`, h);
  }

  @Handler("GET", "/bakery.js")
  async Bakery(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    h.response().header("Content-Type", "application/javascript");
    return fs.readFileSync(path.resolve("../../bakery/docs/dist/bundle.min.js"), "utf-8");
  }
}
