import { All } from "./jsonified";
import { Page, Series } from "./models";
import Mustache from "mustache";
import Fs from "fs-extra";

export async function RenderApp() {
  const pages = All(Page).map((p) => new Page(p));
  const series = All(Series).map((s) => new Series(s));

  for (const page of pages) {
    await Fs.outputFile(`.${page.url}.html`, Mustache.render(page.template.template, { ...page.Dto, ...page.content }));
  }

  for (const item of series) {
    await Fs.outputFile(
      `.${item.url}.html`,
      Mustache.render(item.template.template, {
        ...item.Dto,
        ...item.content,
        articles: item.articles.map((a) => ({ title: a.title, slug: a.physical_id, publish_date: a.publish_date })),
      })
    );

    for (const article of item.articles)
      await Fs.outputFile(
        `.${item.url}/${article.physical_id}.html`,
        Mustache.render(article.template.template, {
          series: item.Dto,
          ...article.Dto,
          ...article.content,
        })
      );
  }

  await Fs.copy("./static", "./site/static");
}
