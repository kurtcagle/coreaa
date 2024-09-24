declareUpdate([])
const cpf = require('/MarkLogic/cpf/cpf');
let path = xdmp.getRequestField("_ml_post_","temp.txt")
let uri = "/files"+path
if (xdmp.getRequestMethod() === "POST"){
    let content = xdmp.getRequestBody("text")
    xdmp.documentInsert(uri,content);
    uri
}
else   
    if (fn.endsWith(uri, "/")){
        let files = xdmp.directory(uri).toArray()
        //files.map((node)=>xdmp.nodeUri(node))
        files.map((node)=>xdmp.nodeUri(node)).map((filename)=>{return {
            "filename":filename ,
            "filesize":fn.doc(filename).toString().length, 
            "lastModified":xdmp.timestampToWallclock(xdmp.documentTimestamp(filename)),
            "contentType":xdmp.documentGetContentType(filename)
    }
    else
        fn.doc(uri)


