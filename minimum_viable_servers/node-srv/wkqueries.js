var queries = {
    simplest : "select " +
        "st_asbinary(way) from planet_osm_line where way && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 3875))  " +
        "and boundary is null limit 1200;",
    osmline : "select " +
        "st_asbinary(ST_Intersection(st_envelope(st_geomfromtext(" +
        "'linestring($1, $2, $3, $4)', 900913)), lightsway)) " +
        "from planet_osm_line where lightsway && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913))  " +
        "and boundary is null and motorcar is null and route is null  " +
        "limit 3000;",
    osmpolygon : "select " +
        "st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)), way)) " +
        "from planet_osm_polygon where way && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913))  " +
        "and boundary is null limit 3000;",
    osmpoint : "select " +
        "st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)), way)) " +
        "from planet_osm_point where way && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913))  " +
        "and boundary is null limit 60;",
    osmflower : "select " +
        "st_asbinary(way) from planet_osm_point where way && " +
        "st_buffer(st_centroid(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)), 1800) " +
        "and boundary is null limit 50",
    censusblocks : "select " +
        "st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)),  " +
        "wkb_geometry)) from " +
        "tl_2010_06075_tabblock10 where wkb_geometry && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)) limit 3000;", 
    touristphoto : "select " +
        "st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)),  " +
        "webproj)) from " +
        "touristphoto where webproj && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)) limit 3000;",
    localphoto : "select " +
        "st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)),  " +
        "simpgeom)) from " +
        "localphoto where simpgeom && " +
        "st_envelope(st_geomfromtext('linestring($1, $2, $3, $4)', 900913)) limit 3000;"
}

exports.queries = queries
