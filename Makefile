.PHONY: build-theme build-article build-book deploy-theme deploy-article deploy-book check

COMMIT = $(shell git rev-parse --short HEAD)
# You may need to install jq for this to work!
VERSION = $(shell cat packages/site/package.json | jq -r '.version')

THEME_REPO_OWNER=myst-templates
THEME=article

check:
	@which jq > /dev/null || (echo "Error: the jq linux command is not available. Please install it first (brew install jq | apt-get install jq)." && exit 1)

build-theme-renderer:
	# Prepare the npm node_module cache
	bun install --frozen-lockfile
	rm -rf themes/$(THEME)/{public,build}
	cd themes/$(THEME) && bun run prod:build

build-theme-dist:
	mkdir .deploy || true
	rm -rf .deploy/$(THEME)
	git clone --depth 1 https://github.com/$(THEME_REPO_OWNER)/$(THEME)-theme .deploy/$(THEME)
	rm -rf .deploy/$(THEME)/{public,build,package.json,package-lock.json,bun.lock,template.yml,server.js}
	find template -type f  -exec cp {} .deploy/$(THEME) \;
	cp -r themes/$(THEME)/public .deploy/$(THEME)/public
	cp -r themes/$(THEME)/build .deploy/$(THEME)/build
	cp -r themes/$(THEME)/template.yml .deploy/$(THEME)/template.yml
	sed -i.bak "s/template/$(THEME)/g" .deploy/$(THEME)/package.json
	sed -i.bak "s/VERSION/$(VERSION)/g" .deploy/$(THEME)/package.json
	rm .deploy/$(THEME)/package.json.bak
	cd .deploy/$(THEME) && npm install
build-theme:
	$(MAKE) THEME=$(THEME) build-theme-renderer
	$(MAKE) THEME=$(THEME) build-theme-deploy

build-article:
	$(MAKE) THEME=article build-theme

build-book:
	$(MAKE) THEME=book build-theme

deploy-theme: check
	echo "Deploying $(THEME) theme to $(THEME_REPO_OWNER)/$(THEME)-theme"
	echo "Version: $(VERSION)"
	$(MAKE) THEME=$(THEME) build-theme
	cd .deploy/$(THEME) && git add .
	cd .deploy/$(THEME) && git commit -m "🚀 v$(VERSION) from $(COMMIT)"
	cd .deploy/$(THEME) && git push -u origin main

deploy-article:
	$(MAKE) THEME=article deploy-theme

deploy-book:
	$(MAKE) THEME=book deploy-theme

build-docs:
	$(MAKE) build-book
	cd docs && myst build -d --execute --html --strict
