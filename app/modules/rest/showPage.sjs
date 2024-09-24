declareUpdate(); 
const NS =require('/lib/ns.js').NS; 
const Graph = require('/lib/graph.js').Graph;
const Markdown = require('/lib/markdown.js').Markdown;
const SparqlFunction =require('/lib/sparqlFunction.js').SparqlFunction;
let ns = new NS()
ns.load("/json/ns.json")
let createList = (props)=>{return Object.keys(props).map((prop,index)=>"* __"+prop+"__ : "+props[prop]).join('\n')}
let page = xdmp.getRequestField("page","home")
page = (page=="")?"home":page
let id = xdmp.getRequestField("id","")
let mode = xdmp.getRequestField("mode","json")
let g = new Graph(ns,mode)
let md = new Markdown(ns,g)
let getPage = (page)=> fn.document(`/markdown/${page}.md`)
let templateSrc = (fn.document("/markdown"+page+".md").toString()).replace(/`/g,"\\`")
//let templateLiteral = `${templateSrc}`;
templateSrc = templateSrc.replace('~','`',"g")
let template = (ns,g,id,props)=>eval("`"+templateSrc+"`");

let fullPath = xdmp.getOriginalUrl()
let propStrings = fullPath.split(/\?|;/).slice(1)
let props = {}
propStrings.forEach((propString)=>{  
    let [key,value] = propString.split("=")
    props[key]=value
    }) 
let content = template(ns,g,id,props)

if (mode == "md"){
    xdmp.setResponseContentType("text/markdown")
    content
}
else if (mode == "html"){
    let htmlTemplate = new String(""+(fn.document("/html/test.htm")))
    xdmp.setResponseContentType("text/html")
    let markdown = template(ns,g,id,props)
    let regExp = new RegExp(/\[markdown\]/)
    let response = htmlTemplate.replace(regExp,markdown)
    response
}
else if (mode == "json"){
    xdmp.setResponseContentType("text/json")
//    let markdown = template(ns,g,id,props)
    props
}


//templateSrc
/*let username=xdmp.getRequestField("username","World")
let image = xdmp.getRequestField("image","")
let images = ["https://tinyurl.com/27nln833",'https://tinyurl.com/24cen88j','https://tinyurl.com/27qj8cyf','https://tinyurl.com/234qbjk5'];
let index = Math.floor(Math.random()*images.length)
image = (image!="")?images[index]:images[0]
let result = template(username,image)
result*/
