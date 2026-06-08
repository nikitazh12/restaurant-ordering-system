import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.models import engine  # noqa: F401 - kept for tests that patch backend.main.engine
from backend.routers import auth, cart, favorites, menu, orders


def parse_cors_origins(value: str | None) -> list[str]:
    if not value:
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]

    return [origin.strip() for origin in value.split(",") if origin.strip()]


app = FastAPI(
    title="Restaurant Ordering System API",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(os.getenv("BACKEND_CORS_ORIGINS")),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
static_path = "backend/static"
if not os.path.exists(static_path):
    os.makedirs(os.path.join(static_path, "images"), exist_ok=True)

app.mount("/static", StaticFiles(directory=static_path), name="static")

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api", tags=["menu"])
app.include_router(orders.router, prefix="/api", tags=["orders"])
app.include_router(cart.router, prefix="/api", tags=["cart"])
app.include_router(favorites.router, prefix="/api", tags=["favorites"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Restaurant Ordering System API"}
