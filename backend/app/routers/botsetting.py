# --- import necessary modules --- #

import asyncio
from typing import Annotated

from app.database import SessionLocal
from fastapi import APIRouter, Depends, HTTPException
from app.models import BotSetting
from pydantic import BaseModel, Field
from app.services.bingx import get_user_balance
from sqlalchemy.orm import Session
from starlette import status

from .auth import get_current_user

# --- router requirement setup --- #

router = APIRouter(
    prefix="/bot-setting",
    tags=["bot-setting"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


class BotSettingRequest(BaseModel):
    bingx_api_key: str
    bingx_secret_key: str
    strategy_chg_percentage: float
    default_margin: float = Field(gt=0)
    sl_percentage: float = Field(gt=0)
    tp_percentage: float = Field(gt=0)
    coins_to_trade: str


def check_keys_validity(api_key: str, secret_key: str) -> dict[bool, dict[bool, bool]]:
    if not api_key or not secret_key:
        return {"is_valid": False, "detail": {"api_key": False, "secret_key": False}}

    response = get_user_balance(api_key, secret_key)

    if response["code"] == 100413:
        return {"is_valid": False, "detail": {"api_key": False, "secret_key": False}}

    if response["code"] == 100001:
        return {"is_valid": False, "detail": {"api_key": True, "secret_key": False}}

    return {"is_valid": True, "detail": {"api_key": True, "secret_key": True}}


# --- router functions --- #


@router.get("/is-keys-valid", status_code=status.HTTP_200_OK)
async def check_is_keys_valid(
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
    validity_check = check_keys_validity(
        bot_setting.bingx_api_key,
        bot_setting.bingx_secret_key,
    )
    if not validity_check["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail=validity_check["detail"],
        )
    return validity_check


@router.get("", status_code=status.HTTP_200_OK)
async def read_bot_setting(
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
    return bot_setting


@router.put("", status_code=status.HTTP_204_NO_CONTENT)
async def update_bot_setting(
    user: user_dependency,
    db: db_dependency,
    bot_setting_request: BotSettingRequest,
):
    validity_check = check_keys_validity(
        bot_setting_request.bingx_api_key,
        bot_setting_request.bingx_secret_key,
    )
    if not validity_check["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail=validity_check["detail"],
        )
    bot_setting = (
        db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
    )
    if bot_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BotSetting Not Found",
        )
    update_data = bot_setting_request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(bot_setting, key, value)

    db.commit()


# @router.patch("/coins-to-trade", status_code=status.HTTP_200_OK)
# async def update_coins_to_trade(
#     user: user_dependency,
#     db: db_dependency,
#     coins_to_trade: str,  # "BTC-USDT|ETH-USDT|..."
# ):
#     bot_setting = (
#         db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
#     )
#     if bot_setting is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="BotSetting Not Found",
#         )
#     bot_setting.coins_to_trade = coins_to_trade
#     db.commit()


# @router.delete("", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_bot_setting(
#     user: user_dependency,
#     db: db_dependency,
# ):
#     bot_setting = (
#         db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).first()
#     )
#     if bot_setting is None:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             details="BotSetting Not Found",
#         )
#     db.query(BotSetting).filter(BotSetting.owner_id == user.get("id")).delete()
#     db.commit()
