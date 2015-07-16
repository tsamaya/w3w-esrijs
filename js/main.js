require(['esri/map', 'esri/symbols/PictureMarkerSymbol', 'esri/layers/GraphicsLayer',
  'esri/geometry/Point', 'esri/SpatialReference', 'esri/graphic', 'esri/geometry/webMercatorUtils',
  'app/bootstrapmap', 'esri/dijit/Search', 'esri/dijit/LocateButton',
  'dojo/domReady!'
], function(Map, PictureMarkerSymbol, GraphicsLayer, Point, SpatialReference,
  Graphic, webMercatorUtils, BootstrapMap, Search, LocateButton) {
  var lang = 'fr'; // default language
  var key = 'Q4M51WJZ'; // this is my key
  // default position is downtown Grenoble, France
  var w3wmarker = {
    lat: 45.188996,
    lng: 5.724614
  };
  var initialWords = null;
  if (window.location.search) {
    initialWords = getInitalWords(window.location.search);
    if (initialWords) {
      initPosition(initialWords, function() {
        updateW3w();
        updateMarkerWithLatLng();
      });
    }
  }
  function getInitalWords(str) {
    return str.substr(1);
  }
  var graphic, selectedLng, selectedBasemap;
  var map = BootstrapMap.create('mapDiv', {
    center: [w3wmarker.lng, w3wmarker.lat],
    zoom: 15,
    scrollWheelZoom: true,
    basemap: 'satellite'
  });
  // handle map click to update w3w marker and words
  map.on('click', handleMapClick);
  // picture symbol
  var w3wmarkerSymbol = new PictureMarkerSymbol('./img/w3wmarker.png', 35, 35);
  var markerLayer = new GraphicsLayer();
  map.addLayer(markerLayer);
  // w3w graphic marker
  graphic = new Graphic(new Point(w3wmarker.lng, w3wmarker.lat, new SpatialReference({
    wkid: 4326
  })), w3wmarkerSymbol);
  markerLayer.add(graphic);
  // search Widget (geocoder)
  var s = new Search({
    map: map,
    enableHighlight: false,
    enableInfoWindow: false
  }, 'search');
  s.startup();
  // handle search result to update w3w marker and words
  s.on('select-result', function(e) {
    updateMarker(e.result.feature.geometry);
  });
  // geolocate widget
  var geoLocate = new LocateButton({
    map: map,
    highlightLocation: false,
    useTracking: false
  }, 'LocateButton');
  geoLocate.startup();
  // handle search result to update w3w marker and words
  geoLocate.on('locate', function(e) {
    console.log(e);
    updateMarker(e.graphic.geometry);
  });

  $(document).ready(jQueryReady);

  function handleMapClick(event) {
    updateMarker(event.mapPoint);
  }

  function updateMarkerWithLatLng() {
    var p = new Point(w3wmarker.lng, w3wmarker.lat, new SpatialReference({ wkid: 4326 }));
    if (graphic) {
      graphic.setGeometry(p);
    } else {
      graphic = new Graphic(p, markerSymbol);
      map.graphics.add(graphic);
    }
    map.centerAt(p);
  }
  function updateMarker(mapPoint) {
    if (!mapPoint) {
      return;
    }
    if (graphic) {
      graphic.setGeometry(mapPoint);
    } else {
      graphic = new Graphic(mapPoint, markerSymbol);
      map.graphics.add(graphic);
    }
    var p = webMercatorUtils.webMercatorToGeographic(mapPoint);
    w3wmarker.lat = p.y;
    w3wmarker.lng = p.x;
    updateW3w();
  }

  function jQueryReady() {
    getLangs();
    updateW3w();

    $('#basemapList li').click(function(e) {
      switch (e.target.text) {
        case 'Imagery':
          map.setBasemap('hybrid');
          break;
        case 'National Geographic':
          map.setBasemap('national-geographic');
          break;
        case 'Topographic':
          map.setBasemap('topo');
          break;
        case 'Gray':
          map.setBasemap('gray');
          break;
        case 'DarkGray':
          map.setBasemap('dark-gray');
          break;
        case 'Open Street Map':
          map.setBasemap('osm');
          break;
      }
      e.target.parentNode.className = 'active';
      if (selectedBasemap) {
        selectedBasemap.className = '';
      }
      selectedBasemap = e.target.parentNode;
      if ($('.navbar-collapse.in').length > 0) {
        $('.navbar-toggle').click();
      }
    });

  }

  function getLangs() {
    data = {
      'key': key
    };
    //var langs = $('#lang'); // tant que cela fonctionne pas avec la navbar !
    var w3wul = $('#languagesList ul');
    $.post('https://api.what3words.com/get-languages', data, function(response) {
      //console.log(response);
      $.each(response.languages, function() {
        // if (this.code === 'fr') {
        //   langs.append($('<option />').val(this.code).text(this.name_display).prop('selected', true));
        //   w3wul.append($('<li />').prop('class', 'active').append($('<a />').attr('href', '#'+this.code).text(this.name_display)));
        //   $('#languagesHref').text('[fr]');
        //} else {
        //langs.append($('<option />').val(this.code).text(this.name_display));
        w3wul.append($('<li />').append($('<a />').attr('href', '#' + this.code).text(this.name_display)));
        //}
      });
      $('#languagesList li').click(function(e) {
        lang = e.target.hash.substr(1);
        $('#languagesHref').text('[' + lang + ']');
        e.target.parentNode.className = 'active';
        if (selectedLng) {
          selectedLng.className = '';
        }
        selectedLng = e.target.parentNode;
        updateW3w();
        if ($('.navbar-collapse.in').length > 0) {
          $('.navbar-toggle').click();
        }

      });

    });
  }

  function updateW3w() {
    data = {
      'key': key,
      'lang': lang,
      'position': '\'' + w3wmarker.lat + ',' + w3wmarker.lng + '\''
    };

    $.post('http://api.what3words.com/position', data, function(response) {
      //console.log(response);
      $('#w3Words').text(response.words[0] + ', ' + response.words[1] + ', ' + response.words[2]);
      $('#w3wlink').attr('href', 'http://w3w.co/' + response.words[0] + '.' + response.words[1] + '.' + response.words[2]);
      $('#w3wPosition').text(response.position[0] + ', ' + response.position[1]);
    });
  }

  function initPosition(words, callback) {
    data = {
      'key': key,
      'string': decodeURIComponent(words)
    };

    $.post('http://api.what3words.com/w3w', data, function(response) {
      console.log(response);
      if (!response.error) {
        w3wmarker.lat = response.position[0];
        w3wmarker.lng = response.position[1];
        callback('ok');
      }
    });
  }

});
