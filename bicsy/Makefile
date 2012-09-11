JS_COMPILER = \
	./lib/uglifyjs/bin/uglifyjs

all: \
	bicsymaps.js \
	bicsymaps.min.js

.INTERMEDIATE bicsymaps.js: \
	src/start.js \
	src/index.js \
	src/osmstyle.js \
	src/geombuf.js \
	src/cache.js \
	src/image.js \
	src/queue.js \
	src/url.js \
	src/view.js \
	src/end.js

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

bicsymaps.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) > $@
#	@chmod a-w $@

clean:
	rm -f bicsymaps*.js
