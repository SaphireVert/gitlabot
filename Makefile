install:
	npm install

reinstall:
	npm install ic

up:
	docker-compose -f docker-compose-prod.yml up

up-dev:
	docker-compose -f docker-compose-dev.yml up
# up:
# 	npm run-script start.prod
#
# dev-up:
# 	npm run-script start.dev
