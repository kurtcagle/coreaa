import Fastify from 'fastify'
import fastifyStatic from '@fastify/static';

import cors from '@fastify/cors';
import {NS} from './app/ns.js';
import {Graph} from './app/graph.js'
import {Markdown} from './app/markdown.js'
import OpenAI from 'openai';
import fs from 'fs';
import { Marked } from 'Marked';
import { getAbsolutePath } from 'esm-path'  
import { jsonrepair } from 'jsonrepair';
import {graph, lit, namedNode, parse, serialize, st} from "rdflib";
import * as $rdf from "rdflib";

const options = {}
const extension = {}
const marked = new Marked([options, extension]);

//import * as fs from 'fs';

const ns = new NS()
ns.load()
const g = new Graph(ns)
const markdown = new Markdown(ns,g)
const app = Fastify({
  logger: true
})
app.register(cors, {
  origin: '*',
});

app.register(fastifyStatic, {
  root: getAbsolutePath(import.meta.url) // Set the directory for static files
})

// Configure OpenAI API key
let apiKey = process.env.OPENAI_API_KEY;
let openai = new OpenAI() 

/* app.register(fastifyStatic, {
  root: './media' // Set the directory for static files
});*/

// Declare a route
app.get('/test', async function handler (request, reply) {
  let id = request.query.id
  let prop = request.query.prop??"rdf:type"
//  return request.query
  let list = await g.list(id,prop)
  let html = markdown.bookmarks(list,"html")
  reply.type('text/html').send(html)
//  reply.type('text/json').send(list)
   // let html = markdown.bookmarks(list,"html")
 // return { list:list,result:html }
//  reply.type('text/json').send(list)
//  return markdown.bookmarks(list,"html")
})

app.get('/', async function handler (request, reply) {
  let html = fs.readFileSync('index.html','utf8')
  reply.type('text/html').send(html)
  })

app.get('/ai', async function handler (request, reply) {
/*  let id = request.query.id
  let prop = request.query.prop??"rdf:type"
  let html=`<p><b>id:</b> ${id}</p><p><b>prop:</b> ${prop}</p><p>/ai works</p>`
//  let html=`<p>/ai works ${id}</p>`
  reply.type('text/html').send(html)*/
  reply.type('text/json').send(configuration)
})
app.get('/page/:page', async function handler (request, reply) {
  let page = request.params.page
  let htmlTemplate = fs.readFileSync('./page/frame.html','utf8')
  let md = fs.readFileSync(`./page/${page}.md`,'utf8')
  let modHTML = marked.parse(md)
  let result = htmlTemplate.replace("[template]",modHTML)
  
  // let html = markdown.page(id,"html")
  //let htmlTemplate = // markdown.page(id,"html")
  reply.type('text/html').send(result)
})
app.get('/media/:path', async function handler (request, reply) {
  let path = request.params.path
  let file = fs.readFileSync(`.\\media\\${path}`)
  let basePath = getAbsolutePath(import.meta.url)
  let media = `${basePath}\\media\\${path}`
  return reply.send(file)
})
  

app.post('/api/chat', async (request, reply) => {
  const prompt = request.body.prompt;

  try {
    const completion = await openai.chat.completions.create({
        messages: [
            {"role": "system", "content": `For every message, include a title. 
              Return the response as a JSON object {id,title,keywords,body} with properties id (as string), title (as string), keywords (as array), and body (as UTF-8 string).              
              keywords is an array of five keywords that topically summarize the response,
              body is a detailed explanation in Markdown including a bullet list of the keywords at the end, 
              do not use LateX output in the body, 
              do not use smart quotes in the body,
              and id is a unique guid of the form http://www.uniqueguid.com/{unique identifier}. 
              Ensure that the JSON is well-formed. 
              `},
            {"role": "user", "content": prompt}
          ],
        model: "gpt-4o-mini",
      });

    //const response = completion.data.choices[0].message.content;
    reply.type("text/json").send({ completion});
  } catch (error) {
    console.log('Error communicating with OpenAI API:', error);
    reply.status(500).send({ error: 'An error occurred while processing your request.' });
  }
});


// Run the server!
try {
  await app.listen({ port: 3000 })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
