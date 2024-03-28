import { useEffect, useRef, memo } from "react";

// eslint-disable-next-line react/prop-types, react-refresh/only-export-components
function TradingViewChart({ ticker }) {
  const container = useRef();

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "height": "400",
          "autosize": true,
          "symbol": "BINGX:${ticker}.P",
          "interval": "4H",
          "timezone": "Asia/Tehran",
          "theme": "dark",
          "style": "1",
          "locale": "fa",
          "hide_side_toolbar": false,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;
    container.current.appendChild(script);
  }, [ticker]);

  return (
    <div
      className="tradingview-widget-container"
      ref={container}
      style={{ width: "100%" }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ width: "100%" }}
      ></div>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(TradingViewChart);
