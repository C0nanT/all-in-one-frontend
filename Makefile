
.PHONY: logs up lint format type-check

# -------- Docker --------

up:
	docker compose up -d app-dev

logs:
	docker compose logs -f app-dev

# -------- Scripts --------

lint:
	pnpm lint

format:
	pnpm format

type-check:
	pnpm type-check
