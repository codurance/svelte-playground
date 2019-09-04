$(document).ready(function() {
  $('.navbar-toggler').on('click', function() {
    $('.sidebar').toggleClass('active');
  });

  $('.social-links a').each(function() {
    this.href += document.location.href;
  });

  $('#original').click(function() {
    $('#body').flip('toggle');
    $('.front').css('display', 'block');
  });

  $('#modified').click(function() {
    $('#body').flip('toggle');
    $('.front').css('display', 'none');
  });

  $('#body').flip({
    trigger: 'manual',
  });

  $('#bar-chart-bcn').css('display', 'none');
});
