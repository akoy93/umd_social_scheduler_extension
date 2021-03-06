// store general session information
var API_URL = "http://www.umdsocialscheduler.com/"; // domain name for api
var LOGIN_DIV_ID = "login-template"; // id of div containing the login template
var LOGIN_BUTTON_ID = "login-button";
var LOGIN_BUTTON_PATH = chrome.extension.getURL('images/fb-connect-button.png');
var LOGOUT_BUTTON_ID = "logout-button";
var LOGOUT_BUTTON_PATH = chrome.extension.getURL('images/fb-logout-button.png');
var LOADER_ID = "login-loader";
var LOADER_PATH = chrome.extension.getURL('images/loading.gif');
var SHARE_BUTTON_ID = "share-button";
var SHARE_BUTTON_PATH = chrome.extension.getURL('images/facebook-share-icon.gif');
var SCHEDULE_ICON_PATH = chrome.extension.getURL('images/schedule-icon.png');
var USER_INFO_DIV_ID = "user-info"; // id of hidden div containing user information
var LOGIN_INFO_DIV_ID = "login-info"; // id of div displaying user login info
var CHECKBOX_DIV_ID = "checkbox-div";
var CHECKBOX_ID = "share-permission";
var FRIEND_ICON_PATH = chrome.extension.getURL('images/friend_icon.png');
var NOTE_ID = "permissions-note"; // id of element containing permissions note
var TOOLTIP_CSS = chrome.extension.getURL('css/tooltip.css');
var NO_SECTION = "0000"; // section code if no section provided
var SESSION_CREATED = false;
var FBID = null;
var NAME = null;
var ACCESS_TOKEN = null;
var SHARE_PERMISSION = null;

// template names
var TEMPLATES_DIR = chrome.extension.getURL('templates/');
var LOGIN_TEMPLATE = "login.html";
var LOGIN_SCRIPT = "login.js";
var SESSION_SCRIPT = "session.js";
var USER_INFO_TEMPLATE = "login_info.html";
var FRIENDS_TABS_TEMPLATE = "friends_tabs.html";
var FRIENDS_TABS_ID = "friends-tabs";
var SCHEDULE_FRIENDS_TEMPLATE = "schedule_tabs.html";
var SKELETON_ID = "schedule-friends-skeleton";
var SCHEDULE_FRIENDS_ID = "schedule-friends-tabs";
var FRIENDS_LIST_TEMPLATE = "friends_list.html";
var FRIENDS_OF_FRIENDS_LIST_TEMPLATE = "friends_of_friends_list.html";
var FRIEND_ICON_TEMPLATE = "friend_icon.html";
var NO_CONTENT_TEMPLATE = "no_content.html";
var HIDDEN_DIV_TEMPLATE = "hidden_div.html";
var FRIEND_COUNT_TEMPLATE = "friend_count.html";

// Handlebars helper for generating section string to append to output
Handlebars.registerHelper('appendSec', function(showSection, section) {
  if (section == "0000") { return ""; }
  return showSection ? ", Sec. " + section : "";
});

// Handlebars helper for getting loader_path (workaround because we use friends_tabs as a partial)
Handlebars.registerHelper('loader_path', function() {
  return LOADER_PATH;
});

// register friends partial
(function() { 
  $.ajax({
      url: TEMPLATES_DIR + FRIENDS_TABS_TEMPLATE,
      method: 'GET',
      async: false,
      success: function(data) {
        Handlebars.registerPartial('friends_tabs', data);
      }
  });
})();

// this function pings the server to determine if it is running
function ping() {
  try {
    var xmlHttp = new XMLHttpRequest();
    // we don't want a cached result:
    xmlHttp.open( "GET", API_URL + "alive?t=" + Math.random(), false);
    xmlHttp.send();
    return JSON.parse(xmlHttp.responseText).success
  } catch(err) {
    return false;
  }
}

// this function renders a template with handlebars js
function renderHandlebars(templateName, templateData) {
  if (!renderHandlebars.cache) { 
    renderHandlebars.cache = {};
  }

  if (!renderHandlebars.cache[templateName]) {
    var templateUrl = TEMPLATES_DIR + templateName;

    var templateString;
    $.ajax({
        url: templateUrl,
        method: 'GET',
        async: false,
        success: function(data) {
            templateString = data;
        }
    });

    renderHandlebars.cache[templateName] = Handlebars.compile(templateString);
  }

  return renderHandlebars.cache[templateName](templateData);
}

