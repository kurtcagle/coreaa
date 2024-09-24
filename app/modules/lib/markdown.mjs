export class Markdown {
    constructor(ns){
      this.ns = ns;
    } 
    bookmarks(list,mode="md",uriMap=(id)=>`/page/Entry.md?id=${id}`){
      let template = (mode==="html")?(list)=>`<ul>
          ${list.map((item)=>`<li title="${item.description}"><a href="${uriMap(item.curie)}">${item.label}</a></li>`).join('\n')}
      </ul>`:(mode==="json")?(json)=>json:
      (list)=>`${list.map((item)=>`* [${item.label}](${uriMap(item.curie)} "${item.description}")`).join('\n')}`
      return template(list)
    }
    summary(record,mode="md",uriMap=(id)=>`/page/Entry.md?id=${id}`){
        
        let template = (mode==="html")?(list)=>`<ul>
            ${list.map((item)=>`<li title="${item.description}"><a href="${uriMap(item.curie)}">${item.label}</a></li>`).join('\n')}
        </ul>`:(mode==="json")?(json)=>json:
        (list)=>`${list.map((item)=>`* [${item.label}](${uriMap(item.curie)} "${item.description}")`).join('\n')}`
        return template(list)
      }
    properties(data,mode="md"){
      if (mode === "md"){
      let template = (data)=>`# Properties
${data.map((entry)=>
     `__${entry[0].plabel}__: ${entry.map((item)=>(item.nodeKind === "IRI")?`[${item.label}](/page/entry.md?id=${item.value})`:item.value).join(',')}`).join('\n\n')}`
    return template(data)
      }
    else {
      return "More to come"
      }
    }
  }