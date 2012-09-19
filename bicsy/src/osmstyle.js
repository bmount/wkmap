
var streetstyle = {
  "0": { cls: "residential", color: "rgba(10,10,200,.25)", width: 1.5 }, // very very frequent **
  "1": { cls: "bridleway",  color: "rgba(200,45,45,1)", width: 2 },
  "2": { cls: "construction", color: "rgba(200,45,45,1)", width: 2 },
  "3": { cls: "crossing", color: "rgba(200,45,45,1)", width: 2 },
  "4": { cls: "cycleway", color: "rgba(25,25,25,.21)", width: 1.5 },
  "5": { cls: "footway", color: "rgba(100,100,100,1)", width: .5 },
  "6": { cls: "footway_unconstructed", color: "rgba(200,45,45,1)", width: 2 },
  "7": { cls: "living_street", color: "rgba(145,145,145,1)", width: 2 },
  "8": { cls: "motorway", color: "rgba(230,20,20,.51)" , width: 5 }, // frequent **
  "9": { cls: "motorway_link", color: "rgba(200,200,200,1)", width: 3 }, // frequent **
  "10": { cls: "path", color: "rgba(4,150,4,.31)", width: 1.5 },
  "11": { cls: "pedestrian", color: "rgba(245,245,245,1)", width: .5 },
  "12": { cls: "platform", color: "rgba(200,45,45,1)", width: .2 },
  "13": { cls: "primary", color: "rgba(10,10,200,.35)", width: 5 }, // frequent **
  "14": { cls: "primary_link",  color: "rgba(200,30,30,1)", width: 3 },
  "15": { cls: "proposed",  color: "rgba(200,45,45,1)", width: 2 },
  "16": { cls: "raceway",  color: "rgba(200,45,45,1)", width: 2 },
  "17": { cls: "abandoned",  color: "rgba(200,45,45,1)", width: 2 },
  "18": { cls: "road",  color: "rgba(255,0,255,1)", width: 2 }, // frequent **
  "19": { cls: "secondary",  color: "rgba(55,55,200,.54)", width: 3 }, // frequent **
  "20": { cls: "secondary_link",  color: "rgba(255,255,0,1)", width: 2 }, // frequent **
  "21": { cls: "service",  color: "rgba(145,145,145,1)", width: 2 },
  "22": { cls: "service; residential",  color: "rgba(200,45,45,1)", width: .2 },
  "23": { cls: "steps",  color: "rgba(200,45,45,1)", width: 2 },
  "24": { cls: "tertiary",  color: "rgba(10,10,200,.75)", width: .5 },
  "25": { cls: "tertiary_link",  color: "rgba(45,45,45,.41)", width: 2 },
  "26": { cls: "track",  color: "rgba(45,45,45,.1)", width: 1 },
  "27": { cls: "trunk",  color: "rgba(10,10,200,.35)", width: 2 },
  "28": { cls: "trunk_link",  color: "rgba(200,45,45,1)", width: 2 },
  "29": { cls: "unclassified", color: "rgba(200,55,55,.4)", width: 2 },
}

function streetrender (type, ctx) {
  ctx.shadowColor = "rgba(100,100,100,.7)";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.strokeStyle = streetstyle[type].color;
  ctx.lineWidth = streetstyle[type].width;
}

