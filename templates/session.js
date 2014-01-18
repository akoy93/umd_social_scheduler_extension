{{! Handlebars template for initializing a session within a page }}
{{! Parameters: access_token, api_url, new_session }}
var xmlHttp = new XMLHttpRequest();
{{#if new_session}}
  xmlHttp.open("GET", "{{api_url}}access", true);
  xmlHttp.send("access_token={{access_token}}");
{{else}}
  xmlHttp.open("GET", "{{api_url}}logout", true);
  xmlHttp.send();
{{/if}}