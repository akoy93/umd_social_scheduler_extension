// gracefully degrade if server is down
if (!ping()) { return; }

var COURSE_SELECTOR = "div.course"; // course code is the html of the div
var FRIEND_ICON_PLACEMENT_SELECTOR = "div.course-id-container.one.columns";
var CONTENT_PLACEMENT_SELECTOR = "div.course-info-container.eleven.columns";
var LOGIN_TEMPLATE_LOCATION = "#search-box-wrapper";
var SECTIONS_LINK_SELECTOR = "a.toggle-sections-link";
var SECTION_SELECTOR = "div.section";
var SECTION_CODE_SELECTOR = "span.section-id";
var TERM = (function() {
  var match = /termId\=(\d{6})/.exec(window.location);
  if (match == null) { return null; }
  return match[1];
})();

$(document).ready(function() {
  // refresh page on logout to remove all generated content
  $("#" + USER_INFO_DIV_ID).on("logout", function() { location.reload(); });

  renderLoginTemplate(LOGIN_TEMPLATE_LOCATION, "before", false);
  handleLoginLogoutEvents();

  // generate all content on the courses webpage
  $(COURSE_SELECTOR).each(function() {
    var courseCode = $(this).attr('id');
    var tooltipContent = renderHandlebars(FRIENDS_TABS_TEMPLATE, 
      { course: courseCode, section: NO_SECTION, show_section: true });
    var divId = courseCode + "tooltips";

    // place social information at the end of course information container
    $(this).find(CONTENT_PLACEMENT_SELECTOR)
      .append("<div id=\"" + divId + "\" style=\"padding-top: 15px;\"></div>");
    var container = $("#" + divId);

    // add a friends icon for each course
    $(this).find(FRIEND_ICON_PLACEMENT_SELECTOR).append(renderHandlebars(FRIEND_ICON_TEMPLATE,
      { course: courseCode, section: NO_SECTION, friend_icon_path: FRIEND_ICON_PATH }));

    // generate tabs for social information and place them in the container
    insertSocialInformation(container, courseCode, NO_SECTION);

    // generate content for individual sections after "show sections" click
    (function(parent) {
      parent.find(SECTIONS_LINK_SELECTOR).first().one("click", function() {
        // wait for section divs to populate
        (function processSections() {
          var sections = parent.find(SECTION_SELECTOR);
          if (sections.length !== 0) {
            // wait for section-id spans to populate
            if (sections.last().find(SECTION_CODE_SELECTOR).first().html() === undefined) {
              setTimeout(function() { processSections(); }, 200)
            } else {
              // reaching this point, we know we can read each section
              sections.each(function() {
                var sectionSpan = $(this).find(SECTION_CODE_SELECTOR);
                var section = sectionSpan.html().replace(/\s+/g, '');

                // insert friend icons
                $(this).append(renderHandlebars(FRIEND_ICON_TEMPLATE,
                  { course: courseCode, section: section, friend_icon_path: FRIEND_ICON_PATH, compact: true }));
                insertSocialInformation(container, courseCode, section);
              });
            }
          } else {
            setTimeout(function() { processSections(); }, 50);
          }
        })();
      });
    })($(this));
  });

  // insert tooltip div in container for the corresponding courseCode/section
  function insertSocialInformation(container, courseCode, section) {
    // creates tooltip interactivity with friends icons
    var setTooltipEvent = function(element) {
      element.attr("style", "cursor: pointer;"); // this gets overridden if put in template
      element.off("click").click(function() {
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
    };

    // creates a callback for get friends and get friends of friends requests
    // this adds behavior that renders the information in the response and inserts
    // it into the page
    var createCallback = function(courseCode, section, label) {
      if (!createCallback.cache) { createCallback.cache = {}; }
      return function(response) {
        if (response.data.length > 0) {
          var iconDiv = $("#" + courseCode + section + "div");
          var element = $("#" + courseCode + section + "icon");
          iconDiv.show();
          element.show();
          element.parent().append(renderHandlebars(FRIEND_COUNT_TEMPLATE, 
            { count: response.data.length, label: label, compact: section != NO_SECTION }));
          setTooltipEvent(element);
        }  
      };
    };

    // insert div to store data
    container.append(renderHandlebars(FRIENDS_TABS_TEMPLATE, 
      { course: courseCode, section: section, show_section: true }));
    var tooltipDiv = $("#" + courseCode + section);
    tooltipDiv.hide();
    tooltipDiv.tabs({ active: 0});

    // function to make calls for social information
    var calls = function() {
      getFriends(TERM, courseCode, section, 
        createCallback(courseCode, section, "1st Degree"));
      getFriendsOfFriends(TERM, courseCode, section, 
        createCallback(courseCode, section, "2nd Degree"));      
    };

    // wait for session to be created if necessary
    if (SESSION_CREATED) {
      calls();
    } else {
      $("#" + USER_INFO_DIV_ID).one("session", calls);
    }
  }
});
