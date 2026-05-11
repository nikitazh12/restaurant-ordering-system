import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.models import engine, Base, SessionLocal
from backend.routers import auth, menu, orders

app = FastAPI(title="Restaurant Ordering System API")

# Mount static files for images
static_path = "backend/static"
if not os.path.exists(static_path):
    os.makedirs(os.path.join(static_path, "images"), exist_ok=True)

app.mount("/static", StaticFiles(directory=static_path), name="static")

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api", tags=["menu"])
app.include_router(orders.router, prefix="/api", tags=["orders"])

@app.on_event("startup")
def startup():
    # Automatically create tables if they don't exist
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to Restaurant Ordering System API"}
