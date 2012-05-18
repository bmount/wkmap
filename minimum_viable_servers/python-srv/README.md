Minimal flask server. Copy your modified `wkbmap.js` to static and maybe start
out with some variants of the init.html file (which loads a DataView polyfill
for Firefox support by default that you can comment out if working locally on
recent WebKit or Opera.) A good way to run:

`gunicorn -w 4 -b 127.0.0.1:4000 wkmap_server:app`

or uncomment the `app.run()` line at the end and use flask dev server
