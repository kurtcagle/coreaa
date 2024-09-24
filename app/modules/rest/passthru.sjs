declareUpdate();
const NS =require('/lib/ns.js').NS; 
const SparqlFunction =require('/lib/sparqlFunction.js').SparqlFunction;
let ns = new NS()
ns.load("/json/ns.json")
let section = xdmp.getRequestField("section","themes")
let page = xdmp.getRequestField("page","home")
let url = `/${section}${page}`
let output = fn.document(url)
/*let templateSrc = (fn.document("/markdown"+page+".md").toString()).split("`").join("\\`")
let template = (ns)=>eval("`"+templateSrc+"`")
let content = template(ns)*/

//xdmp.setResponseContentType("text/css")
//let  content = `# ${page}`
output

/*let username=xdmp.getRequestField("username","World")
let image = xdmp.getRequestField("image","")
let images = ["https://tinyurl.com/27nln833",'https://tinyurl.com/24cen88j','https://tinyurl.com/27qj8cyf','https://tinyurl.com/234qbjk5'];
let index = Math.floor(Math.random()*images.length)
image = (image!="")?images[index]:images[0]
let result = template(username,image)
result*/
