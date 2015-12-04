jQuery(document).ready(function($) {
  var jsmode = Drupal.settings.splashify.js_mode;

  // Prevents a flicker before the splash page shows up.
  if (jsmode == 'redirect') {
    hidepage();
  }

  var now = new Date();
  var nowtimeSeconds = now.getTime() / 1000;
  var referrer = document.referrer + '';
  var hostname = window.location.hostname + '';
  var splash = $.jStorage.get("splash", 0);
  var splashalways = Drupal.settings.splashify.js_splash_always;
  var what_urls = Drupal.settings.splashify.js_mode_settings.urls;
  var referrer_check = Drupal.settings.splashify.js_disable_referrer_check;
  var js_mode_settings = Drupal.settings.splashify.js_mode_settings;

  // This updates the referer string by taking out the url parameter from the
  // url...which is included from google search results (as an example).
  if(referrer.indexOf('?') != -1) {
    referrer = referrer.substr(0,referrer.indexOf('?'));
  }

  // Stop the splash page from show up if on the splash page. Also prevent
  // the splash from showing up from internal links (dependent on the
  // referrer check settings).
  if ((referrer.search(hostname) != -1 && !referrer_check) || jQuery.inArray(window.location.pathname, what_urls) > -1) {
    showpage();
    return;
  }

  // Determine if we should display the splash page.
  var displaysplash = false;
  if (!splash || splash < nowtimeSeconds || splashalways=='1') {
    displaysplash = true;
  }

  // Display the splash page?
  if(displaysplash){
    var expireAfter = Drupal.settings.splashify.js_expire_after;
    var last_url = $.jStorage.get('splashlasturl', '');
    var url = '';

    // Set when the splash variable should expire next.
    $.jStorage.set("splash", nowtimeSeconds + expireAfter);

    // Determine the url we are working with, which is based on the mode.
    if(Drupal.settings.splashify.js_mode_settings.system_splash != ''){
      // Display the system splash page.
      url = Drupal.settings.splashify.js_mode_settings.system_splash;
    } else if(Drupal.settings.splashify.js_mode_settings.mode == 'sequence'){
      // Display the splash pages in sequence.
      var new_url_index = 0;
      var last_url_index = jQuery.inArray(last_url, what_urls);
      if(last_url_index > -1 && last_url_index+1 < Drupal.settings.splashify.js_mode_settings.total_urls){
        new_url_index = last_url_index + 1;
      }
      url = what_urls[new_url_index];
    } else if(Drupal.settings.splashify.js_mode_settings.mode == 'random'){
      // Display a random splash page.
      var new_url_index = Math.floor(Math.random() * Drupal.settings.splashify.js_mode_settings.total_urls);
      url = what_urls[new_url_index];
    }

    $.jStorage.set('splashlasturl', url);

    /**
     * This function displays the splash.
     */
    function open_splash() {
      // Display the splash page.
      if(jsmode == 'redirect') {
        // Redirect.
        window.location.replace(url);
      } else if(jsmode == 'colorbox') {
        // Open a ColorBox.
        var colorbox_options = {
          transition:'elastic',
          iframe:true,
          href:url,
          opacity:Drupal.settings.splashify.js_mode_settings.opacity,
          width:Drupal.settings.splashify.js_mode_settings.size_width,
          height:Drupal.settings.splashify.js_mode_settings.size_height
        };

        // Set colorbox to display inline content with page-selector contact on page from Drupal path
        if (Drupal.settings.splashify.js_mode_settings.page_section) {
          colorbox_options.href = (function() {
            return url + ' ' + Drupal.settings.splashify.js_mode_settings.page_section;
          })();

         //TODO: To make webform page-break works properly, turn on iframe in colorbox, but webform theme need be change
          colorbox_options.iframe = false;

        }

        if (url.substring(0, 16) == "_splashify_ajax/") {
          // Load the ajax node page via AJAX.
          colorbox_options.iframe = false;
        }

        $.colorbox(colorbox_options);
      } else if(jsmode == 'window') {
        // Open a popup window.
        window.open(url, 'splash', Drupal.settings.splashify.js_mode_settings.size);
      }
    }

    /**
     * This function closes the splash.
     */
    function close_splash() {
      $.colorbox.close();
    }

    if (js_mode_settings.how_delay_enable == 1) {
      setTimeout(open_splash, js_mode_settings.how_delay);
    } else {
      open_splash();
    }

    if (js_mode_settings.how_autoclose_enable == 1 && jsmode == 'colorbox') {
      setTimeout(close_splash, js_mode_settings.how_autoclose);
    }
  } else if(jsmode == 'redirect') {
      showpage();
  }
});

function showpage() {
  jQuery('html').show();
}

function hidepage() {
  jQuery('html').hide();
}
