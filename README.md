#2012 fast vector maps using 1950's technology!

[slippy example](http://ricos.aguacat.es/mapixy/_design/ofm/widgeonlike.html)

Sort of like a tiled geojson vector layer, but using binary formats and 
JavaScript ArrayBuffers and DataViews. Inspired by
Vizzuality/CartoDB's Vecnik project, using a very simple format based on OGC WKB. (There is a pure WKB version at tag `wellknownbinary`.)
The underlying representation of the geometries is described in sister project
readme `canvasback`. This project takes canvasback's `ArrayBuffer` based
 tile map service and renders them to canvas. 

There are maybe a couple ways to do that: two versions are here 
in 1) `bicsy` and 2) `widgeon`. The former is lightly modified from
mbostock/pixymaps and renders to a single canvas, the latter is
one canvas per tile in a map container element. Fingers crossed for
`d3.geom.tile` which is also like pixymaps and is in the d3 tracker.

(old) Live examples here: http://wkb.guacamol.es/osmwkb/_design/osmstreets/all.html

Very alpha, will have an interaction component inspired by this: https://github.com/bloomtime/d3map

More examples, heavier than image tiles in general but pretty usably fast, and
this is without many well-thought-out PostGIS queries:

[data for examples (20M)](http://h.sfgeo.org/tmp/pics/sfcollection.sql.tar.gz)

OSM points as flowers and roads as chalk on grass:

![osm flowers](http://h.sfgeo.org:5984/tmp/pics/osm_point_flowers_grass.png)

street map:

![osm thin](http://h.sfgeo.org:5984/tmp/pics/thin_osmlines.png)

Way too many geometries from Eric Fischer's 2010 Locals-Tourists visualizations:
(http://flickr.com/walkingsf)

![locals and tourists](http://h.sfgeo.org:5984/tmp/pics/local-tourist-busy.png)

Bunch of OSM polygons, streets, and points in layers:

![layered osm](http://h.sfgeo.org:5984/tmp/pics/plain_osmwkb.png)
