var graphic;

require(['esri/map', 'esri/symbols/PictureMarkerSymbol', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/SpatialReference', 'esri/graphic', 'esri/geometry/webMercatorUtils', 'dojo/domReady!'], function(Map, PictureMarkerSymbol, GraphicsLayer, Point, SpatialReference, Graphic, webMercatorUtils) {


  var map = new Map('map', {
    center: [5.80749, 45.21433],
    zoom: 15,
    basemap: 'topo'
  });
  var w3wmarkerSymbol = new PictureMarkerSymbol('./img/w3wmarker.png', 32, 32);
  var markerLayer = new GraphicsLayer();
  map.addLayer(markerLayer);

  graphic = new Graphic(new Point(5.80749, 45.21433, new SpatialReference({
    wkid: 4326
  })), w3wmarkerSymbol);
  markerLayer.add(graphic);

  map.on('click', handleMapClick);

  //$(document).ready(jQueryReady);

  function handleMapClick(event) {
    // alert("User clicked at " +
    //   event.screenPoint.x + ", " + event.screenPoint.y +
    //   " on the screen. The map coordinate at this point is " +
    //   event.mapPoint.x + ", " + event.mapPoint.y
    // );
    //markerLayer.clear();
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
});




var lang = 'fr';
var key = 'Q4M51WJZ';
var w3wmarker = {
  lat: 45.21433,
  lng: 5.80749
};
getLangs();

updateW3w();

$('#lang').on('change', function() {
  lang = $('#lang').val();
  updateW3w();
});

function getLangs() {
  data = {
    'key': key
  };
  var langs = $('#lang');
  $.post('https://api.what3words.com/get-languages', data, function(response) {
    console.log(response);
    $.each(response.languages, function() {
      if (this.code === 'fr') {
        langs.append($('<option />').val(this.code).text(this.name_display).prop('selected', true));
      } else {
        langs.append($('<option />').val(this.code).text(this.name_display));
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
    $('#w3w').text('W3W\n' +
      'words: ' + response.words[0] + ', ' + response.words[1] + ', ' + response.words[2] + '\n' +
      'position:' + response.position[0] + ', ' + response.position[1]);
  });
}
