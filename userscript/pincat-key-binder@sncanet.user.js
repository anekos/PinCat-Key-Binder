// ==UserScript==
// @id             pincat-key-binder@snca.net
// @name           Pincat Key Binder
// @version        1.0
// @namespace      pincat-key-binder@snca.net
// @author
// @description    Add some key bindings for PinCat
// @include        http://pincat.kazlab.org/*
// @match          http://pincat.kazlab.org/*
// @run-at         document-end
// ==/UserScript==

function forEach (xs, fuck) {
  for (var i = 0; i < xs.length; i++) {
    fuck(xs[i], i);
  }
}

function click (elem) {
  var ev = document.createEvent('MouseEvents');
  ev.initMouseEvent('click', true, true, ev.view || window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  elem.dispatchEvent(ev);
}

var Control = {
  __currentCatElement: null,
  __currentCatIndex: null,

  getNextCat: function () {
    if (!this.__currentCatElement)
      return [0, document.querySelector('.thumbnail')];

    var es = document.querySelectorAll('.thumbnail');
    var ni = this.__currentCatIndex + 1;
    if (ni < es.length)
      return [ni, es[ni]];

    return [0, es[0]];
  },

  getPreviousCat: function () {
    var es = document.querySelectorAll('.thumbnail');
    var li = es.length - 1;

    if (!this.__currentCatElement)
      return [li, es[li]];

    var pi = this.__currentCatIndex - 1;
    if (pi >= 0)
      return [pi, es[pi]];

    return [li, es[li]];
  },

  getAboveCat: function () {
    var es = document.querySelectorAll('.thumbnail');
    var li = es.length - 1;

    if (!this.__currentCatElement)
      return [li, es[li]];

    var pi = this.__currentCatIndex - 4;
    if (pi >= 0)
      return [pi, es[pi]];

    return [li, es[li]];
  },

  getBelowCat: function () {
    if (!this.__currentCatElement)
      return [0, document.querySelector('.thumbnail')];

    var es = document.querySelectorAll('.thumbnail');
    var ni = this.__currentCatIndex + 4;
    if (ni < es.length)
      return [ni, es[ni]];

    var li = es.length - 1;;
    return (es.length % 4 == 0) ? [0, es[0]] : [li, es[li]];
  },

  __focusTo: function (index, elem) {
    if (this.__currentCatElement)
      this.__currentCatElement.removeAttribute('anekos-current-cat');

    if (typeof index === 'undefined') {
      forEach(
        document.querySelectorAll('.thumbnail'),
        function (it, i) {
          if (it == elem)
            index = i;
        }
      );
    }

    elem.setAttribute('anekos-current-cat', 1);
    this.__currentCatIndex = index;
    this.__currentCatElement = elem;

    elem.querySelector('a').focus();

    if (index < 4) {
      window.scrollTo(0, 0);
      return;
    }

    var navbar = document.querySelector('.navbar-fixed-top');
    var nh = navbar ? navbar.offsetHeight : 0;
    window.scrollTo(
      0,
      elem.offsetTop - (window.innerHeight - nh - elem.offsetHeight) / 2 - nh
    );
  },

  focusCatElement: function (elem) {
    return this.__focusTo(void 0, elem);
  },

  expandCurrentCat: function () {
    if (!this.__currentCatElement)
      this.focusNextCat();

    var e = this.__currentCatElement.querySelector('a.cbox > img');
    click(e);
  },

  expanded: function () {
    return !/none/i.test(document.querySelector('#cboxOverlay').style.display);
  },

  expandNextCat: function () {
    this.focusNextCat();
    click(document.querySelector('#cboxNext'));
  },

  expandPreviousCat: function () {
    this.focusPreviousCat();
    click(document.querySelector('#cboxPrevious'));
  },

  shrink: function () {
    click(document.querySelector('#cboxClose'));
  },

  pinItCurrent: function () {
    if (Control.expanded()) {
      click(document.querySelector('.pinterest_cbox > iframe').contentDocument.querySelector('#PinItButton'));
    } else {
      click(this.__currentCatElement.querySelector('iframe').contentDocument.querySelector('#PinItButton'));
    }
  },

  instagramCurrent: function () {
    if (Control.expanded()) {
      click(document.querySelector('#cboxWrapper').querySelector('.instagram_cbox > a'));
    } else {
      click(this.__currentCatElement.querySelector('.instagram').parentNode);
    }
  },

  twitterCurrent: function () {
    if (Control.expanded()) {
      click(document.querySelector('#cboxWrapper').querySelector('.twitter_cbox > a'));
    } else {
      click(this.__currentCatElement.querySelector('.twitter').parentNode);
    }
  },
};

forEach(
  'Next Previous Above Below'.split(' '),
  function (name) {
    Control['focus' + name + 'Cat'] = function () {
      var nine = this['get' + name + 'Cat']();
      if (nine)
        this.__focusTo(nine[0], nine[1])
      else
        window.alert('Not Found Element: ' + name);
    }
  }
);


var KeyBinds = {
  h: function () {
    if (Control.expanded()) {
      Control.expandPreviousCat();
    } else {
      Control.focusPreviousCat();
    }
  },
  j: function () {
    if (Control.expanded()) {
      Control.expandNextCat();
    } else {
      Control.focusBelowCat();
    }
  },
  k: function () {
    if (Control.expanded()) {
      Control.expandPreviousCat();
    } else {
      Control.focusAboveCat();
    }
  },
  l: function () {
    if (Control.expanded()) {
      Control.expandNextCat();
    } else {
      Control.focusNextCat();
    }
  },
  p: function () { Control.pinItCurrent(); },
  i: function () { Control.instagramCurrent(); },
  t: function () { Control.twitterCurrent(); },
  13:  function () {
    if (Control.expanded()) {
      Control.shrink();
    } else {
      Control.expandCurrentCat();
    }
  },
  27:  function () { Control.expanded() && Control.shrink(); }
};

document.addEventListener(
  'keypress',
  function (e) {
    var key = String.fromCharCode(e.charCode);
    var b = KeyBinds[key] || KeyBinds[e.keyCode];
    if (b) {
      b();
      e.preventDefault();
    }
  },
  true
);

document.addEventListener(
  'click',
  function (e) {
    function track (e) {
      if (!e)
        return;
      if (!e.getAttribute)
        return;
      if (/\bthumbnail\b/.test(e.getAttribute('class', '')))
        return e;
      return track(e.parentNode);
    }

    var thumbnail = track(e.target);
    if (thumbnail)
      Control.focusCatElement(thumbnail);
  },
  false
);


GM_addStyle("[anekos-current-cat] { background-color: black; }");


