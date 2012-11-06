SOURCES ?= ../js/playlists.js ../js/cloudlist.js
DOCS_TEMPLATE ?= template.html
DOCS ?= DOCS.html

all: $(DOCS)

$(DOCS): $(SOURCES) $(DOCS_TEMPLATE)
	cat $(SOURCES) | doctor.js | docgenerator.js $(DOCS_TEMPLATE) > $@

clean:
	rm -rf $(DOCS)

.PHONY: all clean
