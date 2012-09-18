function wkmap (center, provider, dataset, mapContainer, h, w) {
var center = center || [-122.53948, 37.78]
    , dataset = dataset || ''
    , mapContainer = mapContainer || "#map"
    , h = h || 500
    , w = w || 600
    , zoom = zoom || 14
    , queueable = 5
    , pending = 0
    , remaining = 0
    , wkbCache = {}
    // TMS-like urls and element id's:
    , mkurl = provider || function (arr) { return dataset + '/'+ arr.slice(0,3).join('/')+'.wkb' }
    , mkid = function (arr) { return dataset.replace('/', '-')
                                            .replace('.','-')
                                            .replace(/^-/, '') + '-' 
                                            + arr.slice(0,3).join('-') }
    , __ = function (sel) { return document.querySelector(sel) }

/*
close-enough radius of earth = 6378137
π/180 = 0.0174532925 :: φ/2 -> 0.00872664626
at equator, m per px if entire map is 1 255 px tile = 156543.0339280 
res0^-1 * tilesize ^-1 = 2.4953202336659905e-8
Mercator equation: ln(atan(π/4 + φ/2)) * r
*/

function project (lon, lat) {
  var x = lon * 111319.49079327
    , y = Math.log(Math.tan(0.785398163397 + lat * 0.00872664626)) * 6378137
  return [x, y]
}

function tilePt (p, jHat, arr) { // ĵ explicit or y-ness idx of [x,y,x,y,x,y] for arr.map(val, idx...)
  var zoom = this.zoom
    , zm = (1 << zoom)
    , rv = Math.floor( (p + 20037508.34278) * zm * 2.4953202336659905e-8)
  return jHat % 2 ? zm - rv : rv
}

function tileCoords (pt, zoom, projected) {
  if (!projected) pt = project.apply(this, pt)
  return [zoom].concat(pt.map(tilePt, {zoom:zoom}))
}

function showTiles (center, w, h, zoom) {
  var center = tileCoords(center, zoom)
    , exes = Math.ceil((w) / 255 + 1)
    , wyes = wys = Math.ceil((h) / 255 + 1)
    , rv = []
  while (exes) {
    while (wyes) {
      rv.splice(0, 0, [zoom, center[1] + exes, center[2] + wyes,
              [(exes-1)*255, (wyes-1)*255]]) 
      wyes--
    }
    wyes = wys
    exes--
  }
  return rv
}

function get (tile, callback, el) {
  var buf = new XMLHttpRequest()
    , url = mkurl(tile)
  if (url in wkbCache) {
    var can = __('#'+mkid(tile))
    callback(wkbCache[url], can, {x:tile[1], y:tile[2]}, tile[0])
    pending--
    return
  }
  buf.open("GET", url, true)
  buf.responseType = 'arraybuffer'
  buf.onload = function (evt) {
    if ('function' === typeof callback && buf.response) {
      wkbCache[url] = buf.response
      callback(buf.response, el, {x:tile[1], y:tile[2]}, tile[0]) 
      pending--
    } else {
    // pending-- 
    }
  }
  buf.send(null)
  return el
}

function line (buf, canvas, tilePoint, zoom, layered) {
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      uktype, npts, view, forematter, x, y, px, py, ctx;
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 2
  ctx.shadowBlur = 5
  ctx.shadowColor = "rgba(200,200,200,.8)";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(29,29,29,.8)";
  var dv = new DataView(buf, 0, fullLength);
  while (drawn < fullLength) {
    ukbtype = dv.getUint32(drawn, true);
    npts = dv.getUint32(drawn + 4, true);
    drawn += 8;
    ctx.beginPath()
    ctx.moveTo(dv.getUint8(drawn, true), 255 - dv.getUint8(drawn+1, true));
    for (var i = 2; i < npts*2; i += 2) {
      ctx.lineTo(dv.getUint8(drawn + i, true), 255 - dv.getUint8(drawn + i + 1, true));
    }
    ctx.closePath()
    ctx.stroke()
    drawn += npts*2;
  
  }
}

function semiqueue (tiles, layer) {
  if (!tiles) {
    return
  }
  var tile
  while (tile = tiles.shift()) {
    pending++
    el = document.createElement('canvas')
    el.height = 255
    el.width = 255
    el.style.position = 'absolute'
    el.style.left = tile[3][0] + 'px'
    el.style.top = tile[3][1] + 'px'
    el.class = "maptile"
    el.id = mkid(tile)
    el = get(tile, line, el) //just lines for this one
    if (!__('#'+mkid(tile))) __(mapContainer).appendChild(el)
    if (pending > queueable) { 
      semiqueue(tiles)
    }
  }
}

semiqueue (showTiles (center, w, h, zoom ))

}

