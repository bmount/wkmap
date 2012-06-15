function wkmap () {

function project (lon, lat) {
  var x = lon * 111319.49079327,
      y = Math.log(Math.tan(0.785398163397 + lat * 0.00872664626)) * 6378137
  return [x, y]
}

function tilePt (p, jHat, arr) { // ĵ explicit or y-ness idx of [x,y,x,y,x,y] for arr.map(val, idx...)
  var zoom = this.zoom,
      zm = (1 << zoom),
      rv = Math.floor( (p + 20037508.34278) * zm * 2.4953202336659905e-8)
  return jHat % 2 ? zm - rv : rv
}

function tileCoords (pt, zoom, projected) {
  if (!projected) pt = project.apply(this, pt)
  return [zoom].concat(pt.map(tilePt, {zoom:zoom}))
}

function scale (pt, zm, tl) {
  return Math.abs((pt + 20037508.342789) * (1 << zm) / 156543.033928041 - (tl*256))
}

function draw (dv, idx, ctx, numRecs, zm, tilePoint) {
  ctx.beginPath()
  var n = 1,
      x = dv.getFloat64(idx, true),
      y = dv.getFloat64(idx+8, true)
  idx += 16
  ctx.strokeStyle = '#'+Math.floor(Math.random()*16777).toString(16)
  ctx.moveTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
  var bzct = []
  while (n < numRecs) {
    x = dv.getFloat64(idx, true)
    y = dv.getFloat64(idx+8, true)
    n+=1
    // plainer correct: ctx.lineTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
    var qx = scale(x, zm, tilePoint.x),
        qy = scale(y, zm, tilePoint.y),
        pm = [1,-1][Math.round(Math.random())]
    ctx.lineWidth = .5 + Math.random()*pm
    //ctx.quadraticCurveTo( qx-11*Math.random() * pm, qy+11*Math.random() * pm, qx, qy )
    ctx.lineTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
    idx += 16
  }
  //ctx.bezierCurveTo.apply(ctx, bzct)
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

function mkcol () {
  return "rgba(" + 
  Math.floor(255*Math.random()) +',' + Math.floor(255*Math.random()) +','+ 
  12 +',' + .8 + ' )' 
  //Math.floor(255*Math.random())+',' + .9 + ' )' 
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
  ctx.strokeStyle = '#8888'+Math.floor(Math.random()*255).toString(16)
  ctx.lineWidth = .2 + Math.random()
  var grad = ctx.createLinearGradient(0,0,0,256),
      pm = [1,-1][Math.round(Math.random())]
  grad.addColorStop(0, mkcol())
  grad.addColorStop(.33, mkcol())
  grad.addColorStop(.67, mkcol())
  grad.addColorStop(1, mkcol())
  //grad.addColorStop(0, 'rgba(11,11,11,.9)')
  //grad.addColorStop(1, 'rgba(11,11,11,.1)')
  ctx.fillStyle = grad
  //ctx.fillStyle = mkcol()
  //ctx.fillStyle = '#'+Math.floor(Math.random()*16777).toString(16)
  ctx.moveTo(scale(x0, zm, tilePoint.x), scale(y0, zm, tilePoint.y))
  while (n < numPoints) {
    x = dv.getFloat64(idx, true)
    y = dv.getFloat64(idx+8, true)
    n++
    // plainer correct: ctx.lineTo(scale(x, zm, tilePoint.x), scale(y, zm, tilePoint.y))
    var qx = scale(x, zm, tilePoint.x),
        qy = scale(y, zm, tilePoint.y) //,
        //scaletor = [1, 1, 7, 3, 10, 5, 6][Math.floor(Math.random()*6)]
    ctx.lineTo( qx, qy )
    // a little painterly:
    //ctx.quadraticCurveTo(qx+2*Math.random()*pm, qy+2*Math.random()*pm, qx, qy)
    //ctx.bezierCurveTo(qx+15, qy+15, qx+2*Math.random()*pm, qy+2*Math.random()*pm, qx, qy)
    //ctx.bezierCurveTo(qx+scaletor*Math.random()*pm, qy+scaletor*Math.random()*pm, qx+scaletor*Math.random()*pm, qy+scaletor*Math.random()*pm, qx, qy)
    idx += 16
  }
  //ctx.lineTo( x0, y0 )
  ctx.closePath()    
  ctx.fill()
  //ctx.stroke()
  return idx
}


function uncollect (buf, canvas, tilePoint, zoom, layered) {
  var fullLength = buf.byteLength
    , ctx = canvas.getContext('2d')
    , idx = 1 // assume little endian
    , dv = new DataView(buf)
    , yTileMax = 1 << tilePoint.y
    , tileY = yTileMax - tilePoint.y
    , wkbType, linearRings
    , polygons = 0, multiLength = 0
    , numRecs = 0, numPts
    tilePoint.y = ((1 << zoom) - tilePoint.y)

  if (!layered) ctx.clearRect(0,0,256,256)
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

return { tile:tileCoords, render:uncollect }

}

