//'use strict';

/**
 *  API url
 */

var AVISOS_API = 'https://ajuntament.barcelona.cat/mestre/avisos/estatics/';

var AVISOS_LANG = 'ca';

//var AVISOS_GA_ACTION = 'contaminacio';

var AVISOS_GA_CATEGORY = 'plugin-avisos';

/**
  * Avisos class.
  *
  * @constructor
  * @param {Object} settings - The settings.
***/
function Avisos(conf) {

    if (!conf.hasOwnProperty('id')) {
        console.error('id is not defined');
        return;
        //throw new Error('id is not defined');
    }

    if (!conf.id.length || typeof conf.id === 'undefined') {
        console.error('id empty or undefined');
        return;
        //throw new Error('id empty or undefined');
    }

    if (!typeof conf.id === 'string') {
        console.error('id must be a string');
        return;
        //throw new Error('id must be a String');
    }

    if (!document.querySelector('#' + conf.id)) {
        console.error('no element with this id: ' + conf.id);
        return;
        //throw new Error('no element with this id: ' + conf.id);
    }

    this._id = conf.id;

    if (!conf.hasOwnProperty('token')) {
        console.error('token is not defined');
        return;
        //throw new Error('token is not defined');
    }

    if (!conf.token.length || typeof conf.id === 'undefined') {
        console.error('token empty or undefined');
        return;
        //throw new Error('token empty or undefined');
    }

    if (!typeof conf.token  === 'string') {
        console.error('token must be a string');
        return;
        //throw new Error('token must be a String');
    }

    this._token = conf.token;

    if (!conf.hasOwnProperty('bootstrap')) {
        //throw new Error('bootstrap');
        console.error('bootstrap is not defined');
        return;
    }

    if (!typeof conf.bootstrap === 'boolean') {
        //throw new Error('bootstrap must be boolean');
        console.error('bootstrap must be boolean');
        return;
    }

    this._bootstrap = conf.bootstrap;

    //TODO: Think a better solution
    this._lang = this.normalizelang(conf.lang);

    this._extension = 'json';

    /*console.log(this._id);
    console.log(this._token);
    console.log(this._bootstrap)
    console.log(this._lang);
    console.log(this._extension);*/

    this.fetch();
}

/**
 * Get API Data.
 *
 * @return {Object}
 */
Avisos.prototype.fetch = function() {
    var request = new XMLHttpRequest();
    request.open('GET', AVISOS_API + this._extension + '/' + this._token + '.' + this._extension + '?' + new Date().getTime());
    request.onreadystatechange = function (e) {
        if(request.readyState == XMLHttpRequest.DONE) {
            if(request.status == 200) {
                var response = JSON.parse(request.responseText);
                if(Object.keys(response).length === 0) {
                    //throw new Error('no display for token: ' + this._token);
                    //console.error('no display for token: ' + this._token);
                    console.warn('No s\'ha trobat configuració per aquest web al servidor mestre');
                    return;
                }
                if(!response.actiu) return  console.warn('L\'avís no esta actiu per aquest web en aquest moment');
                this.markup(response);
            } else {
                console.error('couldn\'t fetch data');
                return;
            }
        }

    }.bind(this);
    request.send(null);
}

Avisos.prototype.markup = function(data) {

    //console.log(data);

    var icona = document.createElement('img');
    icona.src = data.icona.path + data.icona.ico/* + (data.negatiu ? '-negatiu.png' : '.png')*/;

    var titol = document.createElement('p');
    titol.innerText = data.avisos[this._lang].titol;

    var left = document.createElement('div');
    left.className += ' bcn-avisos-titol';
    left.appendChild(icona);
    left.appendChild(titol);

    var text = document.createElement('p');
    text.innerHTML = data.avisos[this._lang].missatge;

    var right = document.createElement('div');
    right.className += 'bcn-avisos-text';
    right.appendChild(text);

    var arrowright = document.createElement('i');
    arrowright.className += 'bcn-icon-dreta-bold';

    var arrowbottom = document.createElement('i');
    arrowbottom.className += 'bcn-icon-baix-light';

    var avis = document.createElement('div');
    avis.className += ' bcn-avis';
    avis.appendChild(left);
    avis.appendChild(right);
    avis.appendChild(arrowright);
    avis.appendChild(arrowbottom);

    var col = document.createElement('div');
    col.className += ' col-12 col-xs-12';
    col.appendChild(avis);

    var row = document.createElement('div');
    row.className += ' row';
    row.appendChild(col);

    var container = document.createElement('div');
    container.className += (this._bootstrap) ? ' container' : ' bcn-avisos-grid' ;
    container.appendChild(row);

    var avisos;
    if(data.avisos[this._lang].enllac) {
        avisos = document.createElement('a');
        avisos.href = data.avisos[this._lang].enllac;
        avisos.target = '_blank';
        var analitycs = function(e) {
            e.preventDefault();
            if(window.bcn) {
                bcn.statistics({
                    keys: ['UA-36589170-45'],
                    tgm: true,
                    track: [
                        data.categoria, // ACTION
                        AVISOS_GA_CATEGORY, // CATEGORY
                        encodeURI(this.href) // LABEL
                    ]
                });
            }
            this.removeEventListener('click', analitycs);
            this.click();
            this.addEventListener('click', analitycs);
        };

        avisos.addEventListener('click', analitycs);

    } else {
        avisos = document.createElement('div');
        avis.removeChild(arrowright);
    }
    avisos.id = 'avisos';
    avisos.className += ' bcn-avisos'
    if(data.negatiu) {
        avisos.className += ' negatiu';
    }
    avisos.appendChild(container);
    document.querySelector('#' + this._id).innerHTML = '';
    document.querySelector('#' + this._id).appendChild(avisos);
    var event = document.createEvent('Event');
    event.initEvent('avisos-ready', true, true);
    avisos.dispatchEvent(event);
    if(document.documentMode <= 9) {
        avisos.className += ' bcn-ie9';
        return;
    }
    this.render(data.avisos[this._lang].missatge, right);
}

