install:
	npm install

reinstall:
	npm install ic

up:
	docker-compose -f docker-compose-prod.yml up

up-dev:
	docker-compose -f docker-compose-dev.yml up

up-test:
	npm run-script start.test

# up:
# 	npm run-script start.prod
#
# dev-up:
# 	npm run-script start.dev

.PHONY: prettier-check
prettier-check:
	npx prettier --check "*.js"

.PHONY: prettier
prettier:
	npx prettier --write "*.js"
