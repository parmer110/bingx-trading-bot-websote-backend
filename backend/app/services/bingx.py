# --- import necessary modules --- #

import hmac
import time
from hashlib import sha256
from os import getenv

import requests
from dotenv import load_dotenv

# --- import API_KEY and SECRET_KEY --- #

load_dotenv()

API_KEY = getenv("BINGX_API_KEY")
SECRET_KEY = getenv("BINGX_SECRET_KEY")


# --- private functions --- #


def __get_signature(api_secret, paramsStr):
    signature = hmac.new(
        api_secret.encode("utf-8"),
        paramsStr.encode("utf-8"),
        digestmod=sha256,
    ).hexdigest()
    return signature


def __send_request(method, path, paramsStr, api_key, secret_key):
    headers = {
        "X-BX-APIKEY": api_key,
    }
    try:
        url = "%s%s?%s&signature=%s" % (
            "https://open-api.bingx.com",
            path,
            paramsStr,
            __get_signature(secret_key, paramsStr),
        )
        response = requests.request(method, url, headers=headers)
    except:
        # if an error occurred with the first HOST, send the request to the alternative HOST
        url = "%s%s?%s&signature=%s" % (
            "https://open-api.bingx.io",
            path,
            paramsStr,
            __get_signature(secret_key, paramsStr),
        )
        response = requests.request(method, url, headers=headers)

    return response.json()


def __parseParams(paramsMap):
    sortedKeys = sorted(paramsMap)
    paramsStr = "&".join(["%s=%s" % (x, paramsMap[x]) for x in sortedKeys])
    return paramsStr + "&timestamp=" + str(int(time.time() * 1000))


# --- public functions --- #


# - Get Functions - #


def get_user_balance(api_key: str, secret_key: str):
    path = "/openApi/spot/v1/account/balance"
    method = "GET"
    paramsMap = {}
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


def get_available_symbols(api_key: str, secret_key: str):
    path = "/openApi/spot/v1/common/symbols"
    method = "GET"
    paramsMap = {}
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


# def get_single_open_order(api_key: str, secret_key: str):
#     path = "/openApi/spot/v1/trade/openOrders"
#     method = "GET"
#     paramsMap = {}
#     paramsStr = __parseParams(paramsMap)
#     return __send_request(method, path, paramsStr, api_key, secret_key)


# def get_open_orders(api_key: str, secret_key: str):
#     path = "/openApi/spot/v1/trade/openOrders"
#     method = "GET"
#     paramsMap = {}
#     paramsStr = __parseParams(paramsMap)
#     return __send_request(method, path, paramsStr, api_key, secret_key)


def get_orders_history(api_key: str, secret_key: str):
    path = "/openApi/spot/v1/trade/historyOrders"
    method = "GET"
    paramsMap = {"startTime": 0}
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


def get_coin_daily_ohlc(api_key: str, secret_key: str, ticker: str):
    path = "/openApi/spot/v2/market/kline"
    method = "GET"
    paramsMap = {
        "symbol": ticker,
        "interval": "1d",
        "limit": 1,
    }
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


def get_candlestick_data(
    api_key: str, secret_key: str, ticker: str, timeframe: str, n: int
):
    path = "/openApi/spot/v2/market/kline"
    method = "GET"
    paramsMap = {
        "symbol": ticker,
        "interval": timeframe,
        "limit": n,
    }
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


# - POST Functions - #


def market_buy(api_key: str, secret_key: str, ticker: str, usd: float):
    path = "/openApi/spot/v1/trade/order"
    method = "POST"
    paramsMap = {
        "symbol": ticker,
        "side": "BUY",
        "type": "MARKET",
        "quoteOrderQty": usd,
    }
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


def market_sell(api_key: str, secret_key: str, ticker: str, volume: float):
    path = "/openApi/spot/v1/trade/order"
    method = "POST"
    paramsMap = {
        "symbol": ticker,
        "side": "SELL",
        "type": "MARKET",
        "quantity": volume,
    }
    paramsStr = __parseParams(paramsMap)
    return __send_request(method, path, paramsStr, api_key, secret_key)


# --- main for test --- #

if __name__ == "__main__":
    #     print("get_user_balance:", get_user_balance(API_KEY, SECRET_KEY))

    print("get_symbols:")
    symbols = get_available_symbols(API_KEY, SECRET_KEY)
    print(len(symbols["data"]["symbols"]))
    # iterating through the sorted list of coins
    for symbol in sorted(symbols["data"]["symbols"], key=lambda coin: coin["symbol"]):
        # selecting only the coins that can be bought using api
        if symbol["apiStateBuy"] and symbol["apiStateSell"] and symbol["symbol"].endswith("-USDT"):
            print(f'  "{symbol["symbol"]}",')

    # print("get_open_orders:", get_open_orders(API_KEY, SECRET_KEY))
    # print("get_orders_history:")
    # orders_history = get_orders_history(API_KEY, SECRET_KEY)
    # print(orders_history)
    # for order in get_orders_history(API_KEY, SECRET_KEY)["data"]["orders"]:
    # print(order)

#     for i in range(10):
#         print("get_coin_daily_ohlc:", get_coin_daily_ohlc("BTC-USDT")["data"][0][1:5])
#         time.sleep(2)
