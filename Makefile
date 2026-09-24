.PHONY: build-theme build-article build-book deploy-theme deploy-article deploy-book check

COMMIT = $(shell git rev-parse --short HEAD)
# You may need to install jq for this to work!
VERSION = $(shell cat packages/site/package.json | jq -r '.version')

THEME_REPO_OWNER=myst-templates
THEME=article

check:
	@which jq > /dev/null || (echo "Error: the jq linux command is not available. Please install it first (brew install jq | apt-get install jq)." && exit 1)

build-theme:
	# Prepare the npm node_module cache
	bun install --frozen-lockfile

	mkdir .deploy || true
	rm -rf .deploy/$(THEME)
	git clone --depth 1 https://github.com/$(THEME_REPO_OWNER)/$(THEME)-theme .deploy/$(THEME)
	rm -rf .deploy/$(THEME)/{public,build,package.json,package-lock.json,bun.lock,template.yml,server.js}
	cp -r themes/$(THEME)/{public,.env.prod} .deploy/$(THEME)/
	cd themes/$(THEME) && bun run build
	cp -r themes/$(THEME)/build .deploy/$(THEME)/server/
	cd themes/$(THEME) && bun run "build:renderer"
	cp -r themes/$(THEME)/build .deploy/$(THEME)/renderer/
	cp -r themes/$(THEME)/template.yml .deploy/$(THEME)/template.yml

build-article:
	make THEME=article build-theme

build-book:
	make THEME=book build-theme

deploy-theme: check
	echo "Deploying $(THEME) theme to $(THEME_REPO_OWNER)/$(THEME)-theme"
	echo "Version: $(VERSION)"
	make THEME=$(THEME) build-theme
	cd .deploy/$(THEME) && git add .
	cd .deploy/$(THEME) && git commit -m "🚀 v$(VERSION) from $(COMMIT)"
	cd .deploy/$(THEME) && git push -u origin main

deploy-article:
	make THEME=article deploy-theme

deploy-book:
	make THEME=book deploy-theme

build-docs:
	make build-book
	cd docs && myst build -d --execute --html --strict
