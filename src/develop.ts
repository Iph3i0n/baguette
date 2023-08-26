import AppData from "./controllers/app-data";
import AuthorsController from "./controllers/authors";
import TemplatesController from "./controllers/templates";
import FieldsController from "./controllers/fields";
import PagesController from "./controllers/pages";
import SitePageController from "./controllers/site-page";
import TagsController from "./controllers/tags";
import { Start } from "./server";
import SeriesController from "./controllers/series";
import ArticlesController from "./controllers/articles";

export function StartDevelopmentServer() {
  Start(
    AppData,
    FieldsController,
    TemplatesController,
    AuthorsController,
    TagsController,
    SitePageController,
    SeriesController,
    ArticlesController,
    PagesController
  );
}
