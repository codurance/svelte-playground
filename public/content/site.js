var IUTTU = IUTTU || {};
IUTTU.fn = (function($) {



    /** ALARMA: función recursiva **/
    function insert_children_here(_where) {
        if ($(_where).attr("data-id")) {
            if ($("#" + $(_where).attr("data-id"))) {
                $("#" + $(_where).attr("data-id") + " > ul").clone().appendTo($(_where).parent());
                $("#" + $(_where).attr("data-id") + " > div.formulari").clone().appendTo($(_where).parent());
                $("#" + $(_where).attr("data-id") + " > form").clone().appendTo($(_where).parent());

                // Buscamos en los hijos
                $(_where).parent().find("ul li a").each(function() {

                    insert_children_here(jQuery(this));

                });
            }
        }
    }


    function initialize_menu() {

        if ($("#current_page_menu").length > 0) {
            var main_id = $("#current_page_menu").attr("data-rel");
            $("#main > ul > li > a").each(function() {
                if ($(this).attr("data-id") == 'nav_' + main_id) $(this).parent().addClass("current");
            });
        }

        // make language strings shorters
        $("#cabecera_izquierda ul li a").each(function() {
            var text = $(this).text();
            text = text.substring(0, 3);
            $(this).text(text);
        });
        $("#cabecera_izquierda").css('visibility', 'visible');

        // copy some menus to mobile
        $("#lang_sel_list").clone().appendTo($("#main_mobile"));
        $("#cabecera_derecha ul.social_bar").clone().appendTo($("#menu_principal .inner_wrapper"));
        $("#menu_principal nav#main ul li a").each(function() {

            insert_children_here($(this));
        });

        $("a.lanzador_menu").click(function() {
            $("#menu_principal").addClass("mobile_menu");
            $("#menu_principal nav#main").slideToggle('fast');
            $("#menu_principal ul.social_bar").slideToggle('fast');
        });


        $("#menu_principal ul li a.link_children").bind('click', function() {

            var link_to = $(this).attr("data-id");

            // Estamos en modo movil
            if ($("#menu_principal").hasClass("mobile_menu")) {

                $(this).toggleClass("mobile_selected");
                $(this).next("div.formulari").first().slideToggle('fast');
                $(this).next("form").first().slideToggle('fast');
                $(this).parent().find("ul").first().slideToggle('fast');

                if ((link_to == 'nav_biblioteca') || (link_to == 'nav_tramits') ||  ($(this).hasClass("link_to_programas"))) {
                    $(this).parent().find("div.formulari").css('padding-bottom', 10).first().slideToggle('fast');
                }

                if (link_to == 'nav_cercar') {
                    setTimeout(function() { $("input#s").focus(); }, 500);
                }

            } else {

                // closing main menu?
                if ($(this).parent().hasClass("active")) {

                    if ($(this).parent().parent().parent().attr("id") == "main") {

                        $(this).parent().removeClass("active");
                        $("#menu_principal .current_menu").slideUp('fast');
                        $("#menu_principal .current_menu").removeClass("current_menu");
                    }


                } else {

                    $(this).parent().parent().find(".active").removeClass("active");
                    $(this).parent().addClass("active");

                    if ($("#menu_principal .current_menu").first().attr("id") != 'main') $("#menu_principal .current_menu").slideUp('fast');
                    $("#menu_principal .current_menu").removeClass("current_menu");

                    $("#" + link_to).slideDown('fast').addClass("current_menu");


                    if (link_to == 'nav_cercar') {

                        setTimeout(function() { $("input#s").focus(); }, 500);
                    }
                }
            }
        });

        $("#menu_principal nav a.tornar").bind('click', function() {
            if (($(this).parents('nav').attr("id") !== 'aridna')) {
                var link_to = $(this).parent().parent().attr("data-parent_id");
                $("#menu_principal .current_menu").slideUp('fast').removeClass("current_menu");
                ($("#" + link_to)).slideDown('fast').addClass("current_menu");

                $("#" + link_to).find("li.active").removeClass("active");
            }

        });

        // comportamiento tema > subtema
        $("#menu_principal select.tema").each(function() {

            // Ocultamos opciones por defecto (con CSS no se puede con IE11)
            $(this).parents('div.formulari').find('select.subtema option').attr('disabled', 'disabled').hide();
            $(this).parents('div.formulari').find('select.subtema option.all').attr('disabled', 'disabled').hide();

            // initalitzation
            var tema_id = $(this).val();
            $(this).parents('div.formulari').find("select.subtema option.tema_" + tema_id).removeAttr('disabled').show();
            $(this).parents('div.formulari').find("select.subtema option.all").removeAttr('disabled').show();

            // on change
            $(this).bind('change', function() 
            {
                $(this).parents('div.formulari').find("select.subtema option").attr('disabled', 'disabled').hide();
                var tema_id = $(this).val();
                $(this).parents('div.formulari').find("select.subtema").val("*");
                $(this).parents('div.formulari').find("select.subtema option.tema_" + tema_id).removeAttr('disabled').show();
                $(this).parents('div.formulari').find("select.subtema option.all").removeAttr('disabled').show();
            });
        });

    }

    function equalize_image_heights($list, $items, $inner, $position) {
        $items.css('height', 'auto');

        var itemsPerRow = Math.floor($list.width() / $items.width());

        // sólo tenemos un item por fila
        if (itemsPerRow == null || itemsPerRow < 2) {
            return true;
        }

        for (var i = 0, j = $items.length; i < j; i += itemsPerRow) {
            var maxHeight = 0,
                $row = $items.slice(i, i + itemsPerRow);
            $row.each(function() {
                var itemHeight = parseInt($(this).outerHeight());
                maxHeight = (itemHeight > maxHeight) ? itemHeight : maxHeight;
            });
            $row.css('height', maxHeight);
        }

        if ($position != undefined && $position != 'top') {
            $items.each(function() {
                var _inner = $(this).find($inner).first();
                var _diff = $(this).height() - _inner.height();
                switch ($position) {
                    case 'middle':
                        _inner.css('padding-top', _diff / 2);
                        break;
                    case 'bottom':
                        _inner.css('padding-top', _diff);
                        break;
                }
            });
        }


        $(".inner_tools a span").each(function() {
            jQuery(this).css('padding-top', 0);
            var span_height = jQuery(this).outerHeight();
            var parent_height = jQuery(this).parent().outerHeight();
            if (span_height < parent_height) {
                jQuery(this).css('padding-top', (parent_height - span_height) / 2);
            }

        });

    }

    function filter_biblioteca(_where) {

        var form = $(_where).parent();

        var tema = $(form).find("select.tema option:selected").attr("data-slug");
        var subtema = $(form).find("select.subtema").val();
        var tipus_document = $(form).find("select.tipus_document").val();
        var anyo = $(form).find("select.anyo").val();

        var _url = $("#nav_biblioteca").attr("data-archive_url") + tipus_document + '/*/' + tema + '/' + subtema + '/' + anyo;
        location.href = _url;
    }

    function filter_programa(_where) {

        var form = $(_where).parent();

        var tema = $(form).find("select.tema option:selected").attr("data-slug");
        var subtema = $(form).find("select.subtema").val();
        //var anyo = $(form).find("select.anyo").val();
        var anyo = '*';

        var _url = $("#nav_programes").attr("data-archive_url") + '/*/' + tema + '/' + subtema + '/' + anyo;
        location.href = _url;
    }


    function filter_tramits() {

        if ($("#menu_principal").hasClass("mobile_menu")) {
            var form = $("#menu_principal nav.current_menu ul li a[data-id=nav_tramits]").next("ul").find(".formulari");
        } else {
            var form = $("#menu_principal nav.current_menu");
        }

        var tema = $(form).find("select.tema option:selected").attr("data-slug");
        var subtema = $(form).find("select.subtema").val();

        var _url = $("#nav_tramits").attr("data-archive_url") + tema + '/' + subtema;
        location.href = _url;
    }

    function initalize_carrusel() {

        if ($("#carrusel_destacados").length > 0) {

            $("#carrusel_destacados").slick({
                infinite: true,
                slidesToShow: 1,
                autoplay: true,
                autoplaySpeed: 5000,
                arrows: true,
                dots: false
            });
        }
    }

    function init_share_buttons() {
        $(".share").each(function() {
            $(this).bind('click', function() {
                $(this).toggleClass("opened");
            });
        });
    }

    function show_from_ariadna(_to) {
        $("#menu_principal ul li a[data-id=nav_" + _to + "]").first().click();
    }

    return {
        equalize_image_heights: equalize_image_heights,
        initialize_menu: initialize_menu,
        filter_biblioteca: filter_biblioteca,
        filter_tramits: filter_tramits,
        filter_programa: filter_programa,
        initalize_carrusel: initalize_carrusel,
        init_share_buttons: init_share_buttons,
        show_from_ariadna: show_from_ariadna
    }
})(jQuery);


