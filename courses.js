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
    $(this).parent().parent().parent().find(".course-info-container").append("<br />" + tooltipContent);
    $("#" + courseCode + NO_SECTION).hide();
    $("#" + courseCode + NO_SECTION).tabs({ active: 0});
    $(this).parent().append(renderHandlebars(FRIEND_ICON_TEMPLATE,
      { course: courseCode, section: NO_SECTION, friend_icon_path: FRIEND_ICON_PATH }));
    
    $("#" + USER_INFO_DIV_ID).on("session", function() {
      var callback = function(label) {
        return function(response) {
          var selector = "#" + courseCode + NO_SECTION + "icon";
          if (response.data.length > 0) {
            var element = $(selector);
            element.show();
            element.parent().append(renderHandlebars(FRIEND_COUNT_TEMPLATE, 
              { count: response.data.length, label: label }));
            setTooltipEvent(element);
          }        
        };
      };

      getFriends(TERM, courseCode, NO_SECTION, callback("1st Degree"));
      getFriendsOfFriends(TERM, courseCode, NO_SECTION, callback("2nd Degree"));
    });
  });

  // creates tooltip interactivity with friends icons
  function setTooltipEvent(element) {
    element.attr("style", "cursor: pointer;");
    element.off("click");
    element.click(function() {
      if ($(this).attr('state') == "off") {
        $(this).attr('state', "on");
        $(element.attr('data-tooltip')).fadeIn(400);
      } else if ($(this).attr('state') == "on") {
        $(this).attr('state', "off");
        $(element.attr('data-tooltip')).fadeOut(200);
      }
    });
  }
});
