
#==============================================================================#
#
# Centralized build system for "emscripten".
#
# Copyright (c) 2020 Zack Lee (cuinjune@gmail.com)
# Copyright (c) 2020 Purr Data team
#
# See https://git.purrdata.net/jwilkes/purr-data for documentation
#
#==============================================================================#

CWD := $(shell pwd)
PURR_DIR = $(CWD)/..
EM_PATH = $(PURR_DIR)/emscripten
LIBPD_PATH = $(PURR_DIR)/libpd
PD_PATH = $(PURR_DIR)/pd
BUILD_PATH = $(EM_PATH)/build
INSTALL_PATH = $(EM_PATH)/project/purr-data
DESTDIR = $(BUILD_PATH)/purr-data/
objectsdir = extra/
WARN_FLAGS = -Wall -W -Wno-unused-parameter
EM_FLAGS = -s SIDE_MODULE=1 -O3
CFLAGS = -DPD -I$(PD_PATH)/src $(WARN_FLAGS) $(EM_FLAGS)
LDFLAGS = $(EM_FLAGS)
LIBS = 
CC = emcc
CXX = $(CC)
CXXFLAGS = $(CFLAGS)
EXTENSION = wasm
STRIP = echo

.PHONY: all libpd externals extra $(extras) abstractions doc build project clean

all: libpd externals extra abstractions doc build project

libpd: $(LIBPD_PATH)
	cd $< && mkdir -p build && cd build && emcmake cmake .. -DPD_UTILS:BOOL=OFF -DCMAKE_BUILD_TYPE=Release && emmake make

externals: $(PURR_DIR)/externals
	make -C $< EMSCRIPTEN="yes" WARN_FLAGS="$(WARN_FLAGS)" CFLAGS="$(CFLAGS)" LDFLAGS="$(LDFLAGS)" LIBS="$(LIBS)" CC="$(CC)" CXX="$(CXX)" CXXFLAGS="$(CXXFLAGS)" EXTENSION="$(EXTENSION)" STRIP="$(STRIP)"
	mkdir -p $(DESTDIR)/$(objectsdir)
	make -C $< EMSCRIPTEN="yes" DESTDIR="$(DESTDIR)" EXTENSION="$(EXTENSION)" STRIP="$(STRIP)" objectsdir="$(objectsdir)" install

extras = bob~ bonk~ choice fiddle~ loop~ lrshift~ pique sigmund~ stdout
extra: $(extras)
	cp -rf $(PD_PATH)/extra/*.pd $(DESTDIR)/$(objectsdir)

$(extras): %: $(PD_PATH)/extra
	$(CC) $(CFLAGS) -o $</$@/$@.$(EXTENSION) $</$@/$@.c
	mkdir -p $(DESTDIR)/$(objectsdir)
	cp -r $</$@ $(DESTDIR)/$(objectsdir)
	find $(DESTDIR)/$(objectsdir)/$@ -type f ! -name '*.pd' -and ! -name '*.wasm' -delete

abstractions: $(PURR_DIR)/abstractions
	mkdir -p $(DESTDIR)/$(objectsdir)
	make -C $< DESTDIR="$(DESTDIR)" objectsdir="$(objectsdir)" install

doc: $(PD_PATH)/doc
	mkdir -p $(DESTDIR)/doc/
	cp -rf $</* $(DESTDIR)/doc/

build: $(BUILD_PATH)
	rm -rf $(DESTDIR)/lib/
	make -C $<

project: $(INSTALL_PATH)
	cp -rf $(PD_PATH)/nw/dialog_*.html $</components/dialogs/
	cp -rf $(PD_PATH)/nw/css/*.css $</css/
	cd $< && npm install && npm run build && npm start
	
clean:
	find $(PURR_DIR)/externals -name "*.wasm" -type f -delete
	find $(PD_PATH)/extra -name "*.wasm" -type f -delete
	make -C $(LIBPD_PATH) clean
	make -C $(BUILD_PATH) clean
	rm -rf $(DESTDIR)
	

