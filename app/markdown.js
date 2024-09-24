export class Markdown {
  constructor(ns, g, mode = "html") {
    this.ns = ns;
    this.g = g;
    this.mode = mode;
  }
  bookmarks(list, mode = this.mode, uriMap = (id) => `/page/Entry.${this.mode}?id=${id}`) {
    let template = (mode === "html") ? (list) => `<ol>
          ${list.map((item) => `<li title="${item?.description ? item.description.value : item.label.value}"><a href="${uriMap(item.s.curie)}">${item.label.value}</a> [${item.type.curie}]</li>`).join('\n')}
      </ol>`: (mode === "json") ? (json) => json :
      (list) => `${list.map((item) => `* [${item.label.value}](${uriMap(item.s.curie)} "${item.description.value}")`).join('\n')}`
    return template(list)
  }
  summary(record, mode = "md", uriMap = (id) => `/page/Entry.md?id=${id}`) {

    let template = (mode === "html") ? (list) => `<ul>
            ${list.map((item) => `<li title="${item.description}"><a href="${uriMap(item.curie)}">${item.label}</a></li>`).join('\n')}
        </ul>`: (mode === "json") ? (json) => json :
      (list) => `${list.map((item) => `* [${item.label}](${uriMap(item.curie)} "${item.description}")`).join('\n')}`
    return template(list)
  }
  properties(id, mode = "md") {
    let classCurie = String(this.g.getClass(id))
    let schema = this.g.schema(classCurie)
    let data = this.g.populate(id, schema)
    if (mode === "md") {
      let template = (data) => `# Properties
${data.map((entry) =>
        `__${entry[0].plabel}__: ${entry.map((item) => (item.nodeKind === "IRI") ?
          `[${item.label}](/page/Entry.md?id=${item.value})` : item.value).join(',')}`).join('\n\n')}`
      return template(data)
    }
    else {
      return "More to come"
    }
  }
}

//  module.exports = {Markdown}