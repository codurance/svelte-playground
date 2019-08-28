$(document).ready(function () {
    $('.navbar-toggler').on('click', function () {
        $('.sidebar').toggleClass('active');
    });
});

$(function(){
    jQuery('img.svg').each(function(){
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
    
        $.get(imgURL, function(data) {
            var $svg = jQuery(data).find('svg');
    
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }

            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }
    
            $svg = $svg.removeAttr('xmlns:a');
            
            if(!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('width') + ' ' + $svg.attr('height'))
            }
    
            $img.replaceWith($svg);
    
        }, 'xml');
    
    });
});
