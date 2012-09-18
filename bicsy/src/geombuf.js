function uncollect (buf, canvas) {
  var fullLength = buf.byteLength,
      drawn = 0,
      ctx = canvas.getContext('2d'),
      ukbtype, nsubgeoms, view, forematter, x, y, px, py,
    dv = new DataView ( buf, 0, fullLength );
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
      npts = dv.getUint32(idx, true),
      osmstyle = dv.getUint32(idx + 4, true);
  idx += 8;
  if (npts === 0) {
    return idx;
  }
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
  for (var i = 2; i < 2*(npts - 1); i += 2) {
    ctx.lineTo(dv.getUint8(idx + i, true), 255 - dv.getUint8( idx + i + 1, true));
  }
  ctx.stroke();
  ctx.fill()
  return idx + 2*(npts - 1);
}

function line (dv, idx, ctx) {
  var drawn = 0,
      idx = idx,
      npts = dv.getUint32(idx, true),
      osmstyle = dv.getUint32(idx + 4, true);
  streetrender(osmstyle, ctx);
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
  return idx + 2*(npts - 1);
}


