#/usr/bin/env python


from flask import Flask, render_template, Response
import psycopg2
import math
from math import log as ln
from math import pi
from math import tan 
from math import exp 
from math import atan 
from math import floor 

app = Flask(__name__)

# intersection queries are resource-intensive, results should be cached for this
# to be usably fast. whatever the CartoDB guys are doing, basically

queries = {
    'simplest' : """select
        st_asbinary(way) from planet_osm_line where way &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 3875)) 
        and boundary is null limit 1200;
        """,
    'osmline' : """select
        st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), lightsway))
        from planet_osm_line where lightsway &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)) 
        and boundary is null and motorcar is null and route is null 
        limit 3000;""",
    'osmpolygon' : """select
        st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), way))
        from planet_osm_polygon where way &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)) 
        and boundary is null limit 3000;""",
    'osmpoint' : """select
        st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), way))
        from planet_osm_point where way &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)) 
        and boundary is null limit 60;""",
    'osmflower' : """select
        st_asbinary(way) from planet_osm_point where way &&
        st_buffer(st_centroid(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), 1800)
        and boundary is null limit 50""", # limit 25;""",
    'censusblocks' : """select
        st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), 
        wkb_geometry)) from
        tl_2010_06075_tabblock10 where wkb_geometry &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)) limit 3000;""",
    'touristphoto' : """select
        st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), 
        webproj)) from
        touristphoto where webproj &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)) limit 3000;""",
    'localphoto' : """select
        st_asbinary(ST_Intersection(st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)), 
        simpgeom)) from
        localphoto where simpgeom &&
        st_envelope(st_geomfromtext('linestring({0} {1},{2} {3})', 900913)) limit 3000;"""
    }

class WebMap():
    def __init__(self):
        self.r = 6378137.
        self.tile_size = 256.
        self.half_earth = pi * self.r 
        self.earth_circumference = 2 * pi * self.r
        self.resolution_init = 2 * pi * self.r / self.tile_size
    
    def radians(self, degrees):
        return degrees/180. * pi

    def degrees(self, radians):
        return radians/pi * 180

    def project(self, lon, lat):
        x = lon / 180. * self.half_earth
        y = ln(tan(pi/4 + self.radians(lat)/2.)) * self.half_earth 
        return x, y

    def unproject(self, x, y):
        lon = x / self.half_earth * 180
        phi = 2 * atan(exp(y/self.half_earth)) - pi/2
        lat = self.degrees(phi)
        return lon, lat

    def pixels_to_mercator(self, pixel_x, pixel_y, zoom):
        units_per_pixel_at_zoom1 = self.earth_circumference / self.tile_size
        x = pixel_x * units_per_pixel_at_zoom1 / 2 ** zoom - self.half_earth
        y = pixel_y * units_per_pixel_at_zoom1 / 2 ** zoom - self.half_earth
        return x, y

    def mercator_to_pixels(self, x, y, zoom):
        units_per_pixel_at_zoom1 = self.earth_circumference / self.tile_size
        px = (x + self.half_earth) * 2 ** zoom / units_per_pixel_at_zoom1
        py = (y + self.half_earth) * 2 ** zoom / units_per_pixel_at_zoom1
        return px, py

    def pixel_to_tile(self, pixel_x, pixel_y):
        tile_x = floor( pixel_x / float(self.tile_size))
        tile_y = floor( pixel_y / float(self.tile_size))
        return tile_x, tile_y

    def mercator_to_tile(self, x, y, zoom):
        pixel_x, pixel_y = self.mercator_to_pixels(x, y, zoom)
        return self.pixels_to_tile(pixel_x, pixel_y)

    def tile_to_mercator_bounds(self, tile_x, tile_y, zoom):
        tile_y = 2**zoom - 1 - tile_y
        west, south = self.pixels_to_mercator(
                tile_x * self.tile_size, tile_y * self.tile_size, zoom)
        east, north = self.pixels_to_mercator(
                (tile_x + 1) * self.tile_size, (tile_y + 1) * self.tile_size, zoom)
        return [west, south, east, north]


@app.route('/api/<query>/<int:z>/<int:x>/<int:y>.wkb')
def wkb(x, y, z, query):
    global queries      
    c = WebMap()
    query = queries.get(query)
    if not query:
        return ""
    try:
        conn = psycopg2.connect(database='sfcollection')
        cur = conn.cursor()
        cur.execute(query.format(*c.tile_to_mercator_bounds(x, y, z)))
        def genwkb():
            for row in cur.fetchall():
                yield row[0] # single collection of type GeometryCollection (7) if > 1 record
        return Response(genwkb(), mimetype='application/octet-stream')
    except:
        return ""

@app.route('/')
def idx():
    return render_template('init.html')

@app.route('/<other>')
def others(other):
    return render_template(other+'.html')

@app.route('/favicon.ico')
def favicon():
    return ""

#app.run(debug=True)

