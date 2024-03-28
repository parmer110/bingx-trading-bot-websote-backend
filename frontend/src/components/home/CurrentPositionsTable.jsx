/* eslint-disable react/prop-types */
import { useContext, useEffect, useState, Fragment } from "react";
import { FaChevronDown } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { Link } from "react-scroll";
import { axiosAuthorize } from "../../api/axios";
import bearishIcon from "../../assets/icons/bearish.svg";
import bullishIcon from "../../assets/icons/bullish.svg";
import { DeviceContext } from "../../context/DeviceContext";
import TradingViewChart from "./TradingViewChart";

function recognizeBulBearNeut(input) {
  if (typeof input == "number") {
    if (input > 0) return "bullish";
    if (input == 0) return "neutral";
    if (input < 0) return "bearish";
  }
  if (typeof input == "string") {
    if (input == "خرید") return "bullish";
    if (input == "خنثی") return "neutral";
    if (input == "فروش") return "bearish";
  }
}

function bulBearNeutClassNames(input) {
  if (recognizeBulBearNeut(input) == "bullish") return "text-bullish";
  if (recognizeBulBearNeut(input) == "neutral") return "text-neutral";
  if (recognizeBulBearNeut(input) == "bearish") return "text-bearish";
}

function bulBearNeutIcon(input) {
  if (recognizeBulBearNeut(input) == "bullish")
    return <img src={bullishIcon} className="text-bullish" />;
  if (recognizeBulBearNeut(input) == "neutral") return null;
  if (recognizeBulBearNeut(input) == "bearish")
    return <img src={bearishIcon} className="text-bearish" />;
}

