id = ${id}

<div>
<form action="/search.md" method="get" id="searchForm">
<input type="search" name="q" value="" autocomplete="off"/>
<input type="hidden" name="pg" value="0"/>
<input type="submit" value="Search"/>
<select onchange="console.log(location.href='diagram2.html?id='+this.value)">

${g.list("sh:NodeShape","rdf:type").map((shape)=>"<option value='"+shape.curie+"' "+((shape.curie === id.split(":")[0]+":")?'selected':'')+">"+shape.label+"</option>").join("\n")}

</select>

</form>
<span><a href="Entry.html?id=${id}"><button style="height:30px">Entry</button></a></span>
</div>

```mermaid
${g.treeView(id)}
```