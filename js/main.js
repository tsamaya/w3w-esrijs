require(['esri/map', 'esri/symbols/PictureMarkerSymbol', 'esri/layers/GraphicsLayer',
  'esri/geometry/Point', 'esri/SpatialReference', 'esri/graphic', 'esri/geometry/webMercatorUtils',
  'app/bootstrapmap',
  'dojo/domReady!'
], function(Map, PictureMarkerSymbol, GraphicsLayer, Point, SpatialReference,
  Graphic, webMercatorUtils, BootstrapMap) {

  var lang = 'fr'; // default language
  var key = 'Q4M51WJZ'; // this is my key
  // default position
  var w3wmarker = {
    lat: 45.21433,
    lng: 5.80749
  };
  var graphic, selectedLng, selectedBasemap;
  var map = BootstrapMap.create('mapDiv', {
    center: [5.80749, 45.21433],
    zoom: 15,
    basemap: 'topo'
  });
  var w3wmarkerSymbol = new PictureMarkerSymbol('./img/w3wmarker.png', 35, 35);
  var markerLayer = new GraphicsLayer();
  map.addLayer(markerLayer);

  graphic = new Graphic(new Point(5.80749, 45.21433, new SpatialReference({
    wkid: 4326
  })), w3wmarkerSymbol);
  markerLayer.add(graphic);

  map.on('click', handleMapClick);

  $(document).ready(jQueryReady);

  function handleMapClick(event) {
    if (graphic) {
      graphic.setGeometry(event.mapPoint);
    } else {
      graphic = new Graphic(event.mapPoint, markerSymbol);
      map.graphics.add(graphic);
    }
    var p = webMercatorUtils.webMercatorToGeographic(event.mapPoint);
    w3wmarker.lat = p.y;
    w3wmarker.lng = p.x;
    updateW3w(event);
  }

  function jQueryReady() {
    getLangs();
    updateW3w();

    $('#lang').on('change', function() {
      lang = $('#lang').val();
      updateW3w();
    });

    // $('#w3wul').on('clcik', function() {
    //   alert('ici');
    // });

    $("#w3wul li").click(function(e) {
      e.target.prop('class', 'active');
      switch (e.target.text) {
        case "English":
          lang = 'en';
          break;
        case "Français":
          lang = 'fr';
          break;
      }
      if ($(".navbar-collapse.in").length > 0) {
        $(".navbar-toggle").click();
      }
    });

    $("#basemapList li").click(function(e) {
      switch (e.target.text) {
        case "Imagery":
          map.setBasemap("hybrid");
          break;
        case "National Geographic":
          map.setBasemap("national-geographic");
          break;
        case "Topographic":
          map.setBasemap("topo");
          break;
        case "Gray":
          map.setBasemap("gray");
          break;
        case "DarkGray":
          map.setBasemap("dark-gray");
          break;
        case "Open Street Map":
          map.setBasemap("osm");
          break;
      }
      e.target.parentNode.className = 'active';
      if (selectedBasemap) {
        selectedBasemap.className = '';
      }
      selectedBasemap = e.target.parentNode;
      if ($(".navbar-collapse.in").length > 0) {
        $(".navbar-toggle").click();
      }
    });

  }

  function getLangs() {
    data = {
      'key': key
    };
    var langs = $('#lang');
    var w3wul = $('#w3wul');
    $.post('https://api.what3words.com/get-languages', data, function(response) {
      //console.log(response);
      $.each(response.languages, function() {
        if (this.code === 'fr') {
          langs.append($('<option />').val(this.code).text(this.name_display).prop('selected', true));
          w3wul.append($('<li />').prop('class', 'active').append($('<a />').text(this.name_display)));
          $('#languagesHref').text('languages [fr] ');
        } else {
          langs.append($('<option />').val(this.code).text(this.name_display));
          w3wul.append($('<li />').append($('<a />').text(this.name_display)));
        }
      });
    });
  }

  function updateW3w(e) {
    data = {
      'key': key,
      'lang': lang,
      'position': '\'' + w3wmarker.lat + ',' + w3wmarker.lng + '\''
    };

    $.post('http://api.what3words.com/position', data, function(response) {
      console.log(response);
      $('#w3Words').text(response.words[0] + ', ' + response.words[1] + ', ' + response.words[2]);
      $('#w3wlink').attr('href', 'http://w3w.co/' + response.words[0] + ',' + response.words[1] + ',' + response.words[2]);
      $('#w3wPosition').text(response.position[0] + ', ' + response.position[1]);
    });
  }
});
