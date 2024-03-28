# --- import necessary modules --- #

from datetime import timedelta
from os import getenv
import re
from time import time
from typing import Annotated

import requests
from app.database import SessionLocal
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.models import BotSetting, User
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status

# --- router requirement setup --- #

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

load_dotenv()

ALGORITHM = "HS256"
JWT_SECRET_KEY = getenv("JWT_SECRET_KEY")
OTP_EXPIRATION = int(timedelta(minutes=1).total_seconds())
ACCESS_TOKEN_EXPIRATION = int(timedelta(days=3).total_seconds())
REFRESH_TOKEN_EXPIRATION = int(timedelta(days=30).total_seconds())
MELIPAYAMAK_API_KEY = getenv("MELIPAYAMAK_API_KEY")


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# --- private functions --- #


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


oauth2_scheme = HTTPBearer(scheme_name="accessToken")


def get_current_user(token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
    try:
        token = token.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=ALGORITHM)
        phone_number: str = payload.get("sub")
        user_id: int = payload.get("id")
        exp: int = payload.get("exp")
        if phone_number is None or user_id is None or exp < int(time()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization Failed",
            )
        return {
            "phone_number": phone_number,
            "id": user_id,
            "exp": exp,
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization Failed",
        )


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


async def otp_validation(
    db: db_dependency,
    phone_number: str,
    otp: str,
):
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        return status.HTTP_404_NOT_FOUND
    if user.last_otp_expiration < int(time()):
        return status.HTTP_410_GONE
    if user.last_otp_code != otp:
        return status.HTTP_401_UNAUTHORIZED
    return user


async def create_jwt_token(
    data: dict,
    expires_delta: int,
):
    expires = int(time()) + expires_delta
    data.update({"exp": expires})
    return jwt.encode(data, JWT_SECRET_KEY, algorithm=ALGORITHM)


# --- router functions --- #


@router.post("/otp/generate", status_code=status.HTTP_201_CREATED)
async def generate_otp(
    db: db_dependency,
    phone_number: str,
):
    if not re.match("^09\d{9}$", phone_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone_number",
        )
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        user = User(phone_number=phone_number)
        db.add(user)
        db.commit()

    response = requests.post(
        f"https://console.melipayamak.com/api/send/otp/{MELIPAYAMAK_API_KEY}",
        json={"to": phone_number},
    )

    res = response.json()
    if res["status"] == "ارسال موفق بود":
        user.last_otp_code = res["code"]
        user.last_otp_expiration = int(time()) + OTP_EXPIRATION
        db.add(user)
        db.commit()
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Error in OTP Generation",
        )


@router.post("/otp/validate", response_model=Token, status_code=status.HTTP_200_OK)
async def validate_otp(
    db: db_dependency,
    phone_number: str,
    otp: str,
):
    if not re.match("^09\d{9}$", phone_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone_number",
        )
    if not re.match("^\d{6}$", otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid otp",
        )
    user = await otp_validation(db, phone_number, otp)
    if user == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Not Found",
        )
    if user == status.HTTP_410_GONE:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="OTP Expired",
        )
    if user == status.HTTP_401_UNAUTHORIZED:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong OTP",
        )
        
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User Not Found",)
    bot_setting = db.query(BotSetting).filter(BotSetting.owner_id == user.id).first()
    if bot_setting is None:
        bot_setting = BotSetting(owner_id=user.id)
        db.add(bot_setting)
        db.commit()
    
    access_token = await create_jwt_token(
        data={"sub": user.phone_number, "id": user.id},
        expires_delta=ACCESS_TOKEN_EXPIRATION,
    )
    refresh_token = await create_jwt_token(
        data={"sub": user.phone_number, "id": user.id},
        expires_delta=REFRESH_TOKEN_EXPIRATION,
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/jwt/refresh", status_code=status.HTTP_200_OK)
async def generate_access_from_refresh(
    user: user_dependency,
    db: db_dependency,
):
    user = db.query(User).filter(User.phone_number == user.get("phone_number")).first()
    if not user:
        return {"is_valid": False}
    new_access_token = await create_jwt_token(
        data={"sub": user.phone_number, "id": user.id},
        expires_delta=ACCESS_TOKEN_EXPIRATION,
    )
    return {"is_valid": True, "new_access_token": new_access_token}


@router.post("/jwt/validate", status_code=status.HTTP_200_OK)
async def validate_jwt(
    user: user_dependency,
    db: db_dependency,
):
    user = db.query(User).filter(User.phone_number == user.get("phone_number")).first()
    if not user:
        return {"is_valid": False}

    return {"is_valid": True}
