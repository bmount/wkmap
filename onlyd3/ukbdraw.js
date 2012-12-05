var viewDv;

function uncollect (buf, canvas) {
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      ukbtype, nsubgeoms, view, x, y, px, py,
    dv = new DataView ( buf, 0, fullLength );
    viewDv = new DataView ( buf, 0, fullLength );
  while (drawn < fullLength) {
      ukbtype = dv.getUint32(drawn, true);
      nsubgeoms = dv.getUint32(drawn + 4, true);
    if (ukbtype === 2) {
      if (nsubgeoms > 0) {
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
      drawn += 12;
    }
  }
  return canvas
}

function polygon (dv, idx, ctx) {
  var drawn = 0,
      idx = idx,
      npts = dv.getUint32(idx, true)
      osmstyle = dv.getUint32(idx + 4, true);
  idx += 8;
  if (npts === 0) {
    return idx;
  }
  ctx.moveTo(dv.getInt16(idx, true)/100, 256 - dv.getInt16( idx + 2, true)/100);
  ctx.beginPath();
  idx += 4;
  if (npts === 2) {
    ctx.lineTo(dv.getInt16(idx, true)/100, 256 - dv.getInt16( idx + 2, true)/100);
    ctx.closePath()
    ctx.stroke()
    return idx + 4;
  }
  for (var i = 4; i < 4*(npts-1); i += 4) {
    ctx.lineTo(dv.getInt16(idx + i, true)/100, 256 - dv.getInt16( idx + i + 2, true)/100);
  }
  ctx.stroke();
  ctx.closePath()
  ctx.fill()
  return idx + 4*(npts - 1);
}

function line (dv, idx, ctx) {
  var drawn = 0,
      idx = idx,
      npts = dv.getUint32(idx, true),
      osmstyle = dv.getUint32(idx + 4, true);
  streetrender(osmstyle, ctx);
  idx += 8;
  ctx.beginPath();
  ctx.moveTo(dv.getInt16(idx, true)/100, 256 - dv.getInt16( idx + 2, true)/100);
  idx += 4;
  if (npts === 2) {
    ctx.lineTo(dv.getInt16(idx, true)/100, 256 - dv.getInt16( idx + 2, true)/100);
    ctx.closePath()
    ctx.stroke()
    return idx + 4;
  }
  for (var i = 4; i < 4*(npts-1); i += 4) {
    ctx.lineTo(dv.getInt16(idx + i, true)/100, 256 - dv.getInt16( idx + i + 2, true)/100);
  }
  //ctx.closePath();
  ctx.stroke();
  return idx + 4*(npts - 1);
}