export default function CurrentPositionsTable() {
  const { device } = useContext(DeviceContext);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [currentPositionsData, setCurrentPositionsData] = useState([]);
  const [isSellingAll, setIsSellingAll] = useState(false);
  const [visibleStates, setVisibleStates] = useState(
    currentPositionsData.reduce(
      (acc, _, index) => ({ ...acc, [index]: false }),
      {},
    ),
  );

  const toggleVisibility = (index) => {
    setVisibleStates((prevStates) => ({
      ...prevStates,
      [index]: !prevStates[index],
    }));
  };

  async function getCoinOHLC(ticker) {
    return await axiosAuthorize
      .get("/bingx/coin-ohlc", { params: { ticker: ticker } })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function getOpenPositions() {
    return await axiosAuthorize
      .get("/position/all/open")
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    const callback = async () => {
      await getOpenPositions()
        .then((openPositions) => {
          if (openPositions) {
            const positionPromises = openPositions.map(async (position) => {
              return await getCoinOHLC(position.ticker).then((ohlc) => {
                const date = new Date(position.open_date_time * 1000);
                const formattedDate = `
                  ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")} 
                  ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

                const coinDailyPnl =
                  Math.round(((ohlc.close - ohlc.open) / ohlc.open) * 10000) /
                  100;
                const positionPnl =
                  Math.round(
                    ((ohlc.close - position.open_price) / position.open_price) *
                      10000,
                  ) / 100;
                const margin = (
                  position.margin +
                  position.margin * (positionPnl / 100)
                ).toFixed(2);
                const volume =
                  Math.round(position.volume * 10000000) / 10000000;

                return {
                  ...position,
                  ...ohlc,
                  coin_daily_pnl: coinDailyPnl,
                  position_pnl_percentage: positionPnl,
                  margin: margin,
                  volume: volume,
                  open_date_time: formattedDate,
                };
              });
            });
            return Promise.all(positionPromises);
          } else {
            return [];
          }
        })
        .then((currentPositionsData) => {
          setCurrentPositionsData(currentPositionsData);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    };

    setIsDataLoading(true);
    callback();
    const interval = setInterval(callback, 10_000);
    return () => clearInterval(interval);
  }, []);

  async function sellAllOpenPositions() {
    setIsSellingAll(true);
    const order_ids = currentPositionsData.map((position) => position.order_id);
    order_ids.forEach(async (order_id) => {
      await axiosAuthorize
        .post(
          "trading-bot/sell-position",
          {},
          {
            params: {
              order_id: order_id,
            },
          },
        )
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setIsSellingAll(false);
        });
    });
  }

  async function sellSingleOpenPosition(order_id) {
    await axiosAuthorize
      .post(
        "trading-bot/sell-position",
        {},
        {
          params: {
            order_id: order_id,
          },
        },
      )
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div
      id="current-positions"
      className="relative flex w-[1024px] flex-col whitespace-nowrap rounded border-b-2 border-l border-primary/30
          bg-background-3/70 p-10 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm max-lg:w-[90vw] max-lg:p-6"
    >
      {/* Title and Sell All Button */}
      <div className="mb-7 flex justify-between">
        <h3 className="text-2xl font-bold">معاملات فعلی</h3>
        <button
          className={`rounded-lg bg-bearish px-3 py-2 text-sm font-semibold transition-all hover:drop-shadow-[1px_1px_5px_#EF4444]
            disabled:opacity-30 ${currentPositionsData.length === 0 ? "hidden" : ""}`}
          onClick={sellAllOpenPositions}
          disabled={isSellingAll}
        >
          فروش همه
        </button>
      </div>

      {/* Current Positions Table (Desktop) */}
      {device === "desktop" && (
        <table className="divide-y divide-table">
          <thead>
            <tr>
              {[
                "ارز",
                "قیمت لحظه ای",
                "بیشترین قیمت",
                "کمترین قیمت",
                "شناسه معامله",
                "زمان باز شدن",
                "قیمت باز شده",
                "مقدار سرمایه",
                "حجم",
                "درصد رشد سکه",
                "درصد رشد معامله",
                "عملیات",
              ].map((title, index) => (
                <th
                  key={index}
                  scope="col"
                  className="py-4 text-center text-xs font-medium text-neutral"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-table">
            {currentPositionsData
              .sort(
                (a, b) => b.position_pnl_percentage - a.position_pnl_percentage,
              )
              .map(
                (
                  {
                    ticker,
                    close,
                    high,
                    low,
                    order_id,
                    open_date_time,
                    open_price,
                    margin,
                    volume,
                    coin_daily_pnl,
                    position_pnl_percentage,
                  },
                  index,
                ) => (
                  <Fragment key={order_id}>
                    <tr
                      className="text-center text-xs font-medium transition-colors *:py-4 hover:cursor-pointer hover:bg-background-1/20"
                      onClick={() => toggleVisibility(index)}
                    >
                      <td>{ticker}</td>
                      <td
                        key={close}
                        className="animate-pulse-once text-secondary"
                      >
                        {close}
                      </td>
                      <td key={high} className="animate-pulse-once">
                        {high}
                      </td>
                      <td key={low} className="animate-pulse-once">
                        {low}
                      </td>
                      <td dir="ltr" className="max-w-8 truncate">
                        {order_id}
                      </td>
                      <td>{open_date_time}</td>
                      <td>{open_price}</td>
                      <td key={margin} className="animate-pulse-once">
                        {margin}
                      </td>
                      <td>{volume}</td>
                      <td
                        key={coin_daily_pnl}
                        dir="ltr"
                        className={`animate-pulse-once ${bulBearNeutClassNames(coin_daily_pnl)}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {bulBearNeutIcon(coin_daily_pnl)}
                          {coin_daily_pnl}%
                        </div>
                      </td>
                      <td
                        key={position_pnl_percentage}
                        dir="ltr"
                        className={`animate-pulse-once ${bulBearNeutClassNames(
                          position_pnl_percentage,
                        )}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {bulBearNeutIcon(position_pnl_percentage)}
                          {position_pnl_percentage}%
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="rounded-lg border border-bearish px-3 py-1.5 text-sm font-semibold text-bearish transition-colors hover:bg-bearish hover:text-white"
                          onClick={() => sellSingleOpenPosition(order_id)}
                        >
                          فروش
                        </button>
                      </td>
                    </tr>
                    {visibleStates[index] && (
                      <tr>
                        <td colSpan="12">
                          <TradingViewChart ticker={ticker.replace("-", "")} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ),
              )}
          </tbody>
        </table>
      )}

      {/* Current Positions Table (Mobile) */}
      {device === "mobile" && (
        <div className="grid gap-4">
          {currentPositionsData
            .sort(
              (a, b) => b.position_pnl_percentage - a.position_pnl_percentage,
            )
            .map(
              ({
                ticker,
                close,
                high,
                low,
                order_id,
                open_date_time,
                open_price,
                margin,
                volume,
                coin_daily_pnl,
                position_pnl_percentage,
              }) => (
                <PositionCard
                  key={order_id}
                  ticker={ticker}
                  close={close}
                  high={high}
                  low={low}
                  order_id={order_id}
                  open_date_time={open_date_time}
                  open_price={open_price}
                  margin={margin}
                  volume={volume}
                  coin_daily_pnl={coin_daily_pnl}
                  position_pnl_percentage={position_pnl_percentage}
                  sellSingleOpenPosition={sellSingleOpenPosition}
                />
              ),
            )}
        </div>
      )}

      {localStorage.getItem("isKeysValid") === "false" ? (
        <p className="my-5 text-wrap text-center text-gray-400">
          <span>لطفا برای مشاهده معاملات فعلی، ابتدا فرم</span>
          <Link
            className="cursor-pointer text-primary transition-colors hover:text-secondary"
            to="bot-setting"
            smooth
            spy
          >
            <span> تنظیمات ربات </span>
          </Link>
          <span>را تکمیل کنید!</span>
        </p>
      ) : isDataLoading ? (
        <ImSpinner2 className="mx-auto my-5 h-6 w-6 animate-spin" />
      ) : (
        currentPositionsData.length === 0 && (
          <p className="my-5 text-wrap text-center font-light text-gray-400">
            معامله ای در جریان نیست !
          </p>
        )
      )}
    </div>
  );
}

function PositionCard({
  ticker,
  close,
  high,
  low,
  order_id,
  open_date_time,
  open_price,
  margin,
  volume,
  coin_daily_pnl,
  position_pnl_percentage,
  sellSingleOpenPosition,
}) {
  const [isCardOpen, setIsCardOpen] = useState(false);

  return (
    <div className="rounded-xl border-b border-l border-primary/30 px-5 py-4 text-xs font-bold shadow-[-3px_3px_10px] shadow-primary/10">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setIsCardOpen(!isCardOpen)}
      >
        {/* Ticker */}
        <span>{ticker}</span>

        {/* Position PnL */}

        {/* Current Price & Dropdown Icon */}
        <div className="flex items-center gap-3">
          <div
            key={position_pnl_percentage}
            dir="ltr"
            className={`animate-pulse-once ${bulBearNeutClassNames(position_pnl_percentage)}`}
          >
            <span>{position_pnl_percentage}%</span>
          </div>
          {/* <span className="text-secondary">{close}</span> */}
          <span className="grid place-items-center rounded-full bg-background-2 p-1">
            <FaChevronDown
              className={`h-4 w-4 transition-transform ${isCardOpen && "rotate-180"}`}
            />
          </span>
        </div>
      </button>

      {/* Position Details */}
      {isCardOpen && (
        <div className="mt-5 grid grid-cols-2 font-semibold">
          <div className="col-span-1 flex flex-col items-start justify-between gap-4">
            {[
              "قیمت لحظه ای",
              "بیشترین قیمت",
              "کمترین قیمت",
              "شناسه معامله",
              "زمان باز شدن",
              "قیمت باز شده",
              "مقدار سرمایه",
              "حجم",
              "درصد رشد سکه",
            ].map((title, index) => (
              <span
                key={index}
                scope="col"
                className="font-medium text-neutral"
              >
                {title}
              </span>
            ))}
          </div>
          <div className="col-span-1 flex flex-col items-center justify-between gap-4">
            <span key={close} className="animate-pulse-once">
              {close}
            </span>
            <span key={high} className="animate-pulse-once">
              {high}
            </span>
            <span key={low} className="animate-pulse-once">
              {low}
            </span>
            <span>{order_id}</span>
            <span>{open_date_time}</span>
            <span>{open_price}</span>
            <span key={margin} className="animate-pulse-once">
              {margin}
            </span>
            <span>{volume}</span>
            <div
              key={coin_daily_pnl}
              dir="ltr"
              className={`animate-pulse-once ${bulBearNeutClassNames(coin_daily_pnl)}`}
            >
              <div className="flex items-center justify-center gap-2">
                {bulBearNeutIcon(coin_daily_pnl)}
                {coin_daily_pnl}%
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <button
              type="button"
              className="mt-5 w-full rounded-lg border-b border-l border-bearish/30 bg-bearish/5 py-2 text-sm font-semibold text-bearish
                  shadow-[-3px_3px_7px] shadow-bearish/10 transition-colors active:bg-bearish active:text-white"
              onClick={() => sellSingleOpenPosition(order_id)}
            >
              فروش
            </button>
          </div>
          <div className="col-span-2 mt-5">
            <TradingViewChart ticker={ticker.replace("-", "")} />
          </div>
        </div>
      )}
    </div>
  );
}
