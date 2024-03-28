# --- import necessary modules --- #

from time import time
from typing import Annotated

import gevent
from app.celery_app import celery_app

from app.database import SessionLocal
from fastapi import APIRouter, Depends, HTTPException
from app.models import BotSetting, Position, User
from app.services.bingx import (
    get_coin_daily_ohlc,
    get_candlestick_data,
    market_buy,
    market_sell,
)
from sqlalchemy.orm import Session
from starlette import status

from .auth import get_current_user

# --- router requirement setup --- #

router = APIRouter(
    prefix="/trading-bot",
    tags=["trading-bot"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


# --- Trading Automation Logic --- #


# { <user_id:int>: { "coins_to_trade": list, "task": Task }
USERS_BOTS = {}


# async def run_trading_bot(
#     db: db_dependency,
#     user_id: int,
#     api_key: str,
#     secret_key: str,
#     strategy_chg_percentage: float,
#     default_margin: float,
#     sl_percentage: float,
#     tp_percentage: float,
#     coins_to_trade: list,
# ):
#     USERS_BOTS[user_id]["coins_to_trade"] = coins_to_trade
#     try:
#         while True:
#             iteration_start_time = int(time())

#             for ticker in USERS_BOTS[user_id]["coins_to_trade"]:

#                 daily_ohlc_res = get_coin_daily_ohlc(
#                     api_key=api_key,
#                     secret_key=secret_key,
#                     ticker=ticker,
#                 )
#                 if daily_ohlc_res["code"] != 0:
#                     continue

#                 candlestick_data_res = get_candlestick_data(
#                     api_key=api_key,
#                     secret_key=secret_key,
#                     ticker=ticker,
#                     timeframe="1h",  # ! change to 15m
#                     n="2",
#                 )
#                 if (
#                     candlestick_data_res["code"] != 0
#                     or len(candlestick_data_res["data"]) < 2
#                 ):
#                     continue

#                 daily_candle_open = daily_ohlc_res["data"][0][1]
#                 threshold = daily_candle_open + (
#                     (daily_candle_open * strategy_chg_percentage) / 100
#                 )

#                 latest_candle_close = candlestick_data_res["data"][0][4]
#                 second_latest_candle_close = candlestick_data_res["data"][1][4]

#                 print("ticker                    ", ticker)
#                 print("daily_candle_open         ", daily_candle_open)
#                 print("threshold                 ", threshold)
#                 print("latest_candle_close       ", latest_candle_close)
#                 print("second_latest_candle_close", second_latest_candle_close)
#                 print()

#                 # price crossover the threshold
#                 if (
#                     second_latest_candle_close < threshold
#                     and latest_candle_close > threshold
#                 ):
#                     print("market buy")
#                     print(ticker, default_margin)
#                     buy_res = market_buy(
#                         api_key,
#                         secret_key,
#                         ticker,
#                         default_margin,
#                     )
#                     print(buy_res)
#                     bingx_exception_handler(buy_res["code"])

#                     if buy_res["code"] != 0:
#                         continue

#                     position = Position(
#                         order_id=buy_res["data"]["order_id"],
#                         ticker=ticker,
#                         open_date_time=int(time()),
#                         open_price=buy_res["data"]["price"],
#                         margin=default_margin,
#                         volume=buy_res["data"]["executedQty"],
#                         owner_id=user_id,
#                     )
#                     db.add(position)
#                     db.commit()

#                     USERS_BOTS[user_id]["coins_to_trade"].remove(ticker)

#             print(
#                 len(USERS_BOTS[user_id]["coins_to_trade"]),
#                 USERS_BOTS[user_id]["coins_to_trade"],
#             )

#             iteration_end_time = int(time())

#             trading_frequency = 300  # in seconds

#             next_iteration_in = trading_frequency - (
#                 iteration_end_time - iteration_start_time
#             )

#             print("iteration time spent:", iteration_end_time - iteration_start_time)
#             print("next iteration in:   ", next_iteration_in)
#             await asyncio.sleep(
#                 trading_frequency - (iteration_end_time - iteration_start_time)
#             )
#     except asyncio.CancelledError:
#         # todo: cleanup
#         raise


@celery_app.task(name="run_trading_bot")
def run_trading_bot(
    user_id: int,
    api_key: str,
    secret_key: str,
    strategy_chg_percentage: float,
    default_margin: float,
    sl_percentage: float,
    tp_percentage: float,
    coins_to_trade: list,
):
    try:
        db = SessionLocal()

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            return f"User for user_id {user_id} Not Found"
        bot_setting = (
            db.query(BotSetting).filter(BotSetting.owner_id == user_id).first()
        )
        if bot_setting is None:
            raise f"BotSetting for user_id {user_id} Not Found"

        if user.capital_usdt is not None and bot_setting.default_margin is not None:
            if (
                user.capital_usdt < bot_setting.default_margin
                or user.capital_usdt < 7.5
            ):
                return False

        while True:

            db.refresh(bot_setting)

            bot_setting = (
                db.query(BotSetting).filter(BotSetting.owner_id == user_id).first()
            )
            if bot_setting is None or bot_setting.is_bot_active == False:
                return False

            iteration_start_time = int(time())

            # Check for current open positions take profit or stop loss
            all_open_positions = (
                db.query(Position)
                .filter(Position.owner_id == user_id)
                .filter(Position.close_date_time == None)
                .all()
            )

            for position in all_open_positions:
                daily_ohlc_res = get_coin_daily_ohlc(
                    api_key=api_key,
                    secret_key=secret_key,
                    ticker=position.ticker,
                )
                if daily_ohlc_res["code"] != 0:
                    continue

                current_price = daily_ohlc_res["data"][0][4]
                position_chg_percentage = (
                    (current_price - position.open_price) / position.open_price * 100
                )
                if (
                    position_chg_percentage <= sl_percentage
                    or position_chg_percentage >= tp_percentage
                ):
                    response = market_sell(
                        api_key=bot_setting.bingx_api_key,
                        secret_key=bot_setting.bingx_secret_key,
                        ticker=position.ticker,
                        volume=position.volume,
                    )

                    if response["code"] == 0:
                        open_price = position.open_price
                        close_price = float(response["data"]["price"])
                        position_pnl_percentage = (
                            (close_price - open_price) / open_price * 100
                        )
                        position.close_price = close_price
                        position.close_date_time = int(time())
                        position.position_pnl_percentage = position_pnl_percentage
                        final_margin_before_fee = position.margin + (
                            position.margin * (position_pnl_percentage / 100)
                        )
                        position.final_margin = final_margin_before_fee - (
                            final_margin_before_fee * 0.001
                        )

                        db.commit()

            # Open new positions

            for ticker in coins_to_trade:

                daily_ohlc_res = get_coin_daily_ohlc(
                    api_key=api_key,
                    secret_key=secret_key,
                    ticker=ticker,
                )
                if daily_ohlc_res["code"] != 0:
                    continue

                candlestick_data_res = get_candlestick_data(
                    api_key=api_key,
                    secret_key=secret_key,
                    ticker=ticker,
                    timeframe="15m",
                    n="2",
                )
                if (
                    candlestick_data_res["code"] != 0
                    or len(candlestick_data_res["data"]) < 2
                ):
                    continue

                daily_candle_open = daily_ohlc_res["data"][0][1]
                threshold = daily_candle_open + (
                    (daily_candle_open * strategy_chg_percentage) / 100
                )

                latest_candle_close = candlestick_data_res["data"][0][4]
                second_latest_candle_close = candlestick_data_res["data"][1][4]

                # print("ticker                    ", ticker)
                # print("daily_candle_open         ", daily_candle_open)
                # print("threshold                 ", threshold)
                # print("latest_candle_close       ", latest_candle_close)
                # print("second_latest_candle_close", second_latest_candle_close)
                # print()

                # Price crossover the threshold
                if (
                    second_latest_candle_close < threshold
                    and latest_candle_close > threshold
                ):
                    # print("market buy")
                    # print(ticker, default_margin)
                    buy_res = market_buy(
                        api_key,
                        secret_key,
                        ticker,
                        default_margin,
                    )
                    # print(buy_res)

                    if buy_res["code"] == 0:
                        open_price = float(buy_res["data"]["price"])
                        margin = default_margin - (default_margin * 0.002)
                        volume = margin / open_price

                        position = Position(
                            order_id=str(buy_res["data"]["orderId"]),
                            ticker=ticker,
                            open_date_time=int(time()),
                            open_price=open_price,
                            margin=margin,
                            volume=volume,
                            owner_id=user_id,
                        )
                        db.add(position)
                        db.commit()

            iteration_end_time = int(time())

            trading_freq_mins = 10  # in minutes

            next_iteration_in = (trading_freq_mins * 60) - (
                iteration_end_time - iteration_start_time
            )

            print("iteration time spent:", iteration_end_time - iteration_start_time)
            print("next iteration in:   ", next_iteration_in)

            gevent.sleep(next_iteration_in)
    finally:
        db.close()


# --- router functions --- #


@router.patch("/activate", status_code=status.HTTP_200_OK)
async def activate_bot(
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
    bot_setting.is_bot_active = True
    db.commit()

    coins_to_trade = bot_setting.coins_to_trade.split("|")
    USERS_BOTS[bot_setting.owner_id] = {"coins_to_trade": None, "task": None}
    USERS_BOTS[bot_setting.owner_id]["coins_to_trade"] = coins_to_trade

    celery_app.send_task(
        "run_trading_bot",
        args=[
            bot_setting.owner_id,
            bot_setting.bingx_api_key,
            bot_setting.bingx_secret_key,
            bot_setting.strategy_chg_percentage,
            bot_setting.default_margin,
            bot_setting.sl_percentage,
            bot_setting.tp_percentage,
            coins_to_trade,
        ],
    )


@router.patch("/deactivate", status_code=status.HTTP_200_OK)
async def deactivate_bot(
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
    bot_setting.is_bot_active = False
    db.commit()


@router.post("/sell-position")
async def sell_open_position(
    user: user_dependency,
    db: db_dependency,
    order_id: str,
):
    position = db.query(Position).filter(Position.order_id == order_id).first()
    if position is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Position Not Found",
        )
    bot_setting = db.query(BotSetting).filter(BotSetting.id == user.get("id")).first()
    if bot_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BotSetting Not Found",
        )
    response = market_sell(
        api_key=bot_setting.bingx_api_key,
        secret_key=bot_setting.bingx_secret_key,
        ticker=position.ticker,
        volume=position.volume,
    )
    print(response)

    if response["code"] != 0:
        return False

    open_price = position.open_price
    close_price = float(response["data"]["price"])
    position_pnl_percentage = (close_price - open_price) / open_price * 100
    position.close_price = close_price
    position.close_date_time = int(time())
    position.position_pnl_percentage = position_pnl_percentage
    final_margin_before_fee = position.margin + (
        position.margin * (position_pnl_percentage / 100)
    )
    position.final_margin = final_margin_before_fee - (final_margin_before_fee * 0.001)

    db.commit()