Avisos.prototype.render = function(message, container) {
    //console.log(window.innerWidth);
    //console.log(document.documentElement.clientWidth);
    return (document.documentElement.clientWidth > 767) ? this.desktop(message, container) : this.mobile(container);
}

/*Avisos.prototype.resize = function() {
    console.log('resize');
}*/

Avisos.prototype.desktop = function(message, container) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = '18px Source Sans Pro,Helvetica Neue,Helvetica,Arial,sans-serif';
    var messageWidth = context.measureText(message).width;
    if(messageWidth > container.clientWidth) {
        this.animate(container);
    }
}

Avisos.prototype.mobile = function(container) {
    //console.log(container.clientHeight);
    if(container.clientHeight > 36) {
        container.style.height = container.clientHeight + 'px';
        container.className += ' bcn-clamp';
        document.querySelector('.bcn-avisos .bcn-icon-baix-light')
        .addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (container.classList) {
                container.classList.toggle('bcn-clamp');
            } else {
                //ie9
                var classes = container.className.split(" ");
                var i = container.indexOf('bcn-clamp');

                if (i >= 0) {
                    classes.splice(i, 1);
                }
                else {
                    classes.push('bcn-clamp');
                    container.className = classes.join(" ");
                }
            }
            if (this.classList) {
                this.classList.toggle('bcn-rotate');
            } else {
                //ie9
                var classes = this.className.split(" ");
                var i = container.indexOf('bcn-rotate');

                if (i >= 0) {
                    classes.splice(i, 1);
                }
                else {
                    classes.push('bcn-rotate');
                    this.className = classes.join(" ");
                }
            }
        });
    } else {
        document.querySelector('.bcn-avisos .bcn-icon-baix-light').style.display = 'none';
    }
}

Avisos.prototype.animate = function(container) {
    var textNode = container.firstElementChild;
    textNode.className += ' bcn-fixed';
    var clon1 = textNode.cloneNode(true);
    var clon2 = textNode.cloneNode(true);
    textNode.className += ' bcn-partial';
    textNode.addEventListener('animationstart', function() {
        window.setTimeout(function() {
            container.appendChild(clon1);
        }, 11000);
    });
    textNode.addEventListener('animationend', function() {
        if('remove' in Element.prototype) {
            this.remove();
        } else {
            if(this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }
    });
    clon1.className += ' clon clon-u bcn-slide';
    clon1.addEventListener('animationstart', function() {
        window.setTimeout(function() {
            container.appendChild(clon2);
        }, 26000);
    });
    clon1.addEventListener('animationend', function() {
        if('remove' in Element.prototype) {
            this.remove();
        } else {
            if(this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }
    });
    clon2.className += ' clon clon-dos bcn-slide';
    clon2.addEventListener('animationstart', function() {
        window.setTimeout(function() {
            container.appendChild(clon1);
        }, 26000);
    });
    clon2.addEventListener('animationend', function() {
        if('remove' in Element.prototype) {
            this.remove();
        } else {
            if(this.parentNode) {
                this.parentNode.removeChild(this);
            }
        }
    });


    //Visibility API
   /* var hidden, visibilityChange;

    if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibiltychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }

    if (typeof document.addEventListener === 'undefined' || typeof document.hidden === 'hidden') {
        console.log('AddEventListener or Visibility API not supported');
    } else {
        document.addEventListener(visibilityChange, function() {
            if (document.hidden) {
                //Maybe we should clear intervals too to make it work
                console.log('Hidden');
                //RESET all classes and remove clons
                if(textNode.parentNode == container) {
                    container.removeChild(textNode);
                }
                if(clon1.parentNode == container) {
                    container.removeChild(clon1);
                }
                if(clon2.parentNode == container) {
                    container.removeChild(clon2);
                }
            } else {
                console.log(this);
                console.log('Visible');
            }
        }.bind(this), false);
    }*/







}

//REPENSAR LANG
Avisos.prototype.normalizelang = function(lang) {
    if(!lang.length || typeof lang === 'undefined') {
        return AVISOS_LANG;
    }
    return lang.split('-')[0];
}

window.avisos = Avisos;

