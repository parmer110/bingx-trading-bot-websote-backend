/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { Link } from "react-scroll";
import { axiosAuthorize } from "../../api/axios";
import bearishIcon from "../../assets/icons/bearish.svg";
import bullishIcon from "../../assets/icons/bullish.svg";
import { DeviceContext } from "../../context/DeviceContext";

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

export default function PositionsHistoryTable() {
  const { device } = useContext(DeviceContext);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [positionsHistoryData, setPositionsHistoryData] = useState([]);

  async function getPositionsHistory() {
    return await axiosAuthorize
      .get("/position/all/close")
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  useEffect(() => {
    setIsDataLoading(true);
    getPositionsHistory()
      .then((positionsHistory) => {
        if (positionsHistory) {
          const history = positionsHistory.map((position) => {
            const openDate = new Date(position.open_date_time * 1000);
            const formattedOpenDate = `
                ${String(openDate.getHours()).padStart(2, "0")}:${String(openDate.getMinutes()).padStart(2, "0")}:${String(openDate.getSeconds()).padStart(2, "0")} 
                ${openDate.getFullYear()}-${String(openDate.getMonth() + 1).padStart(2, "0")}-${String(openDate.getDate()).padStart(2, "0")}`;
            const closeDate = new Date(position.close_date_time * 1000);
            const formattedCloseDate = `
                ${String(closeDate.getHours()).padStart(2, "0")}:${String(closeDate.getMinutes()).padStart(2, "0")}:${String(closeDate.getSeconds()).padStart(2, "0")} 
                ${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, "0")}-${String(closeDate.getDate()).padStart(2, "0")}`;

            const positionPnl =
              Math.round(
                ((position.close_price - position.open_price) /
                  position.open_price) *
                  10000,
              ) / 100;
            const finalMargin = Math.round(position.final_margin * 100) / 100;
            const volume = Math.round(position.volume * 10000000) / 10000000;

            return {
              ...position,
              open_date_time: formattedOpenDate,
              close_date_time: formattedCloseDate,
              final_margin: finalMargin,
              volume: volume,
              position_pnl_percentage: positionPnl,
              closeDate: closeDate,
            };
          });
          return history;
        } else {
          return [];
        }
      })
      .then((positionsHistory) => {
        setPositionsHistoryData(positionsHistory);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsDataLoading(false);
      });
  }, []);

  return (
    <div
      id="positions-history"
      className="relative flex w-[1024px] flex-col whitespace-nowrap rounded border-b-2 border-l border-primary/30
          bg-background-3/70 p-10 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm max-lg:w-[90vw] max-lg:p-6"
    >
      {/* Title */}
      <h3 className="mb-7 text-2xl font-bold">تاریخچه معاملات</h3>

      {/* Positions History Table (Desktop) */}
      {device === "desktop" && (
        <table className="divide-y divide-neutral">
          <thead>
            <tr>
              {[
                "ارز",
                "شناسه معامله",
                "زمان باز شدن",
                "قیمت باز شده",
                "زمان بسته شدن",
                "قیمت بسته شده",
                "سرمایه اولیه",
                "سرمایه نهایی",
                "حجم",
                "درصد رشد معامله",
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
          <tbody className="divide-y divide-neutral">
            {positionsHistoryData
              .sort((a, b) => b.closeDate - a.closeDate)
              .map(
                ({
                  ticker,
                  order_id,
                  open_date_time,
                  open_price,
                  close_date_time,
                  close_price,
                  margin,
                  final_margin,
                  volume,
                  position_pnl_percentage,
                }) => (
                  <tr
                    key={order_id}
                    className="text-center text-xs font-medium *:py-6"
                  >
                    <td>{ticker}</td>
                    <td>{order_id}</td>
                    <td>{open_date_time}</td>
                    <td>{open_price}</td>
                    <td>{close_date_time}</td>
                    <td>{close_price}</td>
                    <td>{margin}</td>
                    <td>{final_margin}</td>
                    <td>{volume}</td>
                    <td
                      dir="ltr"
                      className={bulBearNeutClassNames(position_pnl_percentage)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {bulBearNeutIcon(position_pnl_percentage)}
                        {position_pnl_percentage}%
                      </div>
                    </td>
                  </tr>
                ),
              )}
          </tbody>
        </table>
      )}

      {/* Positions History Table (Desktop) */}
      {device === "mobile" && (
        <div className="grid gap-4">
          {positionsHistoryData
            .sort((a, b) => b.closeDate - a.closeDate)
            .map(
              ({
                ticker,
                order_id,
                open_date_time,
                open_price,
                close_date_time,
                close_price,
                margin,
                final_margin,
                volume,
                position_pnl_percentage,
              }) => (
                <PositionCard
                  key={order_id}
                  ticker={ticker}
                  order_id={order_id}
                  open_date_time={open_date_time}
                  open_price={open_price}
                  close_date_time={close_date_time}
                  close_price={close_price}
                  margin={margin}
                  final_margin={final_margin}
                  volume={volume}
                  position_pnl_percentage={position_pnl_percentage}
                />
              ),
            )}
        </div>
      )}

      {/* More and Less Button */}
      {localStorage.getItem("isKeysValid") === "false" ? (
        <p className="my-5 text-wrap text-center text-gray-400">
          <span>لطفا برای مشاهده تاریخچه معاملات، ابتدا فرم</span>
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
        positionsHistoryData.length === 0 && (
          <p className="mt-5 text-wrap text-center font-light text-gray-400">
            معامله بسته ای ندارید !
          </p>
        )
      )}
    </div>
  );
}

function PositionCard({
  ticker,
  order_id,
  open_date_time,
  open_price,
  close_date_time,
  close_price,
  margin,
  final_margin,
  volume,
  position_pnl_percentage,
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

        {/* Close Data Time & Dropdown Icon */}
        <div className="flex items-center gap-3">
          <span>{close_date_time}</span>
          <span className="grid place-items-center rounded-full bg-background-2 p-1">
            <FaChevronDown
              className={`h-4 w-4 transition-transform ${isCardOpen && "rotate-180"}`}
            />
          </span>
        </div>
      </button>

      {/* Position Details */}
      {isCardOpen && (
        <div className="mb-3 mt-5 grid grid-cols-2 font-semibold">
          <div className="col-span-1 flex flex-col items-start justify-between gap-4">
            {[
              "شناسه معامله",
              "زمان باز شدن",
              "قیمت باز شده",
              "زمان بسته شدن",
              "قیمت بسته شده",
              "سرمایه اولیه",
              "سرمایه نهایی",
              "حجم",
              "درصد رشد معامله",
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
            <span>{order_id}</span>
            <span>{open_date_time}</span>
            <span>{open_price}</span>
            <span>{close_date_time}</span>
            <span>{close_price}</span>
            <span>{margin}</span>
            <span>{final_margin}</span>
            <span>{volume}</span>
            <div
              dir="ltr"
              className={bulBearNeutClassNames(position_pnl_percentage)}
            >
              <div className="flex items-center justify-center gap-2">
                {bulBearNeutIcon(position_pnl_percentage)}
                {position_pnl_percentage}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
