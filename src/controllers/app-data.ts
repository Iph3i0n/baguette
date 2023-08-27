import Hapi from "@hapi/hapi";

import { Handler } from "../server";
import Controller from "../server/controller";
import { Author, Template, DataTypes, Page, Tag, Series } from "../models";
import { All } from "../jsonified";
import Fs from "fs-extra";
import Path from "path";
import { RenderApp } from "../render";
import { Assert, IsObject, IsOneOf, IsString, Optional } from "@ipheion/safe-type";

const IsSiteSetup = IsObject({
  package_name: IsString,
  use_pages: Optional(IsOneOf("on", "off")),
});

export default class AppData extends Controller {
  constructor() {
    super("/api/app-data");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return {
      data_types: DataTypes,
      authors: All(Author),
      templates: All(Template),
      pages: All(Page),
      tags: All(Tag),
      series: All(Series),
    };
  }

  @Handler("POST", "/static", {
    payload: {
      output: "stream",
      parse: true,
      allow: "multipart/form-data",
      multipart: { output: "file" },
    },
  })
  async PostFile(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const file: any = (request.payload as any).file;
    await Fs.outputFile(Path.join("./static", file.filename), await Fs.readFile(file.path));
    return { url: `/static/${file.filename}` };
  }

  @Handler("POST", "/compile")
  async Compile(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    await RenderApp();
    return { success: true };
  }

  @Handler("POST", "/init")
  async Init(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsSiteSetup, data);
    await Fs.outputFile(".gitignore", "site");
    await Fs.outputJSON(
      "package.json",
      {
        name: data.package_name,
        version: "1.0.0",
        private: true,
        scripts: {
          build: "baguette render",
        },
        devDependencies: {
          "@ipheion/baguette": "0.0.1",
        },
      },
      { spaces: 2 }
    );
    if (data.use_pages === "on")
      await Fs.outputFile(
        "./.github/workflows/pages.yml",
        `name: Pages
on:
  push:
    tags:
      - "*"
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Use Node.js 18.12.1
        uses: actions/setup-node@v3
        with:
          node-version: 18.12.1
      - run: npm install
      - run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v2
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v1
        with:
          path: "./site"
      - name: Deploy to Pages
        id: deployment
        uses: actions/deploy-pages@v1`
      );
    return { success: true };
  }
}
