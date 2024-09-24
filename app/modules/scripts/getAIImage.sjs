'use strict';
let url = "https://api.openai.com/v1/images/generations"
let apiKey = "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"
let requestBody = {
    "model": "dall-e-3",
    "prompt": xdmp.getRequestField("prompt","A  highly realistic DSLR-quality image of a mermaid wearing a cropped, low cut half t-shirt and short blonde hair in an office. She's sitting back in her chair, with her tail fin up on the desk. Her manager looks at her with disapproval."),
    "n": 1,
    "style":"vivid",
    "size": "1024x1024"
  }
let response = xdmp.httpPost(url,{"headers":{"content-type":"application/json","Authorization":`Bearer ${apiKey}`}},requestBody).toArray()[1]
let message = response.toObject()
let contentType = xdmp.setResponseContentType("text/html")
if (message.data){
    let contentType = xdmp.setResponseContentType("text/html")
    let template = (message)=>`
    <div><img src="${message.data[0].url}"/><br/><p>${message.data[0].revised_prompt}</p>
    <form action="/scripts/getAIImage.sjs" method="post">
    <textarea name="prompt" rows="4" cols="50">${requestBody.prompt}</textarea>
    <br/>
    <input type="submit" value="Generate New Image" />
    </div>`
    template(message)
}
else if(message.error) {
    let contentType = xdmp.setResponseContentType("text/html")
    let template = (message)=>`
    <div><br/>
    <p>${message.error.message}</p>
    <form action="/scripts/getAIImage.sjs" method="post">
    <textarea name="prompt" rows="4" cols="50">${requestBody.prompt}</textarea>
    <br/>
    <input type="submit" value="Generate New Image" />
    </div>`
    template(message)
} 
else {
    let contentType = xdmp.setResponseContentType("text/html")
    let template = (message)=>`
    <div><br/>
    <p>${message.error.message}</p>
    <form action="/scripts/getAIImage.sjs" method="post">
    <textarea name="prompt" rows="4" cols="50">${requestBody.prompt}</textarea>
    <br/>
    <input type="submit" value="Generate New Image" />
    </div>`
    template(message)
}