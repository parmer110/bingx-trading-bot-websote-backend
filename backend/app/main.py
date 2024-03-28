import app.models as models
from app.database import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, bingx, botsetting, position, tradingbot, user

origins = [
    "http://185.221.237.65",
    "https://185.221.237.65",
    "http://almastalayi.ir",
    "https://almastalayi.ir",
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:8000",
]

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(position.router, prefix="/api")
app.include_router(botsetting.router, prefix="/api")
app.include_router(tradingbot.router, prefix="/api")
app.include_router(bingx.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
