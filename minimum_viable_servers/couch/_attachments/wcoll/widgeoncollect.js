function wkmap () {

function project (lon, lat) {
  var x = lon * 111319.49079327,
      y = Math.log(Math.tan(0.785398163397 + lat * 0.00872664626)) * 6378137
  return [x, y]
}

function tilePt (p, jHat, arr) { // Äµ explicit or y-ness idx of [x,y,x,y,x,y] for arr.map(val, idx...)
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
  //return Math.abs((pt + 20037508.342789) * (1 << zm) / 156543.033928041 - (tl*256))
  return Math.abs((pt + 20037508.342789) * (1 << zm) / 157156.928179 - (tl*255))
}

function drawflower (x, y, ctx) {
  // example of custom point renderer, here flowers
  // with many random layers and colors
  var outer = 8
  for (var i = Math.random()*100 + 20; i > 0; i-=Math.random()*25) {
    ctx.beginPath()
    ctx.moveTo(x+i, y+i)
    var twistRule = [1, 1, -1, Math.random()][Math.round(Math.random()*3)]
    for (var theta = 0; theta < Math.PI*2; theta+=Math.abs(twistRule)) {
      // marigold to poppy colors:
      // ctx.fillStyle = 'rgba('+ Math.round(240 - 100*Math.random()) 
      // + ',' + Math.round(150-50*Math.random()) +',0,.8)'
      ctx.fillStyle = '#'+Math.floor(Math.random()*16777).toString(16)
      ctx.globalAlpha = .2
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


var streetstyle = {
  "0": { cls: "residential", color: "rgba(215,215,215,.7)", width: .5 },
  "1": { cls: "bridleway",  color: "rgba(200,45,45,.8)", width: 2 },
  "2": { cls: "construction", color: "rgba(200,45,45,.8)", width: 2 },
  "3": { cls: "crossing", color: "rgba(200,45,45,.8)", width: .1 },
  "4": { cls: "cycleway", color: "rgba(25,150,25,.6)", width: 1.5 },
  "5": { cls: "footway", color: "rgba(20,100,20,.8)", width: 1.5 },
  "6": { cls: "footway_unconstructed", color: "rgba(200,45,45,.8)", width: 2 },
  "7": { cls: "living_street", color: "rgba(200,45,45,.8)", width: .2 },
  "8": { cls: "motorway", color: "rgba(200,45,45,.8)", width: 3 },
  "9": { cls: "motorway_link", color: "rgba(200,45,45,.8)", width: 3 },
  "10": { cls: "path", color: "rgba(45,45,200,.8)", width: 4 },
  "11": { cls: "pedestrian", color: "rgba(200,45,45,.8)", width: .5 },
  "12": { cls: "platform", color: "rgba(200,45,45,.8)", width: .2 },
  "13": { cls: "primary", color: "rgba(200,45,45,.8)", width: 7 },
  "14": { cls: "primary_link",  color: "rgba(200,45,45,.8)", width: 3 },
  "15": { cls: "proposed",  color: "rgba(200,45,45,.8)", width: 2 },
  "16": { cls: "raceway",  color: "rgba(200,45,45,.8)", width: 2 },
  "17": { cls: "abandoned",  color: "rgba(200,45,45,.8)", width: 2 },
  "18": { cls: "road",  color: "rgba(200,200,45,.8)", width: 5 },
  "19": { cls: "secondary",  color: "rgba(150,200,45,.8)", width: 6 },
  "20": { cls: "secondary_link",  color: "rgba(200,45,45,.8)", width: 2 },
  "21": { cls: "service",  color: "rgba(200,45,45,.8)", width: .2 },
  "22": { cls: "service; residential",  color: "rgba(200,45,45,.8)", width: .2 },
  "23": { cls: "steps",  color: "rgba(200,45,45,.8)", width: 2 },
  "24": { cls: "tertiary",  color: "rgba(200,45,45,.8)", width: 2 },
  "25": { cls: "tertiary_link",  color: "rgba(200,45,45,.8)", width: 2 },
  "26": { cls: "track",  color: "rgba(200,45,45,.8)", width: 2 },
  "27": { cls: "trunk",  color: "rgba(200,45,45,.8)", width: 2 },
  "28": { cls: "trunk_link",  color: "rgba(200,45,45,.8)", width: 2 },
  "29": { cls: "unclassified", color: "rgba(200,45,45,.8)", width: .2 },
}

function streetrender (type, ctx) {
  ctx.globalAlpha = 1
  ctx.strokeStyle = streetstyle[type].color;
  ctx.lineWidth = streetstyle[type].width;
}
  

function line (buf, canvas, tilePoint, zoom, layered) {
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      uktype, npts, view, forematter, x, y, px, py, ctx, osmstyle;
  ctx.clearRect(0,0,255,255);
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  ctx.shadowBlur = .1
  ctx.shadowColor = "rgba(255,255,255,.6)";
  ctx.lineWidth = 2;
  //drawflower(128, 128, ctx);
  ctx.strokeStyle = "rgba(21,21,210,.8)";

  var dv = new DataView(buf, 0, fullLength),
      nstyles = 0
  while (drawn < fullLength) {
    //ctx.strokeStyle = "rgba(29,29,29,.8)";
    ukbtype = dv.getUint32(drawn, true);
    npts = dv.getUint32(drawn + 4, true);
    osmstyle = dv.getUint32(drawn + 8, true);
    streetrender(osmstyle, ctx);
    drawn += 12;
    ctx.beginPath()
    ctx.moveTo(dv.getUint8(drawn, true), 255 - dv.getUint8(drawn+1, true));
    for (var i = 2; i < npts*2; i += 2) {
      ctx.lineTo(dv.getUint8(drawn + i, true), 255 - dv.getUint8(drawn + i + 1, true));
    }
    //ctx.closePath()
    ctx.stroke()
    nstyles++
    drawn += npts*2;
  
  }
}


function slowline (buf, canvas, tilePoint, zoom, layered) {
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      uktype, npts, view, forematter, x, y, px, py, ctx, osmstyle;
  ctx.clearRect(0,0,255,255);
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  ctx.shadowBlur = .1
  ctx.shadowColor = "rgba(255,255,255,.6)";
  ctx.lineWidth = 2;
  //drawflower(128, 128, ctx);
  ctx.strokeStyle = "rgba(21,21,210,.8)";

  var dv = new DataView(buf, 0, fullLength),
      nstyles = 0
  while (drawn < fullLength) {
    //ctx.strokeStyle = "rgba(29,29,29,.8)";
    ukbtype = dv.getUint32(drawn, true);
    npts = dv.getUint32(drawn + 4, true);
    osmstyle = dv.getUint32(drawn + 8, true);
    streetrender(osmstyle, ctx);
    drawn += 12;
    window.setTimeout(function (evt) {
    ctx.beginPath()
    var ldrawn = drawn - 0
    ctx.moveTo(dv.getUint8(ldrawn, true), 255 - dv.getUint8(ldrawn+1, true));
    for (var i = 2; i < npts*2; i += 2) {
      ctx.lineTo(dv.getUint8(ldrawn + i, true), 255 - dv.getUint8(ldrawn + i + 1, true));
    }
    ctx.stroke()
    }, drawn)
    //ctx.closePath()
    nstyles++
    drawn += npts*2;
  
  }
}

return { tile:tileCoords, render:line, renderslow:slowline, streetstyle:streetstyle }

}

