declareUpdate();
const NS =require('/lib/ns.js').NS;
const Graph =require('/lib/graph.js').Graph;
const Links =require('/lib/links.js').Links;
const baseURL = Links.baseURL
let ns = new NS() 
ns.load("/json/comics.json")
ns.sparql
let g = new Graph(ns)
let curie = xdmp.getRequestField("id","Character:Batgirl_DC_Comics")
/*if(fn.endsWith(curie,".md")) {
    curie = fn.substringBefore(curie,".md")
    let format = ".md"
}
else if(fn.endsWith(curie,".json")) {
    curie = fn.substringBefore(curie,".json")
    let format = ".json"
}*/
let stub = g.fromCurie(curie)
stub 
let schema= g.schema(stub.type)
//schema 
let item = g.populate(curie,schema)
let format = xdmp.getRequestField("format",".md")
let q = xdmp.getRequestField("q","")
let pgSize = 1000
let pg = parseInt(xdmp.getRequestField("pg","0"))
let offset = pg*pgSize
if(format == ".json"){
    xdmp.setResponseContentType("text/json")
    item
}
else if(format == ".md"){
    xdmp.setResponseContentType("text/markdown")
    let schemaKeys = schema.properties.filter((property)=>property.nodeKind != "" && item.hasOwnProperty(property.name)).map((property)=>property.name)
    let content = ""
    for (const key of schemaKeys) {
        let property = schema.properties.filter((property)=>property.name == key)[0]
        if(property.nodeKind == "sh:IRI"){
            content += `* __${property.name}__: [${item[key+"Label"]}](${baseURL}/item.md?id=${item[key]})\n`
        }
        else if (property.nodeKind == "sh:Literal"){
            content += (property.name != "label")?`* __${property.name}__: ${item[key]}\n`:""
        }
    }
//    let content = schemaKeys.map((key)=>`* __${key}__: ${item[key]}`).join('\n')
    contentLabel = item['name']||item['label']||curie
    content = `## ${contentLabel}\n${content}`
    let items = g.list(curie,"?predicate")
    content += `### Properties\n`
    content += `
<div>
<form action="/item.md" method="get" id="searchForm">
<input type="hidden" name="id" value="${curie}"/>
<input type="search" name="q" value="${q}" autocomplete="off"/>
<input type="hidden" name="pg" value="${pg}"/>
<input type="submit" value="Search"/>
</form>
</div>
    `
    content +=`\n---\n`
    content += items.filter((item)=>fn.startsWith(fn.lowerCase(item.label),fn.lowerCase(q)))
                    .filter((item,index)=>(offset<=index)&& index < offset + pgSize)
                    .map((item)=>`* [${item.label}](${baseURL}/item.md?id=${item.curie}) [as ${item.propertyLabel}]`).join("\n")
    content = `<style>
h2 {color:navy;font-weight:bold;border-bottom:solid 2px navy;padding-bottom:5px;}    
    </style>\n${content}`
    content    
} 
