db_restart: docker_down docker_up

db_init:
	pnpm db:push
	pnpm db:seed

docker_up:
	docker-compose up -d

docker_down:
	docker-compose down -v
