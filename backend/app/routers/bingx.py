# --- import necessary modules --- #

from typing import Annotated
from app.services.bingx import (
    get_available_symbols,
    get_coin_daily_ohlc,
    get_user_balance,
    market_buy,
)

from app.database import SessionLocal
from fastapi import APIRouter, Depends, HTTPException, Query
from app.models import BotSetting
from sqlalchemy.orm import Session
from starlette import status

from .auth import get_current_user

# --- router requirement setup --- #

router = APIRouter(
    prefix="/bingx",
    tags=["bingx"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


# --- utility functions --- #


def bingx_exception_handler(code: int):
    match code:
        case 100202:
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Insufficient Balance of the Asset",
            )
        case 100400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Volume Lower than Min Sell Volume",
            )
        case 100414:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is Abnormal",
            )
        case 100500:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Bingx Server Error",
            )
        case 100503:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Bingx Server Busy",
            )


# --- router functions --- #


@router.get("/balance", status_code=status.HTTP_200_OK)
async def read_user_balance(
    user: user_dependency,
    db: db_dependency,
):
    bot_setting = (
        db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
    )
    if bot_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BotSetting Not Found",
        )
    
    if bot_setting.bingx_api_key is None or bot_setting.bingx_secret_key is None:
        raise HTTPException(
            status_code=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION,
            detail="API key or Secret key is null",
        )
    
    response = get_user_balance(
        bot_setting.bingx_api_key,
        bot_setting.bingx_secret_key,
    )
    if response["code"] == 0:
        return response["data"]["balances"]


@router.get("/available-symbols", status_code=status.HTTP_200_OK)
async def read_available_symbols(
    user: user_dependency,
    db: db_dependency,
):
    bot_setting = (
        db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
    )
    if bot_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BotSetting Not Found",
        )
    response = get_available_symbols(
        bot_setting.bingx_api_key,
        bot_setting.bingx_secret_key,
    )

    bingx_exception_handler(response["code"])

    if response["code"] == 0:
        return [
            coin
            for coin in response["data"]["symbols"]
            if coin["apiStateBuy"]
            and coin["apiStateSell"]
            and coin["symbol"].endswith("-USDT")
        ]


# @router.get("/open-orders", status_code=status.HTTP_200_OK)
# async def read_open_orders(
#     user: user_dependency,
#     db: db_dependency,
# ):
#     bot_setting = (
#         db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
#     )
#     if bot_setting is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="BotSetting Not Found",
#         )
#     response = get_open_orders(
#         bot_setting.bingx_api_key,
#         bot_setting.bingx_secret_key,
#     )
#     if response["code"] == 0:
#         return response["data"]["orders"]


# @router.get("/orders-history", status_code=status.HTTP_200_OK)
# async def read_orders_history(
#     user: user_dependency,
#     db: db_dependency,
# ):
#     bot_setting = (
#         db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
#     )
#     if bot_setting is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="BotSetting Not Found",
#         )
#     response = get_orders_history(
#         bot_setting.bingx_api_key,
#         bot_setting.bingx_secret_key,
#     )
#     if response["code"] == 0:
#         return response["data"]["orders"]


@router.get("/coin-ohlc", status_code=status.HTTP_200_OK)
async def read_coin_ohlc(
    user: user_dependency,
    db: db_dependency,
    ticker: str = Query(),
):
    bot_setting = (
        db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
    )
    if bot_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BotSetting Not Found",
        )
    response = get_coin_daily_ohlc(
        bot_setting.bingx_api_key,
        bot_setting.bingx_secret_key,
        ticker,
    )
    return {
        "open": response["data"][0][1],
        "high": response["data"][0][2],
        "low": response["data"][0][3],
        "close": response["data"][0][4],
    }
