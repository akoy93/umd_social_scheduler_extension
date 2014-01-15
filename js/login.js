$(document).ready(function() {
  // $.ajaxSetup({ cache: true });
 $.getScript('https://connect.facebook.net/en_UK/all.js', function() {
    FB.init({
      appId      : '316801275074193',
      status     : true,
      cookie     : true,
      xfbml      : true,
      oauth      : true 
    });

    var updateLoginStatus = function(response) {
      if (response.authResponse) { // user is logged in
        // get user information
        FB.api('/me', { fields: 'name' }, function(response) { 
          var info = eval(response);
          alert(JSON.stringify(info, undefined, 2));
          IS_LOGGED_IN = true;
          FBID = info["id"];
          NAME = info["name"];
          renderLoginTemplate();
        });

        // create session for umd social scheduler api access
        $.getJSON(API_URL + "access", { access_token: response.authResponse.accessToken }, 
          function(data) {
            if (!data.success) {
              alert("We could not authenticate you on Facebook. Please logout and login again.");
            }
          });

        alert(LOGOUT_BUTTON_ID);

        // listen for logout event
        $("#" + LOGOUT_BUTTON_ID).click(function() {
          FB.logout(function(response) {
            $.getJSON(API_URL + "logout"); // clear session on server
            IS_LOGGED_IN = false;
            FBID = null;
            NAME = null;
            renderLoginTemplate();
          })
        });
      } else { // user is logged out
        $("#" + LOGIN_BUTTON_ID).click(function() { 
          FB.login(function (response) {
            if (!response.authResponse) {
              alert('Failed to connect to Facebook.');
            }
          }, { scope: 'publish_actions' })
        });
      }
    };

    FB.Event.subscribe('auth.statusChange', updateLoginStatus);
});

// Load the SDK asynchronously
(function(d) {
  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = "http://connect.facebook.net/en_US/all.js";
  ref.parentNode.insertBefore(js, ref);
} (document));