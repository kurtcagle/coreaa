xquery version "1.0-ml";
module namespace     requests="http://marklogic.com/appservices/requests";
import module namespace rest = "http://marklogic.com/appservices/rest"
    at "/MarkLogic/appservices/utils/rest.xqy";
declare variable $requests:options as element(rest:options) :=
  <options xmlns="http://marklogic.com/appservices/rest">
    <request uri="children(\..+)" endpoint="/scripts/childNodes.sjs">
      <uri-param name="format">$1</uri-param>
      <param name="id" as="string" match="(.+)">$1</param>
      <param name="mode" as="string" match="(.+)" default="strStarts">$1</param>
      <param name="q" as="string" match="(.+)" default="">$1</param>
      <http method="GET"/>
    </request>
    <request uri="files/?(.*)" endpoint="/rest/upload.sjs">
      <uri-param name="_ml_post_">$1</uri-param>
      <http method="GET POST"/>
    </request>
    <request uri="item.md" endpoint="/scripts/getItem.sjs">
      <!--<param name="format" as="string" match="(.+)" default=".md">$1</param>-->
      <!--<uri-param name="format">$1</uri-param>-->
      <param name="id" as="string" match="(.+)">$1</param>
      <param name="q" as="string" match="(.+)">$1</param>
      <param name="pg" as="integer" match="(.+)" default="0">$1</param>
      <param name="format" as="string" match="(.+)" default=".md">$1</param>
      <http method="GET POST"/>
    </request>
    <request uri="item.json" endpoint="/scripts/getItem.sjs">
      <!--<param name="format" as="string" match="(.+)" default=".md">$1</param>-->
      <!--<uri-param name="format">$1</uri-param>-->
      <param name="id" as="string" match="(.+)">$1</param>
      <param name="q" as="string" match="(.+)">$1</param>
      <param name="pg" as="integer" match="(.+)" default="0">$1</param>
      <param name="format" as="string" match="(.+)" default=".json">$1</param>
      <http method="GET POST"/>
    </request>
    <request uri="search.json" endpoint="/scripts/search.sjs">
      <!--<param name="format" as="string" match="(.+)" default=".md">$1</param>-->
      <!--<uri-param name="format">$1</uri-param>-->
      <param name="q" as="string" match="(.+)">$1</param>
      <param name="pg" as="integer" match="(.+)" default="0">$1</param>
      <param name="format" as="string" match="(.+)" default=".json">$1</param>
      <http method="GET POST"/>
    </request>
    <request uri="search.md" endpoint="/scripts/search.sjs">
      <!--<param name="format" as="string" match="(.+)" default=".md">$1</param>-->
      <!--<uri-param name="format">$1</uri-param>-->
      <param name="q" as="string" match="(.+)">$1</param>
      <param name="pg" as="integer" match="(.+)" default="0">$1</param>
      <param name="format" as="string" match="(.+)" default=".md">$1</param>
      <http method="GET POST"/>
    </request>
    <request uri="search.html" endpoint="/scripts/search.sjs">
      <!--<param name="format" as="string" match="(.+)" default=".md">$1</param>-->
      <!--<uri-param name="format">$1</uri-param>-->
      <param name="q" as="string" match="(.+)">$1</param>
      <param name="pg" as="integer" match="(.+)" default="0">$1</param>
      <param name="format" as="string" match="(.+)" default=".html">$1</param>
      <http method="GET POST"/>
    </request>
    <request uri="page/(.*?).md" endpoint="/rest/showPage.sjs">
      <uri-param name="page">$1</uri-param>
      <param name="id" as="string" match="(.+)">$1</param>
      <param name="mode" as="string" match="(.+)" default="md">$2</param>
      <param name="preventCache" as="string" match="(.+)">$3</param>
      <http method="GET POST"/>
    </request>
    <request uri="page/(.*?).json" endpoint="/rest/showPage.sjs">
      <uri-param name="page">$1</uri-param>
      <param name="id" as="string" match="(.+)">$1</param>
      <param name="mode" as="string" match="(.+)" default="json">$2</param>
      <param name="preventCache" as="string" match="(.+)">$3</param>
      <http method="GET POST"/>
    </request>
    
    <request uri="page/(.*?).html" endpoint="/rest/showPage.sjs">
      <uri-param name="page">$1</uri-param>
      <param name="id" as="string" match="(.+)">$1</param>
      <param name="mode" as="string" match="(.+)" default="html">$2</param>
      <param name="preventCache" as="string" match="(.+)">$3</param>
      <http method="GET POST"/>
    </request>
    <request uri="themes/(.*?)" endpoint="/rest/passthru.sjs">
      <uri-param name="page">$1</uri-param>
      <param name="section" as="string" match="(.+)" default="themes">$1</param>
      <http method="GET"/>
    </request>
    <request uri="media/(.*?)" endpoint="/rest/passthru.sjs">
      <uri-param name="page">$1</uri-param>
      <param name="section" as="string" match="(.+)" default="media">$1</param>
      <http method="GET"/>
    </request>

    <request uri="html/(.*?)" endpoint="/rest/passthru.sjs">
      <uri-param name="page">$1</uri-param>
      <param name="section" as="string" match="(.+)" default="html">$1</param>
      <http method="GET"/>
    </request>


  <request uri="(.+)" endpoint="/rest/showPage.xqy">
      <uri-param name="page">$1</uri-param>
  </request>


  </options>;