declareUpdate();
let templateSrc = fn.document("/markdown/markdown.md")
let template = (username,image)=>eval("`"+templateSrc+"`")
let username=xdmp.getRequestField("username","World")
let image = xdmp.getRequestField("image","")
let images = ["https://tinyurl.com/27nln833",'https://tinyurl.com/24cen88j','https://tinyurl.com/27qj8cyf','https://tinyurl.com/234qbjk5'];
let index = Math.floor(Math.random()*images.length)
image = (image!="")?images[index]:images[0]
let result = template(username,image)
xdmp.setResponseContentType("text/markdown")
result