// accepts a jQuery selector to specify where to insert the login template
// inserts the script with login logic at the end of the body
function renderLoginTemplate(selector, position, insertShareButton) {
  var loginParams = { login_button_id: LOGIN_BUTTON_ID, logout_button_id: LOGOUT_BUTTON_ID, 
    user_div_id: USER_INFO_DIV_ID, loader_id: LOADER_ID, login_button_path: LOGIN_BUTTON_PATH,
    logout_button_path: LOGOUT_BUTTON_PATH, loader_path: LOADER_PATH, checkbox_id: CHECKBOX_ID,
    login_info_div_id: LOGIN_INFO_DIV_ID, insert_share_button: insertShareButton, 
    share_button_id: SHARE_BUTTON_ID, share_button_path: SHARE_BUTTON_PATH, note_id: NOTE_ID,
    checkbox_div_id: CHECKBOX_DIV_ID };

  // insert login template
  $(selector)[position]('<div id="' + LOGIN_DIV_ID + '"></div>');
  $("#" + LOGIN_DIV_ID).html(renderHandlebars(LOGIN_TEMPLATE, loginParams));

  // insert login script
  var loginScript = document.createElement("script");
  loginScript.type = "text/javascript";
  loginScript.innerHTML = renderHandlebars(LOGIN_SCRIPT, loginParams);
  document.head.appendChild(loginScript);
}

// adds event listeners for login and logout events
function handleLoginLogoutEvents() {
  // injects a script into the current page that either creates or ends a session on
  // the api server. this is necessary if we want to allow users to make api requests
  // from within the page (e.g. opening a friend's schedule image)
  var manageSessionInPage = function(newSession) {
    var params = { access_token: ACCESS_TOKEN, api_url: API_URL, new_session: newSession };
    var sessionScript = document.createElement("script");
    sessionScript.type = "text/javascript";
    sessionScript.innerHTML = renderHandlebars(SESSION_SCRIPT, params);
    document.head.appendChild(sessionScript);
  };

  // create a session for the chrome extension by sending the user's access token to the
  // server. render share permissions checkbox based on response.
  var createSessionAndHandleResponse = function() {
    // set checkbox according to user's data on server and add event listener for on
    // change event to update user's options on server
    var hookUpCheckbox = function() {
      // toggle checkbox based on response data
      if (SHARE_PERMISSION) {
        $("#" + CHECKBOX_ID).prop('checked', true);
      } else {
        $("#" + CHECKBOX_ID).prop('checked', false);
      }

      // handle user checkbox share permissions
      $("#" + CHECKBOX_ID).change(function() {
        if(this.checked) {
          $.getJSON(API_URL + "enable_sharing", function(response) {
            if (response.success) {
              location.reload();
            } else {
              alert("Failed to update permissions. Please refresh the page and try again.");
            }
          });
        } else {
          $.getJSON(API_URL + "disable_sharing", function(response) {
            if (response.success) {
              location.reload();
            } else {
              alert("Failed to update permissions. Please refresh the page and try again.");
            }
          });
        }
      });
    };

    $.getJSON(API_URL + "access", { access_token: ACCESS_TOKEN }, function(response) {
      if (response.success) {
        SHARE_PERMISSION = response.data.share;
        SESSION_CREATED = true;
        hookUpCheckbox();
        $("#" + CHECKBOX_DIV_ID).show();
        $("#" + LOADER_ID).hide();

        var sessionEvent = $.Event("session");
        $("#" + USER_INFO_DIV_ID).trigger(sessionEvent);
      } else {
        alert("Failed Facebook authentication. Try logging out and logging in again.");
      }
    });
  };

  // activates when user has logged out
  $("#" + USER_INFO_DIV_ID).on("logout", function() {
    manageSessionInPage(false);
    FBID = null; NAME = null; ACCESS_TOKEN = null; SHARE_PERMISSION = null;
    SESSION_CREATED = false;
    $("#" + LOGIN_INFO_DIV_ID).empty();
    $("#" + CHECKBOX_DIV_ID).hide();
    $("#" + SKELETON_ID).remove();
    // clear user's session on server
    $.getJSON(API_URL + "logout");
  });

  // activates when user has logged in
  $("#" + USER_INFO_DIV_ID).on("login", function() {
    // parse user info
    var data = $("#" + USER_INFO_DIV_ID).html().split("|");
    ACCESS_TOKEN = data[0]; FBID = data[1]; NAME = data[2];
    // create session on server within current page
    manageSessionInPage(true);
    // render login info
    var params = { name: NAME, fbid: FBID };
    $("#" + LOGIN_INFO_DIV_ID).html(renderHandlebars(USER_INFO_TEMPLATE, params));
    // create session for extension and handle response data
    createSessionAndHandleResponse();
  });
}

