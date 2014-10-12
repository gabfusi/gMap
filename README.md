gMap
=======
A quick and rough JS Object to control a Google Map.

Usage
------

If you already have an array of points:

```javascript
MAP.load({
    selector:'#map',
    toDraw: [{
		    lat: 5.39829,
		    lng: 12.35873,
		    id: i
		}, 
		...
	],
    icon: '<MARKER_IMAGE>',
    initialZoom:10,
    mapType:'ROADMAP',
    sensor: true
});
```

If you don't have an array of points, you can use the geocoding service provided by google:

```javascript
MAP.load({
    selector:'#map',
    toGeocode: [{
		    address: 'Piazza della Vittoria, Genova',
		    html: 'My house!'
		}, 
		...
	],
    icon: '<MARKER_IMAGE>',
    initialZoom:10,
    mapType:'ROADMAP',
    sensor: true
});
```