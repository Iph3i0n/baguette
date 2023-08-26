import { IsDate, IsOneOf, IsRecord, IsString, IsType, Optional } from "@ipheion/safe-type";
import Jsonified, { Child, Children, Serialisable } from "./jsonified";

export const DataTypes = ["text", "rich_text", "boolean", "number"] as const;

export const IsDataType = IsOneOf(...DataTypes);

export type DataType = IsType<typeof IsDataType>;

export class Template extends Jsonified {
  @Serialisable(IsRecord(IsString, IsDataType))
  accessor fields!: Record<string, DataType>;

  @Serialisable(IsString)
  accessor template!: string;

  get Dto() {
    return {
      name: this.physical_id,
      fields: this.fields,
      template: this.template,
    };
  }
}

export class Tag extends Jsonified {
  @Serialisable(IsString)
  accessor name!: string;

  @Serialisable(IsDate)
  accessor created_date!: Date;

  get Dto() {
    return {
      slug: this.physical_id,
      name: this.name,
      created_date: this.created_date,
    };
  }
}

export class Author extends Jsonified {
  @Serialisable(IsString)
  accessor name!: string;

  @Serialisable(Optional(IsDate))
  accessor dob!: Date | undefined | null;

  @Serialisable(Optional(IsString))
  accessor job_title: string | undefined | null;

  get Dto() {
    return {
      slug: this.physical_id,
      name: this.name,
      dob: this.dob,
      job_title: this.job_title,
    };
  }
}

export class Page extends Jsonified {
  @Serialisable(IsString)
  accessor title!: string;

  @Serialisable(IsString)
  accessor url!: string;

  @Serialisable(IsDate)
  accessor publish_date!: Date;

  @Child(Author)
  accessor author!: Author;

  @Children(Tag)
  accessor tags!: Array<Tag>;

  @Child(Template)
  accessor template!: Template;

  @Serialisable(IsRecord(IsString, IsString))
  accessor content!: Record<string, string>;

  get Dto() {
    return {
      slug: this.physical_id,
      url: this.url,
      title: this.title,
      publish_date: this.publish_date,
      author: this.author.Dto,
      tags: this.tags.map((t) => t.Dto),
      template: this.template.Dto,
      content: this.content,
    };
  }
}

export class Article extends Jsonified {
  @Serialisable(IsString)
  accessor title!: string;

  @Serialisable(IsDate)
  accessor publish_date!: Date;

  @Children(Tag)
  accessor tags!: Array<Tag>;

  @Child(Author)
  accessor author!: Author;

  @Child(Template)
  accessor template!: Template;

  @Serialisable(IsRecord(IsString, IsString))
  accessor content!: Record<string, string>;

  get Dto() {
    return {
      slug: this.physical_id,
      title: this.title,
      publish_date: this.publish_date,
      tags: this.tags.map((t) => t.Dto),
      author: this.author.Dto,
      template: this.template.Dto,
      content: this.content,
    };
  }
}

export class Series extends Jsonified {
  @Serialisable(IsString)
  accessor title!: string;

  @Serialisable(IsString)
  accessor url!: string;

  @Child(Template)
  accessor template!: Template;

  @Serialisable(IsRecord(IsString, IsString))
  accessor content!: Record<string, string>;

  @Child(Template)
  accessor item_template!: Template;

  @Children(Article)
  accessor articles!: Array<Article>;

  get Dto() {
    return {
      slug: this.physical_id,
      title: this.title,
      url: this.url,
      content: this.content,
      template: this.template.Dto,
      item_template: this.item_template.Dto,
    };
  }
}
