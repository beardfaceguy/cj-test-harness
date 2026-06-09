from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import db, lifespan
from app.routers import auth, projects, tasks, users

app = FastAPI(title="Task Tracker API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)


@app.get("/healthz")
async def health():
    try:
        await db.user.count()
        return {"status": "ok", "db": "ok"}
    except Exception:
        return {"status": "ok", "db": "unavailable"}
