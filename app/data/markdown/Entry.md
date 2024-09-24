<div>
<form action="/search.html" method="get" id="searchForm">
<input type="search" name="q" value="" autocomplete="off"/>
<input type="hidden" name="pg" value="0"/>
<input type="submit" value="Search"/>
</form>
<span><a href="diagram2.html?id=${id}"><button style="height:30px">Graph</button></a></span>
</div>

${md.properties(id)}
# Links 
${md.bookmarks(g.list(id,"?predicate"),"html")}
