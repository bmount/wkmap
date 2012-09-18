var hosts = {},
    hostRe = /^(?:([^:\/?\#]+):)?(?:\/\/([^\/?\#]*))?([^?\#]*)(?:\?([^\#]*))?(?:\#(.*))?/,
    maxActive = 36, // per host
    maxAttempts = 24; // per uri

function bicsymaps_queue(uri, callback) {
  var hostname = (hostRe.lastIndex = 0, hostRe).exec(uri)[2] || "";

  // Retrieve the host-specific queue.
  var host = hosts[hostname] || (hosts[hostname] = {
    active: 0,
    queued: []
  });

  // Process the host's queue, perhaps immediately starting our request.
  load.attempt = 0;
  host.queued.push(load);
  process(host);

  // Issue the HTTP request.
  function load() {
    var buf = new XMLHttpRequest();
    buf.open("GET", uri, true);
    buf.responseType = 'arraybuffer'
    //buf.onload = end
    buf.onreadystatechange = function () {
      if (buf.readyState === 4) {
        if (buf.status === 200) {
          var gcan = document.createElement("canvas");
          gcan.height = 255;
          gcan.width = 255;
          if (buf.response === null) {
            //end();
            return;
          } else {
            var gsrc = uncollect(buf.response, gcan).toDataURL();
            var image = new Image();
            image.src = gsrc;
            callback(image);
            end();
          }
        }
      }
    }
    buf.onerror = error;
    buf.send(null)
  }

  // Handle the HTTP response.
  // Hooray, callback our available data!
  function end() {
    host.active--;
    //callback(this);
    process(host);
  }

  // Boo, an error occurred. We should retry, maybe.
  function error(error) {
    host.active--;
    if (++load.attempt < maxAttempts) {
      host.queued.push(load);
    } else {
      callback(null);
    }
    process(host);
  }
};

function process(host) {
  if (host.active >= maxActive || !host.queued.length) return;
  host.active++;
  host.queued.pop()();
}
