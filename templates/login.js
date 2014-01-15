{{! Handlebars template for login logic }}
{{! Posts user info to the div with user_div_id in the form of token|fbid|name }}
{{! Parameters: login_button_id, logout_button_id, user_div_id, loader_id }}
var loginButton = document.getElementById("{{login_button_id}}");
var logoutButton = document.getElementById("{{logout_button_id}}");
var userInfo = document.getElementById("{{user_div_id}}");
var loader = document.getElementById("{{loader_id}}");

window.fbAsyncInit = function() {
  FB.init({ appId: '316801275074193',
    status: true, 
    cookie: true,
    xfbml: true,
    oauth: true
  });

  // puts user info in a div for read by the content script and dispatches an event
  function handleLogin(response) {
    FB.api('/me', function(info) {
      // set the user info div
      var accessToken = response.authResponse.accessToken;
      var fbid = info.id;
      var name = info.name;
      userInfo.innerHTML = accessToken + "|" + fbid + "|" + name;
      // dispatch a login event
      var loginEvent = document.createEvent('Event');
      loginEvent.initEvent('login', true, true);
      userInfo.dispatchEvent(loginEvent);
    });
  }

  function updateLoginStatus(response) {
    // user is already logged in and connected
    if (response.authResponse) {
      loader.style.display = "block";
      logoutButton.style.display = "block";
      loginButton.style.display = "none";

      handleLogin(response);

      // clears user info on logout and dispatches an event
      logoutButton.onclick = function() {
        FB.logout(function() {
          userInfo.innerHTML = "";
          var logoutEvent = document.createEvent('Event');
          logoutEvent.initEvent('logout', true, true);
          userInfo.dispatchEvent(logoutEvent);
        });
      };
    //user is not connected to your app or logged out
    } else {
      loader.style.display = "none";
      logoutButton.style.display = "none";
      loginButton.style.display = "block";

      loginButton.onclick = function() {
        FB.login(function(response) {
          loader.style.display = "block";
          if (response.authResponse) {
            handleLogin(response);
          } else {
            //user cancelled login or did not grant authorization
            loader.style.display = "none";
            alert('Failed to connect to Facebook.');
          }
        }, {scope: 'publish_actions'});
      };
    }
  }

  FB.getLoginStatus(updateLoginStatus);
  FB.Event.subscribe('auth.statusChange', updateLoginStatus);
};

// insert the fb-root div and load the Facebook Javascript SDK asynchronously
(function(d) {
  var fb_root = d.createElement("div");
  fb_root.id = "fb-root";
  d.body.appendChild(fb_root);
  var e = d.createElement('script'); e.async = true;
  e.src = d.location.protocol + '//connect.facebook.net/en_US/all.js';
  d.getElementById('fb-root').appendChild(e);
}(document));
