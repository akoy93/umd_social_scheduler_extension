var SEASON_TO_TERM = { winter: "12", spring: "01", summer: "05", fall: "08" };
var TERM_REGEX = /term\:.*?(winter|spring|summer|fall).*?(\d{4})/i;
var CLASS_REGEX = /(\w{7,8})\s?\<br\>\s*(\w{4})/;
var TERM_CSS_PATH = 'html body table tbody tr td table tbody tr td font center font b';
var COURSES_CSS_PATH = 'html body table tbody tr td table tbody tr td font center center table tbody tr td font';
var SCHEDULE_PATH = 'html body table tbody tr td table tbody tr td font center';

$(document).ready(function() {
  // render the user's schedule on the server
  (function() {
    var scheduleHTML = $(SCHEDULE_PATH).html();
    console.log(scheduleHTML);
    $("#" + USER_INFO_DIV_ID).on("session", function() {
      $.post(API_URL + "render_schedule", { term: term, html: scheduleHTML }, function(response) {
        if (!response.success) {
          alert("An error occurred while rendering schedule HTML.");
        }
      }, "json");
    });
  })();

  renderLoginTemplate(SCHEDULE_PATH);
  handleLoginLogoutEvents();

  var classCodes = [];
  var sectionNumbers = [];
  var term = null;

  // parses season and year from the schedule page and generates a term code
  (function() {
    var rawTerm = $(TERM_CSS_PATH).first().text();
    var result = TERM_REGEX.exec(rawTerm);
    if (result != null) {
      var season = result[1];
      var year = result[2];
      term = year + SEASON_TO_TERM[season.toLowerCase()];
    }
  })();

  // parses class codes and section numbers from the schedule page
  $(COURSES_CSS_PATH).each(function() {
    var result = CLASS_REGEX.exec($(this).html());
    // enforce uniqueness
    if (result != null && !(classCodes.indexOf(result[1]) > -1)) {
      classCodes.push(result[1]);
      sectionNumbers.push(result[2]);
    }
  });

  // construct a schedule string and post it to the server
  (function() {
    var schedule = "";
    for (var i = 0; i < classCodes.length; i++) {
      schedule += classCodes[i].toUpperCase() + "," + sectionNumbers[i].toUpperCase() + "|";
    }
    schedule = schedule.slice(0, -1);

    $("#" + USER_INFO_DIV_ID).on("session", function() {
      $.post(API_URL + "add_schedule", { term: term, schedule: schedule }, function(response) {
        if (!response.success) {
          alert("An error occurred while sending schedule data.");
        }
      }, "json");
    });
  })();
});