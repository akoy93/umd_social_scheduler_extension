{{! Handlebars template for initializing a session within a page }}
{{! Parameters: access_token, api_url }}
var xmlHttp = new XMLHttpRequest();
xmlHttp.open("GET", "{{api_url}}access", true);
xmlHttp.send("access_token={{access_token}}");