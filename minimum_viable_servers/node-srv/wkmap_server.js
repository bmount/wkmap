var pg = require('pg')
  , http = require('http')
  , url = require('url')
  , tilebounds = require('./tile_mercator_bounds.js')
  , queries = require('./wkqueries.js')

var bbox = tilebounds.TileMercatorBounds()
  , cnx = 'postgres://localhost:5432/sfcollection' // sample dump available in readme
  , client = new pg.Client(cnx)

function tileUrl (reqstr) {
  var zxy = reqstr.match(/\d+\/\d+\/\d+/)[0].split('/')
  if (zxy.length === 3) return [zxy[1], zxy[2], zxy[0]]
  return false
}

var srv = http.createServer(function (req, res) {
  var tile
  if (!(tile = tileUrl(req.url))) {
    res.writeHead(500)
    res.end()
  } else {
    //var geoms = client.query(queries['osmline'], bbox(tile)) // mercator bbox of tms tile
    
    // figure out what's going on with pg binary queries later
    var geoms = client.query('select st_asbinary(way) from planet_osm_polygon limit 10')
    console.log(geoms)
    res.writeHead(200, {"Content-Type": "application/octet-stream"})
    geoms.on('row', function (row) {
      res.write(row['st_asbinary'])
    })
    geoms.on('end', function () {
      res.end()
    })
    client.connect()
  }
})

srv.listen(4002)
