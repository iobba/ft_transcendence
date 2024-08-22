all: build

build:
	docker compose up --build -d

stop:
	docker compose stop

clean:
	docker compose down -t 3

fclean:
	docker compose down -v --rmi all -t 3
