from fastapi import FastAPI

from app.api.health import router as health_router

from app.config.settings import settings

from app.api.music import router as music_router



app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0"
)

app.include_router(health_router)

app.include_router(music_router)

@app.get("/")
async def root():

    return {
        "service": settings.APP_NAME,
        "status": "running"
    }