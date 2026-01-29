APP_NAME := all-in-one-frontend
TAG := latest
IMAGE := $(APP_NAME):$(TAG)
PORT := 8080

.PHONY: build run stop clean logs dev install lint format type-check

# -------- Docker --------

build:
	docker build -t $(IMAGE) .

run: build
	docker run -d --name $(APP_NAME) -p $(PORT):80 $(IMAGE)

stop:
	docker stop $(APP_NAME) && docker rm $(APP_NAME)

logs:
	docker logs -f $(APP_NAME)

clean:
	docker rmi $(IMAGE)

# -------- Local dev --------

install:
	pnpm install

dev:
	pnpm dev

lint:
	pnpm lint

format:
	pnpm format

type-check:
	pnpm type-check
