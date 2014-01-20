// gracefully degrade if server is down
if (!ping()) { return; }

var HIDDEN_DIV_ID = "tooltip-content";
var COURSE_CODE_SELECTOR = ".course-id"; // course code is the html of the div
var NO_SECTION = "0000"; // section code if no section provided
var LOGIN_TEMPLATE_LOCATION = "#search-box-wrapper";
var TERM = /termId\=(\d{6})/.exec(window.location)[1];

$(document).ready(function() {
  renderLoginTemplate(LOGIN_TEMPLATE_LOCATION, "before", false);
  handleLoginLogoutEvents();

  $('body').append(renderHandlebars(HIDDEN_DIV_TEMPLATE, { div_id: HIDDEN_DIV_ID }));

  $(COURSE_CODE_SELECTOR).each(function() {
    var courseCode = $(this).html();
    var tooltipContent = renderHandlebars(FRIENDS_TABS_TEMPLATE, 
      { course: courseCode, section: NO_SECTION, show_section: true });
    $("#" + HIDDEN_DIV_ID).append(tooltipContent);
    $("#" + courseCode + NO_SECTION).tabs({ active: 0 });
    $(this).parent().append(renderHandlebars(FRIEND_ICON_TEMPLATE,
      { course: courseCode, section: NO_SECTION, friend_icon_path: FRIEND_ICON_PATH }));
    
    $("#" + USER_INFO_DIV_ID).on("session", function() {
      getFriends(TERM, courseCode, NO_SECTION, function(response) {
        var selector = "#" + courseCode + NO_SECTION + "icon";
        if (response.data.length > 0) {
         $(selector).show();
         $(selector).parent().append(renderHandlebars(FRIEND_COUNT_TEMPLATE, 
           { count: response.data.length, label: "1st Degree" }));
        }
      });

      getFriendsOfFriends(TERM, courseCode, NO_SECTION, function(response) {
        var selector = "#" + courseCode + NO_SECTION + "icon";
        if (response.data.length > 0) {
         $(selector).show();
         $(selector).parent().append(renderHandlebars(FRIEND_COUNT_TEMPLATE, 
           { count: response.data.length, label: "2nd Degree" }));
        }
      });
    });
  });
});
