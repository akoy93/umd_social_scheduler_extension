// gracefully degrade if server is down
if (!ping()) { return; }

var COURSE_CODE_SELECTOR = ".course-id"; // course code is the html of the div
var LOGIN_TEMPLATE_LOCATION = "#search-box-wrapper";
var TERM = (function() {
  var match = /termId\=(\d{6})/.exec(window.location);
  if (match == null) { return null; }
  return match[1];
})();
var getCourseDivId = function(courseCode) {
  return courseCode + "tooltips";
};

$(document).ready(function() {
  var rendered = []; // keep track of rendered objects so we can clear on logout

  renderLoginTemplate(LOGIN_TEMPLATE_LOCATION, "before", false);
  handleLoginLogoutEvents();

  // remove rendered elements on logout
  $("#" + USER_INFO_DIV_ID).on("logout", function() {
    rendered.map(function(obj) { obj.remove(); });
    $("#" + USER_INFO_DIV_ID).one("login", function() {
      insertContent();
    });
  });

  insertContent();

  // generate friend icons for each class in the course list
  function insertContent() {
    $(COURSE_CODE_SELECTOR).each(function() {
      var courseCode = $(this).html();
      var tooltipContent = renderHandlebars(FRIENDS_TABS_TEMPLATE, 
        { course: courseCode, section: NO_SECTION, show_section: true });
      var divId = getCourseDivId(courseCode);

      $(this).parent().parent().parent().find(".course-info-container")
        .append("<div id=\"" + divId + "\" style=\"padding-top: 15px;\"></div>");
      var container = $("#" + divId);
      rendered.push(container);
      container.append(tooltipContent);
      var tooltipDiv = $("#" + courseCode + NO_SECTION);
      tooltipDiv.hide();
      tooltipDiv.tabs({ active: 0});

      $(this).parent().append(renderHandlebars(FRIEND_ICON_TEMPLATE,
        { course: courseCode, section: NO_SECTION, friend_icon_path: FRIEND_ICON_PATH }));
      
      // after user has logged in and created a session on the server
      $("#" + USER_INFO_DIV_ID).one("session", function() {
        var callback = function(label) {
          return function(response) {
            var selector = "#" + courseCode + NO_SECTION + "icon";
            if (response.data.length > 0) {
              var element = $(selector);
              element.show();
              element.parent().append(renderHandlebars(FRIEND_COUNT_TEMPLATE, 
                { count: response.data.length, label: label }));
              rendered.push(element.parent()); // container for friend icon and info
              setTooltipEvent(element);
            }        
          };
        };

        getFriends(TERM, courseCode, NO_SECTION, callback("1st Degree"));
        getFriendsOfFriends(TERM, courseCode, NO_SECTION, callback("2nd Degree"));
      });
    });
    }
  // creates tooltip interactivity with friends icons
  function setTooltipEvent(element) {
    element.attr("style", "cursor: pointer;");
    element.off("click");
    element.click(function() {
      var content = $(element.attr('data-tooltip'));
      if (content.attr('state') == 'off') {
        // hide all other sets of tabs
        content.parent().children().hide();
        content.parent().children().each(function() {
          $(this).attr('state', 'off');
        });
        // show requested set of tabs
        content.attr('state', 'on');
        content.slideDown();
      } else if (content.attr('state') == 'on') {
        content.attr('state', 'off');
        content.slideUp();
      }
    });
  }
});
