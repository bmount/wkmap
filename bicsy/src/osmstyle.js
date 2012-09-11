
var streetstyle = {
  "0": { cls: "residential", color: "rgba(215,215,215,.7)", width: .5 }, // very very frequent **
  "1": { cls: "bridleway",  color: "rgba(200,45,45,.8)", width: 2 },
  "2": { cls: "construction", color: "rgba(200,45,45,.8)", width: 2 },
  "3": { cls: "crossing", color: "rgba(200,45,45,.8)", width: .1 },
  "4": { cls: "cycleway", color: "rgba(25,150,25,.6)", width: 1.5 },
  "5": { cls: "footway", color: "rgba(20,100,20,.8)", width: 1.5 },
  "6": { cls: "footway_unconstructed", color: "rgba(200,45,45,.8)", width: 2 },
  "7": { cls: "living_street", color: "rgba(200,45,45,.8)", width: .2 },
  "8": { cls: "motorway", color: "rgba(200,45,45,.8)", width: 3 }, // frequent **
  "9": { cls: "motorway_link", color: "rgba(200,45,45,.8)", width: 3 }, // frequent **
  "10": { cls: "path", color: "rgba(45,45,200,.8)", width: 4 },
  "11": { cls: "pedestrian", color: "rgba(200,45,45,.8)", width: .5 },
  "12": { cls: "platform", color: "rgba(200,45,45,.8)", width: .2 },
  "13": { cls: "primary", color: "rgba(200,45,45,.8)", width: 7 },
  "14": { cls: "primary_link",  color: "rgba(200,45,45,.8)", width: 3 },
  "15": { cls: "proposed",  color: "rgba(200,45,45,.8)", width: 2 },
  "16": { cls: "raceway",  color: "rgba(200,45,45,.8)", width: 2 },
  "17": { cls: "abandoned",  color: "rgba(200,45,45,.8)", width: 2 },
  "18": { cls: "road",  color: "rgba(200,200,45,.8)", width: 5 }, // frequent **
  "19": { cls: "secondary",  color: "rgba(150,200,45,.8)", width: 6 }, // frequent **
  "20": { cls: "secondary_link",  color: "rgba(200,45,45,.8)", width: 2 }, // frequent **
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
