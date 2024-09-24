const express = require('express')
const app = express()
const NS = require('./app/modules/lib/ns.cjs')
let ns = new NS()
ns.load()
const graph = require('./app/modules/lib/graph.cjs')


app.get('/', function (req, res) {
//  res.send('Hello World')
  res.send(graph.list("Application:"))
})

app.listen(3000)