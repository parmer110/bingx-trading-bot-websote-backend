# --- import necessary modules --- #

from typing import Annotated

from app.database import SessionLocal
from fastapi import APIRouter, Depends
from app.models import Position
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status

from .auth import get_current_user

# --- router requirement setup --- #

router = APIRouter(
    prefix="/position",
    tags=["position"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


class CreatePositionRequest(BaseModel):
    order_id: int
    ticker: str
    open_date_time: int
    open_price: float
    margin: float
    volume: float


class ClosePositionRequest(BaseModel):
    close_date_time: int
    close_price: float


# --- router functions --- #


@router.get("/all", status_code=status.HTTP_200_OK)
async def read_all_positions(
    user: user_dependency,
    db: db_dependency,
):
    return db.query(Position).filter(Position.owner_id == user.get("id")).all()


@router.get("/all/open", status_code=status.HTTP_200_OK)
async def read_all_open_positions(
    user: user_dependency,
    db: db_dependency,
):
    return (
        db.query(Position)
        .filter(Position.owner_id == user.get("id"))
        .filter(Position.close_date_time == None)
        .all()
    )


@router.get("/all/close", status_code=status.HTTP_200_OK)
async def read_all_close_positions(
    user: user_dependency,
    db: db_dependency,
):
    return (
        db.query(Position)
        .filter(Position.owner_id == user.get("id"))
        .filter(Position.close_date_time != None)
        .all()
    )