jQuery(window).scroll(function() {});

jQuery(window).on("orientationchange", function() {});

jQuery(window).load(function() {
    IUTTU.fn.equalize_image_heights(jQuery('#sidebar_pie'), jQuery('#sidebar_pie .side, #sidebar_pie .sidebar'), 'div', 'top');
});



var paginacion = 9;
function ver_mas_relacionados()
{
    var current_page = jQuery("#relacionadas").data('page');
    var num_elementos = jQuery("#relacionadas .item_listado").length;
    let element_index = 1;
    jQuery("#relacionadas .item_listado").each(function(i)
    {
        if ( i < ( (current_page + 1) * paginacion ) ) 
        {
            if ( jQuery(this).css('display') == 'none' )
            {
                element_index++;
                jQuery( this ).css({ 'display' : 'inline-block', 'opacity' : 0 });
                jQuery( this ).delay( 50 * element_index ).animate({'opacity' : 1 }, 300);
            }
            
        }
    });
    jQuery("#relacionadas").data( 'page', current_page + 1 );
    if ( num_elementos < ( ( current_page + 1) * paginacion ) ) jQuery("#relacionadas .ver_mas").hide();
}

jQuery(document).ready(function($) {

    if ( $('.moure_faqs_aqui').length > 0 )
    {
        var _faqs = $('.faqs');
        var _moure_a = $( '.moure_faqs_aqui' );

        jQuery( _faqs ).each(function( i ) 
        {
            $( this ).appendTo ( _moure_a[ i ] );
        });

        //$('.faqs').appendTo( '#moure_faqs_aqui' );
        $('.faqs').css( 'padding-bottom', 60 );
    }
    if ( $("#relacionadas .item_listado").length > 0 )
    {  
        $("#relacionadas").data('page', 1);
        $("#relacionadas .item_listado").each(function(i)
        {
            if ( i < paginacion ) jQuery( this ).css('display', 'inline-block');
        });
    }

    if ( $( '.faqs' ).length > 0 )
    {
        $( '.faqs .pregunta').each(function()
        {
            $( this ).click( function(ev) 
            {
                if ( $( this ).hasClass( 'activa') )
                {
                    $( this ).parent().find('.pregunta.activa').next().slideUp();
                    $( this ).parent().find('.activa').removeClass('activa');
                } 
                else 
                {
                    // Desactivamos anterior
                    //$( this ).parent().find('.pregunta.activa').next().slideUp();
                    //$( this ).parent().find('.activa').removeClass('activa');

                    // Activamos actual
                    $( this ).next().slideDown();
                    $( this ).addClass('activa').next().addClass('activa');
                }
                
            });
        });

        $( '.faqs' ).slideDown();
    }

    IUTTU.fn.initialize_menu();
    IUTTU.fn.initalize_carrusel();
    IUTTU.fn.init_share_buttons();

    if ($("#current_page_menu").attr("data-open_parent") == "true") {
        $("#current_page_menu").parent().find("a.titol").click();
    }

    $(window).bind("orientationchange resize pageshow", function() {

        if (IUTTU.fn.window_width != $(window).width()) {
            IUTTU.fn.window_width = $(window).width();

            IUTTU.fn.equalize_image_heights($('#sidebar_pie'), $('#sidebar_pie .side, #sidebar_pie .sidebar'), 'div', 'top');
            IUTTU.fn.equalize_image_heights($('.listado_de_items'), $('.listado_de_items .item_listado'), '', 'top');
            //IUTTU.fn.equalize_image_heights($('.listado_docs'), $('.listado_docs .item'), '', 'top');
            IUTTU.fn.equalize_image_heights($('.resultados_busqueda .item'), $('.resultados_busqueda .item .columna'), '.outer_text ', 'middle');
            IUTTU.fn.equalize_image_heights($('.resultados_busqueda .item'), $('.resultados_busqueda .item .columna'), '.inner_tools', 'middle');



            $(".listado_docs").each(function() {
                var _images = $(this).find("img");
                if (_images.length > 0) {
                    var _max_height = 0;
                    _images.each(function() { if ($(this).outerHeight() > _max_height) _max_height = $(this).outerHeight(); });
                    if (IUTTU.fn.window_width > 900) {
                        _images.each(function() {
                            if ($(this).outerHeight() < _max_height) $(this).css('margin-top', _max_height - $(this).outerHeight());
                        });
                    }
                }
                $(this).css({ 'opacity': 0, 'visibility': 'visible' }).animate({ 'opacity': 1 });
                var _titles = $(this).find("h4");
                if (_titles.length > 0) {
                    var _titles_max_height = 0;
                    _titles.each(function() { if ($(this).outerHeight() > _titles_max_height) _titles_max_height = $(this).outerHeight(); });
                    if (IUTTU.fn.window_width > 900) {
                        _titles.each(function() {
                            if ($(this).outerHeight() < _titles_max_height) $(this).css('margin-bottom', _titles_max_height - $(this).outerHeight());
                        });
                    }
                }
            });


            if (IUTTU.fn.window_width > 900) {
                $("#menu_principal").removeClass("mobile_menu");
                if ($('body').hasClass('menu_visible')) {
                    $("#menu_principal").removeClass("mobile_menu");

                    $("nav#main > ul > li > ul").hide();
                    $("#menu_principal ul.social_bar").hide();
                }
            } else {
                $("#menu_principal").addClass("mobile_menu");
                if (!$("#menu_principal nav#main").hasClass("current_menu")) {
                    $("#menu_principal .current_menu").slideUp(0).removeClass("current_menu");
                    $("#menu_principal nav#main").addClass("current_menu");
                }
            }
        }
    });

    $('.lanzador_menu').click(function(event) {
        event.stopPropagation();
        $('body').toggleClass('menu_visible');
        return false;
    });


}(jQuery));