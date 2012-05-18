node and python small servers here that provide all the Z/X/Y
TMS stuff and some tiled Postgres/PostGIS queries based on 
code published by Vizzuality for CartoDB. They also do something 
smart with caching that has to be worked into this before it's usable 
without a pre-rendering step (like the couchdb pseudo-caching in the 
next dir over.)

Primary development on server stuff will be in repo bvmou/canvasback,
and hopefully a small node thing here where caching is thought
through from the beginning.
