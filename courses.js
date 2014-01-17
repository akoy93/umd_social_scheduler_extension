// gracefully degrade if server is down
if (ping()) {
  var LOGIN_TEMPLATE_PATH = "#search-box-wrapper";

  $(document).ready(function() {
    renderLoginTemplate(LOGIN_TEMPLATE_PATH, "before", false);
    handleLoginLogoutEvents();
  });
}