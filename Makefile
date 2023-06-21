.PHONY: build-theme build-article build-book deploy-theme deploy-article deploy-book check

COMMIT = $(shell git rev-parse --short HEAD)
# You may need to install jq for this to work!
VERSION = $(shell cat packages/site/package.json | jq -r '.version')

THEME=article

check:
	@which jq > /dev/null || (echo "Error: the jq linux command is not available. Please install it first (brew install jq | apt-get install jq)." && exit 1)

build-theme:
	mkdir .deploy || true
	rm -rf .deploy/$(THEME)
	git clone --depth 1 https://github.com/myst-templates/$(THEME)-theme .deploy/$(THEME)
	rm -rf .deploy/$(THEME)/public .deploy/$(THEME)/build .deploy/$(THEME)/package.json .deploy/$(THEME)/package-lock.json .deploy/$(THEME)/template.yml .deploy/$(THEME)/server.js
	find template -type f  -exec cp {} .deploy/$(THEME) \;
	cd themes/$(THEME) && npm run prod:build
	cp -r themes/$(THEME)/public .deploy/$(THEME)/public
	cp -r themes/$(THEME)/build .deploy/$(THEME)/build
	cp -r themes/$(THEME)/template.yml .deploy/$(THEME)/template.yml
	sed -i.bak "s/template/$(THEME)/g" .deploy/$(THEME)/package.json
	sed -i.bak "s/VERSION/$(VERSION)/g" .deploy/$(THEME)/package.json
	rm .deploy/$(THEME)/package.json.bak
	cd .deploy/$(THEME) && npm install

build-article:
	make THEME=article build-theme

build-book:
	make THEME=book build-theme

deploy-theme: check
	echo "Deploying $(THEME) theme to myst-templates/$(THEME)-theme"
	echo "Version: $(VERSION)"
	make THEME=$(THEME) build-theme
	cd .deploy/$(THEME) && git add .
	cd .deploy/$(THEME) && git commit -m "🚀 v$(VERSION) from $(COMMIT)"
	cd .deploy/$(THEME) && git push -u origin main

deploy-article:
	make THEME=article deploy-theme

deploy-book:
	make THEME=book deploy-theme