// increments tab count by given amount
function incrementCount(selector, inc) {
  var tab = $(selector);
  if (tab.length != 0) {
    var count = parseInt(tab.attr('count'));
    count += inc;
    tab.attr('count', count.toString());
    tab.html('(' + count + ')');
  }
}

// friends tabs template must have been rendered already
// invokes the get friends request and sends the response to a generated callback
// that inserts the data into the correct part of the template
function getFriends(term, course, section, coursesFunc) {
  var callback = (function(course, section) {
    return function(response) {
      if (!section) { section = ""; }

      var numFriends = response.data.length;
      var friendsSelector = "#" + course + section + "friends";

      if (numFriends <= 0) {
        $(friendsSelector).html(renderHandlebars(NO_CONTENT_TEMPLATE, 
          { message: "No friends to display" }));
      } else {
        var courseTabSelector = "#" + course + "count";
        var friendsTabSelector = "#" + course + section + " #friends-count";
      
        // render friend list
        var params = { api_url: API_URL, course: course, term: term, show_section: true,
          schedule_icon_path: SCHEDULE_ICON_PATH, friends: response.data, 
          share_permission: SHARE_PERMISSION };
        var element = $(friendsSelector);
        element.html(renderHandlebars(FRIENDS_LIST_TEMPLATE, params));
        element.find(".schedule-image").colorbox({photo: true}); // use colorbox to display schedule images

        incrementCount(courseTabSelector, numFriends);
        incrementCount(friendsTabSelector, numFriends);
      }
      // caller can pass in additional code through an argument
      if (coursesFunc) { coursesFunc.call(this, response); }
    };
  })(course, section);

  // invalid section number
  if (section === "0000") { section = null; }

  $.getJSON(API_URL + "friends", { term: term, course: course, section: section }, callback);
}

// friends tabs template must have been rendered already
// invokes the get friends of friends request and sends the response to a generated callback
// that inserts the data into the correct part of the template
function getFriendsOfFriends(term, course, section, coursesFunc) {
  var callback = (function(course, section) {
    return function(response) {
      if (!section) { section = ""; }

      var numFriendsOfFriends = response.data.length;
      var friendsOfFriendsSelector = "#" + course + section + "friendsoffriends";

      if (numFriendsOfFriends <= 0) {
        $(friendsOfFriendsSelector).html(renderHandlebars(NO_CONTENT_TEMPLATE,
          { message: "No suggestions to make" }));
      } else {
        var courseTabSelector = "#" + course + "count";
        var friendsTabSelector = "#" + course + section + " #friendsoffriends-count";

        // render people you may know list
        var params = { friends_of_friends: response.data, show_section: true };
        $(friendsOfFriendsSelector).html(renderHandlebars(FRIENDS_OF_FRIENDS_LIST_TEMPLATE, params));

        incrementCount(courseTabSelector, numFriendsOfFriends);
        incrementCount(friendsTabSelector, numFriendsOfFriends);
      }
      // caller can pass in additional code through an argument
      if (coursesFunc) { coursesFunc.call(this, response); }
    };
  })(course, section);

  // invalid section number
  if (section == NO_SECTION) { section = null; }

  $.getJSON(API_URL + "friendsoffriends", { term: term, course: course, section: section }, 
    callback);
}
