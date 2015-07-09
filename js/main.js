var w3wPoint;

require(['esri/map', 'esri/symbols/PictureMarkerSymbol', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/SpatialReference', 'esri/graphic', 'dojo/domReady!'], function(Map,PictureMarkerSymbol,GraphicsLayer,Point,SpatialReference, Graphic) {
  var map = new Map('map', {
    center: [5.80749, 45.21433],
    zoom: 15,
    basemap: 'topo'
  });
  var w3wmarkerSymbol = new PictureMarkerSymbol('./img/w3wmarker.png', 32, 32);
  var markerLayer = new GraphicsLayer();
  map.addLayer(markerLayer);
  w3wPoint = new Point(5.80749, 45.21433, new SpatialReference({ wkid: 4326 }));
  markerLayer.add(new Graphic(w3wPoint, w3wmarkerSymbol));
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
      if( this.code === 'fr') {
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
                   'position:' + response.position[0] + ', ' + response.position[1] );
  });
}
