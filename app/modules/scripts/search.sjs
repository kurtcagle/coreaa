declareUpdate();         
const NS =require('/lib/ns.js').NS;
const Graph =require('/lib/graph.js').Graph;
const Links =require('/lib/links.js').Links;
const baseURL = Links.baseURL                  
let ns = new NS()
ns.load("/json/ns.json")
ns.sparql
let g = new Graph(ns) 
/*if(fn.endsWith(curie,".md")) {
    curie = fn.substringBefore(curie,".md")
    let format = ".md"
}
else if(fn.endsWith(curie,".json")) {
    curie = fn.substringBefore(curie,".json")
    let format = ".json"
}*/
let format = xdmp.getRequestField("format",".md")
let q = xdmp.getRequestField("q","")
let items = g.fromLabel(q)
let pgSize = 1000
let pg = parseInt(xdmp.getRequestField("pg","0"))
let offset = pg*pgSize
if(format == ".json"){
    xdmp.setResponseContentType("text/json")
    items  
}
else if(format == ".md" || format == ".html"){
    let content = `## Search
<div>
<form action="/search.md" method="get" id="searchForm">
<input type="search" name="q" value="${q}" autocomplete="off"/>
<input type="hidden" name="pg" value="${pg}"/>
<input type="submit" value="Search"/>
<span><a href="diagram2.html?id=Platform:"><button style="height:30px">Graph</button></a></span>
</form>
</div>
    `
    content +=`\n---\n`
    content += (q != "")?items.filter((item,index)=>(offset<=index)&& index < offset + pgSize)
                    .map((item)=>`1. [${item.label}](page/Entry.html?id=${item.curie}) [as ${item.typeLabel}]
    <div class="description">${item.description}</div>
    `).join("\n"):''
    content = `<style>
h2 {color:navy;font-weight:bold;border-bottom:solid 2px navy;padding-bottom:5px;}    
    </style>\n${content}`
    content   
}
