install:
	cd app/; npm install

reinstall:
	cd app/; npm install ic

up:
	docker-compose -f docker-compose-prod.yml up

up-dev:
	docker-compose -f docker-compose-dev.yml up

# up-test:
# 	cd app/; npm run-script start.test

tag:
	npm version patch app/package.json

# push:
# 	git push origin [tag]

.PHONY: prettier-check
prettier-check:
	cd app/; npx prettier --check "*.js"

.PHONY: prettier
prettier:
	cd app/; npx prettier --write "*.js"
