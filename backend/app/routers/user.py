# --- import necessary modules --- #

from typing import Annotated

from app.database import SessionLocal
from fastapi import APIRouter, Depends, HTTPException
from app.models import User
from sqlalchemy.orm import Session
from starlette import status

from .auth import get_current_user

# --- router requirement setup --- #

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


# --- router functions --- #


@router.get("/capital-usdt", status_code=status.HTTP_200_OK)
async def read_capital_usdt(
    user: user_dependency,
    db: db_dependency,
):
    user = db.query(User).filter(User.id == user.get("id")).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Not Found",
        )

    return {"capital_usdt": user.capital_usdt}


@router.patch("/capital-usdt", status_code=status.HTTP_200_OK)
async def set_capital_usdt(
    user: user_dependency,
    db: db_dependency,
    capital_usdt: float,
):
    user = db.query(User).filter(User.id == user.get("id")).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Not Found",
        )
    user.capital_usdt = capital_usdt
    db.commit()
