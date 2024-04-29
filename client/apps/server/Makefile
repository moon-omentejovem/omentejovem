.SHELL:=/bin/bash
ROOT_DIR:=$(shell dirname $(shell pwd))

.PHONY: up
up: ## Start the app in docker
	cd docker && docker compose up

.PHONY: down
down: ## Destroy database docker image
	cd docker && docker compose down

.PHONY: help
help: ## Print the targets and their descriptions
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
