$(document).ready(function() {
  $(".navbar-toggler").on("click", function() {
    $(".sidebar").toggleClass("active");
  });

  $(".social-links a").each(function() {
    this.href += document.location.href;
  });

  $("#original").click(function() {
    $("#body").flip('toggle');
  });

  $("#modificado").click(function() {
    $("#body").flip('toggle');
  });

  $("#body").flip({
    trigger: 'manual'
  });
});