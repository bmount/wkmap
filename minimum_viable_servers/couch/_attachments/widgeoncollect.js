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
  12 +',' + .4 + ' )' 
  //Math.floor(255*Math.random())+',' + .9 + ' )' 
}


function streetstyle (type, ctx) {
  var types = {
  "0": { cls: "residential", color: "rgba(15,15,15,.7)", width: .5 },
  "1": { cls: "bridleway",  color: "rgba(200,45,45,.8)", width: 2 },
  "2": { cls: "construction", color: "rgba(200,45,45,.8)", width: 2 },
  "3": { cls: "crossing", color: "rgba(200,45,45,.8)", width: .1 },
  "4": { cls: "cycleway", color: "rgba(25,150,25,.6)", width: 1.5 },
  "5": { cls: "footway", color: "rgba(20,100,20,.8)", width: 1.5 },
  "6": { cls: "footway_unconstructed", color: "rgba(200,45,45,.8)", width: 2 },
  "7": { cls: "living_street", color: "rgba(200,45,45,.8)", width: .2 },
  "8": { cls: "motorway", color: "rgba(200,45,45,.8)", width: 3 },
  "9": { cls: "motorway_link", color: "rgba(200,45,45,.8)", width: 3 },
  "10": { cls: "path", color: "rgba(200,45,45,.8)", width: 10 },
  "11": { cls: "pedestrian", color: "rgba(200,45,45,.8)", width: .5 },
  "12": { cls: "platform", color: "rgba(200,45,45,.8)", width: .2 },
  "13": { cls: "primary", color: "rgba(200,45,45,.8)", width: 3 },
  "14": { cls: "primary_link",  color: "rgba(200,45,45,.8)", width: 3 },
  "15": { cls: "proposed",  color: "rgba(200,45,45,.8)", width: 2 },
  "16": { cls: "raceway",  color: "rgba(200,45,45,.8)", width: 2 },
  "17": { cls: "abandoned",  color: "rgba(200,45,45,.8)", width: 2 },
  "18": { cls: "road",  color: "rgba(200,200,45,.8)", width: 10 },
  "19": { cls: "secondary",  color: "rgba(200,200,45,.8)", width: 10 },
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
  ctx.globalAlpha = 1
  ctx.strokeStyle = types[type].color;
  ctx.lineWidth = types[type].width;
}

function uncollect(buf, canvas, tilePoint, zoom, layered) {
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      ukbtype, nsubgeoms, view, forematter, x, y, px, py,
    dv = new DataView ( buf, 0, fullLength );
  while (drawn < fullLength) {
    //try {
      ukbtype = dv.getUint32(drawn, true);
      nsubgeoms = dv.getUint32(drawn + 4, true);
    //} catch (e) {
    //  return;
    //}
    if (ukbtype === 2) {
      if (nsubgeoms > 0) {
        //drawn = polygon ( dv, (drawn+4), ctx );
        drawn = line( dv, (drawn+4), ctx );
      } else {
        drawn += 12;
      }
    }
    else if (ukbtype === 3) {
      //drawn = line ( dv, drawn+4, ctx );
      drawn = polygon ( dv, drawn+4, ctx );
    }
    else {
      ukbtype = 0;
      //return;
      drawn += 12;
    }

  }
}

function xxpolygonxx (dv, idx, ctx) {
  var nlinearrings = dv.getUint32(idx, true),
      k = 4;
  while (nlinearrings) {
    npts = dv.getUint32(idx + k, true);
    k += 4
    ctx.moveTo(dv.getUint8(idx, true), dv.getUint8(idx + 1, true));
    for (var i = 0; i < (npts*2); i += 2 ) {
      ctx.moveTo(dv.getUint8(idx + k + i, true), dv.getUint8(idx + k + i + 1, true));
    }
    k += npts*2;
    ctx.stroke();
    ctx.fill();
    nlinearrings--;
  }
  return idx;
}

function polygon (dv, idx, ctx) {
  var drawn = 0,
      idx = idx,
      npts = dv.getUint32(idx, true),
      osmstyle = dv.getUint32(idx + 4, true);
  idx += 8;
  if (npts === 0) {
    console.log('zz')
    return idx;
  }
  ctx.strokeStyle = '#fff' // "rgba(200, 2, 2, 1)";
  ctx.fillStyle = mkcol(); // "rgba(200, 200, 2, .51)";
  ctx.moveTo(dv.getUint8(idx, true), 255 - dv.getUint8( idx + 1, true));
  ctx.beginPath();
  var x0 = dv.getUint8(idx, true),
      y0 = 255 - dv.getUint8(idx + 1, true);
  idx += 2;
  if (npts === 2) {
    ctx.lineTo(dv.getUint8(idx, true), 255 - dv.getUint8( idx + 1, true));
    ctx.closePath()
    ctx.stroke()
    return idx + 2;
  }
  //console.log(idx)
  for (var i = 2; i < 2*(npts - 1); i += 2) {
    ctx.lineTo(dv.getUint8(idx + i, true), 255 - dv.getUint8( idx + i + 1, true));
  }
  //ctx.lineTo(x0, y0);
  //ctx.closePath();
  ctx.stroke();
  ctx.fill()
  //drawn += 2*npts;
  //console.log(idx);
  return idx + 2*(npts - 1);
}

function line (dv, idx, ctx) {
  var drawn = 0,
      idx = idx,
      npts = dv.getUint32(idx, true),
      osmstyle = dv.getUint32(idx + 4, true);
  streetstyle(osmstyle, ctx);
  //ctx.lineWidth = .4;
  //ctx.strokeStyle = 'rgba(200, 2, 2, .6)';
  idx += 8;
  ctx.beginPath();
  ctx.moveTo(dv.getUint8(idx, true), 255 - dv.getUint8( idx + 1, true));
  idx += 2;
  if (npts === 2) {
    ctx.lineTo(dv.getUint8(idx, true), 255 - dv.getUint8( idx + 1, true));
    ctx.closePath()
    ctx.stroke()
    return idx + 2;
  }
  for (var i = 2; i < 2*(npts - 1); i += 2) {
    ctx.lineTo(dv.getUint8(idx + i, true), 255 - dv.getUint8( idx + i + 1, true));
  }
  //ctx.closePath();
  ctx.stroke();
  //drawn += 2*npts;
  return idx + 2*(npts - 1);
}

return { tile:tileCoords, render:uncollect }

}

