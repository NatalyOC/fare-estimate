let map;
let inputStart;
let latitudOrigin, longitudOrigin, latitudDestination, longitudDestination;
/* keys API uber */
let uberClient = 'v31GzahiOJ32g-Tdbv_Ggyf8Tz5imdZi';
let uberToken = '0W0vDyg78RY_khafW0D7YaSsR2xWdm_TKcw-i4sx';
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -12.0626954,
      lng: -77.1512452},
    zoom: 15
    
  });   
  
  /* funcionalidad de autocompletado */
  inputStart = document.getElementById('input-entry');
  let inputEnd = document.getElementById('input-destination');
  const autocompleteStart = new google.maps.places.Autocomplete(inputStart);
  autocompleteStart.bindTo('bounds', map);
  const autocompleteEnd = new google.maps.places.Autocomplete(inputEnd);
  autocompleteEnd.bindTo('bounds', map);

  let infowindow = new google.maps.InfoWindow();
  let marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  function autocompletePlace() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocompleteStart.getPlace();
    if (!place.geometry) {
      // El usuario ingresó el nombre de un Lugar que no fue sugerido y
      //  presioné la tecla Enter, o la solicitud de Detalles de lugar falló.
      window.alert('No details available for input: \'' + place.name + '\'');
      return;
    }
    // Si el lugar tiene una geometría, entonces preséntala en un mapa.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17); 
    }
    marker.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
  }
  autocompleteStart.addListener('place_changed', function() {
    autocompletePlace();
  });
  /* Trazar ruta */
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
 
  directionsDisplay.setMap(map);

  document.getElementById('submit').addEventListener('click', function() {
    calculateAndDisplayRoute(directionsService, directionsDisplay); 
    document.getElementById('subinfo').classList.toggle('hide');

  });
} 

/* funcionalidad de localizacion actual*/

document.getElementById('btn-locate').addEventListener('click', function() {
  var geocoder, pos ;
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) { 
      geocoder = new google.maps.Geocoder;
      infoWindow = new google.maps.InfoWindow({map: map});
      pos = {lat: position.coords.latitude,
        lng: position.coords.longitude};
      infoWindow.setPosition(pos);
      infoWindow.setContent('Estoy aqui <br />Lat : ' + position.coords.latitude + ' </br>Lang :' + position.coords.longitude);
      map.panTo(pos);         
    });
  } else {
    console.log('Browser doesn\'t support geolocation!');
  }
 
});
/* */
function geocodeLatLng(geocoder, map, infowindow) {  
  geocoder.geocode({'location': pos}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
        map.setZoom(11);
        var marker = new google.maps.Marker({
          position: latlng,
          map: map
        });
        infowindow.setContent(results[0].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}
/* */
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
 
  directionsService.route({
    origin: document.getElementById('input-entry').value,
    destination: document.getElementById('input-destination').value,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      console.log(response);
      latitudDestination = response.routes[0].bounds.f.b;
      longitudDestination = response.routes[0].bounds.b.f;
      latitudOrigin = response.routes[0].bounds.f.f;
      longitudOrigin = response.routes[0].bounds.b.b;
      var route = response.routes[0];
      console.log(route);
      getEstimates(latitudOrigin, longitudOrigin, latitudDestination, longitudDestination);
      var summaryPanel = document.getElementById('directions-panel');
      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>Ruta: ' + routeSegment +
            '</b><br>';
        inputStart.text=route.legs[i].start_address;
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';

      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
/* */
function getEstimates(latitudOrigin, longitudOrigin, latitudDestination, longitudDestination) {
  console.log(latitudOrigin, longitudOrigin, latitudDestination, longitudDestination);
  $.ajax({
    url: 'https://api.uber.com/v1.2/estimates/price?server_token=FfaK3ZXFZD6oy4q1uoajJ3b2kSX7CXorWF-oy45J',
    /* headers: {
      Authorization: 'Token ' + uberToken
    }, */
    data: {
      start_latitude: latitudOrigin,
      start_longitude: longitudOrigin,
      end_latitude: latitudDestination,
      end_longitude: longitudDestination
    },
    success: function(result) {
      console.log(result);
      const response=result.prices;
      response.forEach(function(element) {
        let name=element.localized_display_name;
        let price=(element.distance*element.low_estimate).toFixed(2)+' S/';

        console.log(element.localized_display_name);
        var li=document.createElement('li')  
        li.classList.add('list-group-item'); 
        li.innerHTML=  name+' -------- '+ price;
        document.getElementById('content-uber').appendChild(li);
      });  
    }  
    
  });
}
