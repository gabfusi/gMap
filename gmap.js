
/***
 *  @author gabfusi / gabrielefusi.com
 *  
 *  MAP 
 *  helper class for Google maps V3
 */

var MAP = {
    toGeocode: null
    , toDraw: null
    , places: new Array()
    , markers: new Array()
    , geocoder:null
    , map:null
    , bounds:null
    , selector:'#Map'
    , initialZoom:10
    , mapType:'ROADMAP'
    , sensor: false

    , icon:null
    , callback:null

    , init: function() {
        var M = this;

        this.map = new google.maps.Map( $(M.selector)[0], {
            //scrollwheel: false,
            zoom: M.initialZoom,
            center: new google.maps.LatLng(44.169985, 8.345165),
            mapTypeId: google.maps.MapTypeId[M.mapType],
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            }
        });
        this.map.setTilt(45);

        this.bounds = new google.maps.LatLngBounds();

        if( M.toGeocode !== false ){
            this.geocoder = new google.maps.Geocoder();
            this.geocodeAddresses(M.toGeocode);
        } else if( M.toDraw !== false ) {

            for(var i in M.toDraw){
                M.places.push({
                    position: new google.maps.LatLng(M.toDraw[i].lat, M.toDraw[i].lng),
                    //html: M.toDraw[i].html,
                    id: M.toDraw[i].id
                    //innerHtml: MAP.toDraw[i].innerHtml
                });
            }
            this.addPoints();
        }

    }
    , addPoints:function() {
        var M = this;
        $(M.places).each(function(i, place) {

            addPoint(i, place);
        });

        function addPoint(i, place){

            function _addPoint(i, place){
                if(M.places.length > 1){ // if places are more than one, fit bounds
                    // extend the bounds to include the new point
                    MAP.bounds.extend(place.position);
                    MAP.map.fitBounds(MAP.bounds);
                }else{ // else set center on the marker
                    MAP.map.setZoom(5);
                    MAP.map.setCenter(place.position);
                }
                
                // add the marker itself
                var marker_options = {
                    position: place.position,
                    map: MAP.map
                    //animation: google.maps.Animation.DROP
                };
                if(MAP.icon !== null){ marker_options.icon = MAP.icon; }
                var marker = new google.maps.Marker(marker_options);
                MAP.markers.push(marker);

                // add a listener to open the tooltip when a user clicks on one of the markers
                google.maps.event.addListener(marker, 'click', function() {
                    $(document).trigger('MAP.click_marker_in', {place: place, marker: marker, map: MAP.map, markers:MAP.markers});
                });

                google.maps.event.addListener(MAP.map, 'click', function() {
                });
            }

            window.setTimeout(function(){
                _addPoint(i, place);
            }, i*100);
        }

        google.maps.event.addListener(MAP.map, 'click', function() {
            $(document).trigger('MAP.click_marker_out', {map: MAP.map, markers:MAP.markers});
        });
    }

    , moveTo:function(id){
        var index = 0;
        if(!isNaN(id * 1)){
            for(var i in this.places){
                if(this.places[i].id == id){
                    index = i;
                }
            }
            if(index){
                $(document).trigger('MAP.click_marker_in', {place: this.places[index], marker: this.markers[index], map: MAP.map, markers:MAP.markers});
            }
        }

    }

    , load:function(options, callback){

        /* required */
        this.toGeocode = typeof options.toGeocode === 'undefined' ? false : options.toGeocode;
        this.toDraw = typeof options.toDraw === 'undefined' ? false : options.toDraw;
        this.icon = options.icon;
        this.callback = callback;
        /* optional */
        this.selector = options.selector || this.selector;
        this.initialZoom = options.initialZoom || this.initialZoom;
        this.mapType = options.mapType || this.mapType;
        this.sensor = options.sensor || true;

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=" + this.sensor + "&callback=MAP.init";
        document.body.appendChild(script);
    }

    , update: function(places){
        this.removeMarkers();
        this.places = new Array();
        this.toDraw = places;
        for(var i in this.toDraw){
            this.places.push({
                position: new google.maps.LatLng(this.toDraw[i].lat, this.toDraw[i].lng),
                html: this.toDraw[i].html,
                id: MAP.toDraw[i].id,
                innerHtml: MAP.toDraw[i].innerHtml
            });
        }
        this.addPoints();
    }

    , removeMarkers: function(){
        for (var i = 0; i < MAP.markers.length; i++) {
            MAP.markers[i].setMap(null); //Remove the marker from the map
        }
    }

    , restoreMarkersIcon: function(){
        for (var i = 0; i < MAP.markers.length; i++) {
            MAP.markers[i].setIcon(this.icon); //Remove the marker from the map
        }
    }

    , geocoding:{
        counter:0
        , timer:null
        , timeout: 4000
        , timeoutCounter:0
    }

    , geocodeAddresses: function(places) {
        var M = this;

        $(places).each(function(object, i){
            M.codeAddress($(this), i);
        });

        M.geocoding.timer = setInterval(function(){
            if( MAP.geocoding.counter >= MAP.toGeocode.length || MAP.geocoding.timeout < MAP.geocoding.timeoutCounter){
                clearInterval(MAP.geocoding.timer);
                MAP.addPoints();
                if(typeof MAP.callback === 'function'){
                    MAP.callback();
                }
            }
        }, 200);
    }

    , codeAddress: function(i, place) {
        var M = this;
        M.geocoder.geocode( { 'address': place.address }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                MAP.places.push({
                    position: results[0].geometry.location,
                    html:place.html
                });
            }
            MAP.geocoding.counter++;
        });
    }

};
