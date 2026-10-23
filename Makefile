.PHONY: build-theme build-article build-book build-slides build-slides-demo deploy-theme deploy-article deploy-book check build-docs

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
	# Create the deploy dir
	mkdir -p .deploy
	rm -rf .deploy/$(THEME)
	# Clone the deployed theme; a theme without a deploy repository starts empty
	GIT_TERMINAL_PROMPT=0 git clone --depth 1 https://github.com/$(THEME_REPO_OWNER)/$(THEME)-theme .deploy/$(THEME) || mkdir .deploy/$(THEME)
	# FIXME: temporarily remove files from v1 theme.
	rm -rf .deploy/$(THEME)/build .deploy/$(THEME)/package-lock.json .deploy/$(THEME)/server.js
	cp -r themes/$(THEME)/.env.prod .deploy/$(THEME)/
	# Build server
	cd themes/$(THEME) && bun run build
	rm -rf .deploy/$(THEME)/public && cp -r themes/$(THEME)/public .deploy/$(THEME)/
	rm -rf .deploy/$(THEME)/server && cp -r themes/$(THEME)/build .deploy/$(THEME)/server/
	# Build renderer
	cd themes/$(THEME) && bun run "build:renderer"
	rm -rf .deploy/$(THEME)/renderer && cp -r themes/$(THEME)/build .deploy/$(THEME)/renderer/
	# Update metadata
	cp -r themes/$(THEME)/template.yml .deploy/$(THEME)/template.yml
	echo '{"type": "module"}' > .deploy/$(THEME)/package.json

build-article:
	make THEME=article build-theme

build-book:
	make THEME=book build-theme

build-slides:
	make THEME=slides build-theme

# The slides theme demo, served from a sub-folder of the docs site
SLIDES_DEMO_DIR = slides-demo

build-slides-demo:
	make build-slides
	cd themes/slides/demo && BASE_URL=$(BASE_URL)/$(SLIDES_DEMO_DIR) myst build --execute --html
	mkdir -p docs/_build/html
	rm -rf docs/_build/html/$(SLIDES_DEMO_DIR)
	cp -r themes/slides/demo/_build/html docs/_build/html/$(SLIDES_DEMO_DIR)

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
	make build-slides-demo
