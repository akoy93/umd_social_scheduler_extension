var xmlHttp = new XMLHttpRequest();
xmlHttp.open( "GET", API_URL + "alive", false);
xmlHttp.send();

if (JSON.parse(xmlHttp.responseText).success) { // graceful degradation if server is not up
  var LOGIN_TEMPLATE_PATH = "#search-box-wrapper";

  $(document).ready(function() {
    renderLoginTemplate(LOGIN_TEMPLATE_PATH, "before", false);
    handleLoginLogoutEvents();
  });
}