function wkmap (center, provider, dataset, mapContainer, h, w) {
var center = center || [-122.53948, 37.88]
    , dataset = dataset || ''
    , mapContainer = mapContainer || "#map"
    , h = h || 500
    , w = w || 600
    , zoom = zoom || 13
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
at equator, m per px if entire map is 1 256 px tile = 156543.0339280 
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
    , exes = Math.ceil((w) / 256 + 1)
    , wyes = wys = Math.ceil((h) / 256 + 1)
    , rv = []
  while (exes) {
    while (wyes) {
      rv.splice(0, 0, [zoom, center[1] + exes, center[2] + wyes,
              [(exes-1)*256, (wyes-1)*256]]) 
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

function scale (pt, zm, tl) {
  return Math.abs((pt + 20037508.342789) * (1 << zm) / 156543.033928041 - (tl*256))
}

// This is what to mess with
function draw (dv, idx, ctx, numRecs, zm, tilePoint) {
  ctx.beginPath()
  var n = 1
    , x = dv.getFloat64(idx, true)
    , y = dv.getFloat64(idx+8, true)
  idx += 16
  ctx.strokeStyle = 'rgba(11, 11, 11, .6)' // from chalk-on-grass example
  ctx.lineWidth = 1
  ctx.moveTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
  while (n < numRecs) {
    x = dv.getFloat64(idx, true)
    y = dv.getFloat64(idx+8, true)
    n+=1
    // plainer and maybe faster, qx, qy stuff for curves: 
    // ctx.lineTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
    var qx = scale(x, zm, tilePoint.x)
      , qy = scale(y, zm, tilePoint.y)
      //, pm = [1,-1][Math.round(Math.random())] // handy for alternating wavy directions
    //ctx.quadraticCurveTo( qx-6*Math.random() * pm, qy+6*Math.random() * pm, qx, qy )
    ctx.lineTo(qx, qy)
    idx += 16
  }
  ctx.stroke()
  ctx.closePath()    
  return idx + 1 // skip next endianness flag
}

function drawflower (x, y, ctx) {
  // example of custom point renderer, here flowers
  // with many random layers and colors
  var outer = 8
  for (var i = Math.random()*20; i > 0; i-=Math.random()*5) {
    ctx.beginPath()
    ctx.moveTo(x+i, y+i)
    var twistRule = [1, 1, -1, Math.random()][Math.round(Math.random()*3)]
    for (var theta = 0; theta < Math.PI*2; theta+=Math.abs(twistRule)) {
      // marigold to poppy colors:
      // ctx.fillStyle = 'rgba('+ Math.round(240 - 100*Math.random()) 
      // + ',' + Math.round(150-50*Math.random()) +',0,.8)'
      ctx.fillStyle = '#'+Math.floor(Math.random()*16777).toString(16)
      ctx.quadraticCurveTo(x+ (i + outer)*Math.cos(theta+.5), y + (i + outer)*Math.sin(theta+.5),
      x+ i*Math.cos(theta+1), y + i*Math.sin(theta+1))
    }
    ctx.fill()
    ctx.closePath()
  }
} 

function drawpt (dv, idx, ctx, numRecs, zm, tilePoint) {
  var x = scale(dv.getFloat64(idx, true), zm, tilePoint.x)
    , y = scale(dv.getFloat64(idx+8, true), zm, tilePoint.y)
  //drawflower(x, y, ctx)    
  ctx.beginPath()    
  ctx.arc(x, y, 4, 0, Math.PI*2, true)
  ctx.closePath()
  ctx.fill()
  return idx + 17 // 2 doubles and next endianness flag
}

function drawpoly (dv, idx, ctx, numPoints, zm, tilePoint) {
  // make any function and pass it to the uncollector
  // does not assume next record has endianness flag (can be
  // sequence of linear rings)
  ctx.beginPath()
  var n = 1, x, y,
      x0 = dv.getFloat64(idx, true),
      y0 = dv.getFloat64(idx+8, true)
  idx += 16
  ctx.moveTo(scale(x0, zm, tilePoint.x), scale(y0, zm, tilePoint.y))
  while (n < numPoints) {
    x = dv.getFloat64(idx, true)
    y = dv.getFloat64(idx+8, true)
    n++
    ctx.lineTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
    /* or for curves, variants of:
    var qx = scale(x, zm, tilePoint.x)
      , qy = scale(y, zm, tilePoint.y)
    */
    idx += 16
  }
  ctx.closePath()    
  ctx.fill()
  // ctx.stroke()
  return idx
}


function logbuf (buf, canvas, tilePoint, zoom, layered) {
  window.studybuf = buf;
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      uktype, npts, view, forematter, x, y, px, py, ctx;
  var dv = new DataView(buf, 0, fullLength);
  //console.log('checkendian, little first then npts')
  //console.log(dv.getUint32(0, true));
  //console.log(dv.getUint32(4, true));
  while (drawn < fullLength) {
    //forematter = (new Uint32Array(buf, drawn, 2)),
    ukbtype = dv.getUint32(drawn, true);
    npts = dv.getUint32(drawn + 4, true);
    //console.log('type', ukbtype, 'npts', npts);
    drawn += 8;
    //view = new Uint8Array(buf, drawn, npts*2);
    //ctx.moveTo(view[0], view[1]);
    ctx.beginPath()
    ctx.moveTo(dv.getUint8(drawn, true), 256 - dv.getUint8(drawn+1, true));
    for (var i = 2; i < npts*2; i += 2) {
      x = dv.getUint8(drawn + i, true)
      y = 256 - dv.getUint8(drawn + i + 1, true)
      px = dv.getUint8(drawn + i - 2, true)
      py = 256 - dv.getUint8(drawn + i - 1, true)
      //ctx.lineTo(view[i], 256 - view[i + 1]);
      if (((Math.abs(Math.abs(px) - Math.abs(x)) > 50) || (Math.abs((Math.abs(py) - Math.abs(y)) > 50)))) {
       ctx.closePath();
       continue;
      }
      ctx.lineTo(dv.getUint8(drawn + i, true), 256 - dv.getUint8(drawn + i + 1, true));
    ctx.closePath()
      
    }
    ctx.stroke()
    //drawn += fullLength;
    drawn += npts*2;
  
  }
  //console.log('end tile');
}

function uncollect (buf, canvas, tilePoint, zoom, layered) {
  var fullLength = buf.byteLength,
      ctx = canvas.getContext('2d'),
      idx = 1, // assume little endian
      dv = new DataView(buf),
      yTileMax = 1 << tilePoint.y,
      tileY = yTileMax - tilePoint.y,
      wkbType, linearRings,
      polygons = 0, multiLength = 0,
      numRecs = 0, numPts
      tilePoint.y = (1 << zoom) - tilePoint.y
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.shadowBlur = 0
  ctx.shadowColor = "rgba(255,255,255,.9)"

  if (!layered) ctx.clearRect(0,0,256,256)
    //ctx.shadowColor = "rgba(11,11,11,.7)"
  //ctx.fillStyle = "rgba(255,255,255,0)"
  while (idx < fullLength) { 
    wkbType = dv.getUint32(idx, true)
    if (wkbType === 2) { // probably does
      numRecs = dv.getUint32(idx + 4, true)
      idx = draw (dv, idx + 8, ctx, numRecs, zoom, tilePoint)
    }
    else if (wkbType === 1) {
      idx = drawpt (dv, idx + 4, ctx, numRecs, zoom, tilePoint)
    }
    else if (wkbType === 3) {
      linearRings = dv.getUint32(idx + 4, true)
      idx += 8
      while (linearRings) {
        // optionally, some other callback for polygons:
        idx = drawpoly (dv, idx + 4, ctx, dv.getUint32(idx, true), zoom, tilePoint) // +1 
        linearRings--
      }
      idx += 1 // resume endianness ignoring
    }
    else if (wkbType > 3) { 
      idx += 9 // blow through array uncollecting it
      continue
    }
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
    el.height = 256
    el.width = 256
    el.style.position = 'absolute'
    el.style.left = tile[3][0] + 'px'
    el.style.top = tile[3][1] + 'px'
    el.class = "maptile"
    el.id = mkid(tile)
    el = get(tile, logbuf, el)
    if (!__('#'+mkid(tile))) __(mapContainer).appendChild(el)
    if (pending > queueable) { 
      semiqueue(tiles)
    }
  }
}

semiqueue (showTiles (center, w, h, zoom ))

}

