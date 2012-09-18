#2012 fast vector maps using 1950's technology!

[slippy example](http://ricos.aguacat.es/mapixy/_design/ofm/widgeonlike.html)

Sort of like a tiled geojson vector layer, but using OGC binary formats and 
JavaScript ArrayBuffers and DataViews. Uses PostGIS queries inspired by
Vizzuality/CartoDB's Vecnik project, and trying to apply that kind of cacheing
to the server component of this. Any ideas, issues, happily welcomed.

Live examples here: http://wkb.guacamol.es/osmwkb/_design/osmstreets/all.html

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
