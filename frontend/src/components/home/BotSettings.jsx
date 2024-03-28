import { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { IoCloseOutline } from "react-icons/io5";
import { axiosAuthorize } from "../../api/axios";
import robotImg from "../../assets/images/robot.png";
import { availableSymbols } from "./available-symbols";

const GUIDE_STEPS = [
  {
    index: "1",
    title: "ورود به حساب خود در صرافی ",
    description: "در صورت نداشتن حساب ابتدا باید حساب باز کنید.",
    bingxLink: (
      <a
        href="https://bingx.com/invite/WVOOWX"
        className="animate-pulse text-primary transition-colors hover:text-secondary"
      >
        BingX
      </a>
    ),
  },
  {
    index: "2",
    title: "ورود به صفحه اصلی وبسایت",
    description: "ورود به صفحه اصلی وبسایت bingx.com",
  },
  {
    index: "3",
    title: 'انتخاب گزینه "پروفایل"',
    description: "انتخاب این گزینه از منوی اصلی در بالای صفحه.",
  },
  {
    index: "4",
    title: 'انتخاب گزینه "مدیریت API"',
    description: "انتخاب این گزینه API در قسمت پروفایل.",
  },
  {
    index: "5",
    title: 'انتخاب گزینه "ایجاد API"',
    description: "انتخاب این گزینه برای ساخت API.",
  },
  {
    index: "6",
    title: "انتخاب اسم برای کلید API",
    description: 'ترجیحا انتخاب اسم "AlmasTalayi" برای API.',
  },
  {
    index: "7",
    title: "ثبت کد تایید",
    description: "ثبت کد تایید امنیتی.",
  },
  {
    index: "*",
    title: "",
    description: `پس از این مرحله، کلید های شما با موفقیت ساخته میشود و شما نیاز دارید تا "API Key" و "Secret Key" را کپی کرده و در فیلد بالا، این دو راوارد نمایید.
    Secret Key فقط در بار اول نمایش داده می‌شود، پس باید همان ابتدا آن را کپی کنید؛ چرا که در غیر این صورت نیازمند انجام مجدد مراحل بالا برای دریافت کلید جدید می‌باشید!`,
  },
  {
    index: "8",
    title: 'انتخاب گزینه "ویرایش"',
    description: "انتخاب این گزینه برای ایجاد تغییر در API.",
  },
  {
    index: "9",
    title: 'زدن تیک "معامله اسپات"',
    description: 'زدن تیک این گزینه در بخش "مجوز های API".',
  },
  {
    index: "10",
    title: 'انتخاب گزینه "ذخیره"',
    description: "انتخاب این گزینه برای ساخت کلید API و Secret.",
  },

  {
    index: "11",
    title: "ثبت کد تایید",
    description: "ثبت کد تایید امنیتی برای آخرین بار.",
  },
];

export default function BotSettings() {
  const [formData, setFormData] = useState({
    bingx_api_key: localStorage.getItem("apiKey") || "",
    bingx_secret_key: localStorage.getItem("secretKey") || "",
    strategy_chg_percentage: localStorage.getItem("strategyChg") || "",
    default_margin: localStorage.getItem("defaultMargin") || "",
    sl_percentage: localStorage.getItem("slPercentage") || "",
    tp_percentage: localStorage.getItem("tpPercentage") || "",
  });
  const [isModalShown, setIsModalShown] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const [botToggleErrorMsg, setBotToggleErrorMsg] = useState("");
  const [apiKeyErrorMsg, setApiKeyErrorMsg] = useState("");
  const [secretKeyErrorMsg, setSecretKeyErrorMsg] = useState("");
  const [formSubmitErrorMsg, setFormSubmitErrorMsg] = useState("");
  const [formSubmitSuccessMsg, setFormSubmitSuccessMsg] = useState("");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [cryptoSearch, setCryptoSearch] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState([]);

  function toggleSelection(id) {
    setSelectedCrypto((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function selectAll() {
    if (selectedCrypto.length < availableSymbols.length) {
      setSelectedCrypto(availableSymbols);
    } else {
      setSelectedCrypto([]);
    }
  }

  const filteredSortedCryptos = availableSymbols.filter((coin) =>
    coin.toLowerCase().includes(cryptoSearch.toLowerCase()),
  );

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function setErrorMessages(detail) {
    if (detail.api_key) {
      setApiKeyErrorMsg("");
    } else {
      setApiKeyErrorMsg("کلید API اشتباه است!");
    }
    if (detail.secret_key) {
      setSecretKeyErrorMsg("");
    } else {
      setSecretKeyErrorMsg("کلید Secret اشتباه است!");
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (isBotActive) {
      setFormSubmitErrorMsg(
        "لطفا پیش از تغییر تنظیمات ربات، ربات را غیر فعال کنید!",
      );
      return;
    } else {
      setFormSubmitErrorMsg("");
    }

    setIsFormSubmitting(true);
    await axiosAuthorize
      .put("/bot-setting", {
        ...formData,
        coins_to_trade: selectedCrypto.join("|"),
      })
      .then((res) => {
        if (res.status === 204) {
          setBotToggleErrorMsg("");
          setApiKeyErrorMsg("");
          setSecretKeyErrorMsg("");
          setFormSubmitSuccessMsg(
            "تنظیمات جدید ربات با موفقیت ثبت شد. حال میتوانید ربات را فعال کنید.",
          );
          localStorage.setItem("isKeysValid", true);
          localStorage.setItem("apiKey", formData.bingx_api_key);
          localStorage.setItem("secretKey", formData.bingx_secret_key);
          localStorage.setItem("strategyChg", formData.strategy_chg_percentage);
          localStorage.setItem("defaultMargin", formData.default_margin);
          localStorage.setItem("slPercentage", formData.sl_percentage);
          localStorage.setItem("tpPercentage", formData.tp_percentage);
          localStorage.setItem("coinsToTrade", JSON.stringify(selectedCrypto));
        }
        setIsFormSubmitting(false);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 406) {
          setIsBotActive(false);
          setErrorMessages(err.response.data.detail);
          setIsFormSubmitting(false);
        }
      });
  }

  async function activateBot() {
    await axiosAuthorize
      .patch("/trading-bot/activate")
      .then(() => setIsBotActive(true));
  }

  async function deactivateBot() {
    await axiosAuthorize
      .patch("/trading-bot/deactivate")
      .then(() => setIsBotActive(false));
  }

  async function handleUserInefficientBalance() {
    await axiosAuthorize.get("/user/capital-usdt").then((res) => {
      const capital_usdt = res.data?.capital_usdt;
      const threshold = localStorage.getItem("defaultMargin") || 7.5;
      if (capital_usdt < threshold) {
        setBotToggleErrorMsg("اعتبار USDT برای معامله کافی نیست !");
        deactivateBot();
      } else {
        setBotToggleErrorMsg("");
      }
    });
  }

  async function handleBotSwitch() {
    if (!isBotActive) {
      await axiosAuthorize
        .get("/bot-setting/is-keys-valid")
        .then((res) => {
          if (res.data?.is_valid) {
            setBotToggleErrorMsg("");
            setFormSubmitSuccessMsg("");
            activateBot();
          }
          handleUserInefficientBalance();
        })
        .catch((err) => {
          setIsBotActive(false);
          if (err.response?.status === 406) {
            setBotToggleErrorMsg(
              "لطفا برای فعالسازی اولیه ربات، فرم زیر را تکمیل کنید!",
            );
          }
        });
    } else {
      deactivateBot();
    }
  }

  async function checkIsBotActive() {
    await axiosAuthorize
      .get("/bot-setting")
      .then((res) => {
        if (res.status === 200) {
          setIsBotActive(res.data.is_bot_active);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    checkIsBotActive();
    setSelectedCrypto(JSON.parse(localStorage.getItem("coinsToTrade")) || []);

    handleUserInefficientBalance();
    const interval = setInterval(handleUserInefficientBalance, 10_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="bot-setting"
      className="w-[1024px] items-center justify-between rounded p-10 max-lg:w-[90vw] max-lg:px-6"
    >
      {/* Title */}
      <h3 className="mb-7 text-2xl font-bold">تنظیمات ربات</h3>

      {/* Robot Image (Mobile) */}
      <div className="relative mx-auto mb-10 w-3/5 lg:hidden">
        <img src={robotImg} className="relative z-10 w-full" />
        <span className="absolute bottom-0 left-0 right-0 h-[10vw] rounded-[100%] bg-black/60 blur-lg" />
      </div>

      <div className="mb-10 flex w-full items-center justify-between max-lg:flex-col-reverse max-lg:gap-10">
        {/* API & Secret Key Retrieval Guide Button */}
        <button
          type="button"
          className="flex items-center justify-between gap-3 rounded bg-background-1 px-5 py-3 transition-shadow hover:shadow-lg active:shadow-inner"
          onClick={() => setIsModalShown(!isModalShown)}
        >
          {/* <FaQuestionCircle className="w-4 h-4" /> */}
          <FaInfoCircle className="h-5 w-5" />
          <h3 className="text-sm font-medium">
            راهنمای دریافت API Key و Secret Key
          </h3>
        </button>

        {/* API & Secret Key Retrieval Guide Modal */}
        <div
          className={`fixed left-0 right-0 top-0 z-30 grid h-screen place-items-center text-black
          ${!isModalShown ? "hidden" : "bg-black/70 backdrop-blur-sm"}`}
          onClick={() => setIsModalShown(false)}
        >
          <div
            className="flex h-[80vh] w-96 flex-col rounded bg-white p-5 max-sm:w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button className="w-fit" onClick={() => setIsModalShown(false)}>
                <IoCloseOutline className="h-7 w-7 text-black transition-colors hover:text-primary" />
              </button>
            </div>

            <div className="items-top mb-7 mt-3 flex justify-start">
              <span className="h-full w-1.5 rounded-e rounded-s-md bg-gray-200" />
              <div className="grid place-items-start px-3">
                <h3 className="mb-1 text-sm font-medium">
                  راهنمای دریافت API Key و Secret Key
                </h3>
                <p className="text-xs text-gray-500">
                  اپلیکیشن تغییر آی پی خود را در طی مراحل روشن کنید.
                </p>
              </div>
            </div>

            <div className="modal-scrollbar flex flex-col gap-2 overflow-y-scroll pl-2">
              {GUIDE_STEPS.map(({ index, title, description, bingxLink }) => (
                <GuideStep
                  key={index}
                  index={index}
                  title={title}
                  description={description}
                  bingxLink={bingxLink}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-center lg:flex-row">
          {/* Bot Toggle Switch Error Message */}
          {botToggleErrorMsg && (
            <span className="mt-5 text-center text-sm font-light text-bearish lg:ml-5 lg:mt-0">
              {botToggleErrorMsg}
            </span>
          )}

          {/* Bot Toggle Switch */}
          <button
            className={`relative inline-flex h-10 w-[170px] items-center rounded-full transition-colors
              ${isBotActive ? "bg-white" : "bg-gray-400"}`}
            onClick={handleBotSwitch}
          >
            <div className="flex w-full justify-between">
              <span
                className={`z-10 mr-7 ${isBotActive ? "text-white" : "text-black/70"}`}
              >
                فعال
              </span>
              <span
                className={`z-10 ml-4 ${!isBotActive ? "text-white" : "text-black/70"}`}
              >
                غیر فعال
              </span>
            </div>
            <span
              className={`absolute inline-block h-8 w-20 transform rounded-full text-black transition-transform
                ${isBotActive ? "-translate-x-1 bg-background-3" : "-translate-x-[84px] bg-gray-600"}`}
            ></span>
          </button>
        </div>
      </div>

      {/* Section Body */}
      <div className="flex gap-20">
        {/* Right Side - Form */}
        <form
          className="grid w-full grid-flow-row grid-cols-3 gap-6 text-sm max-lg:w-full max-lg:grid-cols-1"
          onSubmit={handleFormSubmit}
        >
          <label htmlFor="api-key" className="flex flex-col gap-2 font-mono">
            <span>کلید API</span>
            <textarea
              id="api-key"
              name="bingx_api_key"
              className="resize-none rounded-lg bg-background-3 p-3 tracking-widest shadow-inner transition-colors hover:bg-background-3/50"
              rows={3}
              dir="ltr"
              placeholder="API Key"
              required
              value={formData.bingx_api_key}
              onChange={handleFormChange}
            />
            <span className="text-xs text-bearish">{apiKeyErrorMsg}</span>
          </label>

          <label htmlFor="secret-key" className="flex flex-col gap-2 font-mono">
            <span>کلید امنیتی</span>
            <textarea
              id="secret-key"
              name="bingx_secret_key"
              className="resize-none rounded-lg bg-background-3 p-3 tracking-widest shadow-inner transition-colors hover:bg-background-3/50"
              rows={3}
              dir="ltr"
              placeholder="Secret Key"
              required
              value={formData.bingx_secret_key}
              onChange={handleFormChange}
            />
            <span className="text-xs text-bearish">{secretKeyErrorMsg}</span>
          </label>

          <div className="row-span-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="crypto-selection">انتخاب ارز ها</label>
              <div className="flex max-h-[365px] flex-col gap-2 rounded-lg">
                <input
                  id="crypto-selection"
                  type="text"
                  className="rounded-lg bg-background-3 p-2.5 uppercase shadow-inner shadow-gray-900 transition-colors hover:bg-background-3/50"
                  placeholder="ارز مورد نظر را جستجو کنید..."
                  onChange={(e) => setCryptoSearch(e.target.value)}
                />
                <button
                  type="button"
                  onClick={selectAll}
                  className="mb-4 rounded-lg border-b border-l border-primary/30 bg-background-3 py-2 text-white shadow-[-3px_3px_7px] shadow-primary/10 transition-all
                      hover:shadow-none active:border-background-3 active:shadow-inner active:shadow-gray-900"
                >
                  {selectedCrypto.length < availableSymbols.length
                    ? "انتخاب همه"
                    : "لغو انتخاب همه"}
                </button>
                <div className="crypto-selection-scrollbar overflow-y-scroll rounded-lg bg-background-3 p-3">
                  {filteredSortedCryptos.map((symbol, index) => (
                    <label
                      htmlFor={symbol}
                      key={symbol}
                      className="flex items-center justify-between border-b border-table px-2 py-3.5 tracking-widest transition-transform
                          last:border-none hover:scale-[102%] hover:border-none hover:shadow-lg active:scale-[98%] active:shadow-inner"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs tracking-tight text-neutral">
                          {index + 1}.
                        </span>
                        <span>{symbol}</span>
                      </div>
                      <input
                        id={symbol}
                        type="checkbox"
                        className="focus:outline-none"
                        checked={selectedCrypto.includes(symbol)}
                        onChange={() => toggleSelection(symbol)}
                      />
                    </label>
                  ))}

                  {filteredSortedCryptos.length === 0 && (
                    <span className="w-full text-center font-light text-gray-400">
                      ارزی یافت نشد !
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <label
            htmlFor="strategy-threshold-percentage"
            className="flex flex-col gap-2"
          >
            <span>آستانه استراتژی (درصد)</span>
            <input
              type="number"
              id="strategy-threshold-percentage"
              name="strategy_chg_percentage"
              className="rounded-lg bg-background-3 p-3 shadow-inner transition-colors hover:bg-background-3/50"
              dir="ltr"
              placeholder="مثال: 0.35"
              step={0.05}
              required
              value={formData.strategy_chg_percentage}
              onChange={handleFormChange}
            />
          </label>

          <label
            htmlFor="default-margin-dollar"
            className="flex flex-col gap-2"
          >
            <span>مارجین هر معامله (دلار)</span>
            <input
              type="number"
              id="default-margin-dollar"
              name="default_margin"
              className="rounded-lg bg-background-3 p-3 shadow-inner transition-colors hover:bg-background-3/50"
              dir="ltr"
              placeholder="مثال: 10.00"
              min={7.5}
              step={0.5}
              required
              value={formData.default_margin}
              onChange={handleFormChange}
            />
          </label>

          <label htmlFor="stop-loss-percentage" className="flex flex-col gap-2">
            <span>حد ضرر هر معامله (درصد)</span>
            <input
              type="number"
              id="stop-loss-percentage"
              name="sl_percentage"
              className="rounded-lg bg-background-3 p-3 shadow-inner transition-colors hover:bg-background-3/50"
              dir="ltr"
              placeholder="مثال: 2.5"
              min={0.5}
              max={100}
              step={0.5}
              required
              value={formData.sl_percentage}
              onChange={handleFormChange}
            />
          </label>

          <label
            htmlFor="take-profit-percentage"
            className="flex flex-col gap-2"
          >
            <span>حد سود هر معامله (درصد)</span>
            <input
              type="number"
              id="take-profit-percentage"
              name="tp_percentage"
              className="rounded-lg bg-background-3 p-3 shadow-inner transition-colors hover:bg-background-3/50"
              dir="ltr"
              placeholder="7.5 :مثال"
              min={0.5}
              step={0.5}
              required
              value={formData.tp_percentage}
              onChange={handleFormChange}
            />
          </label>

          <button
            type="submit"
            className="col-span-2 rounded-lg bg-gradient-to-r from-secondary to-cta p-px text-lg
              font-semibold drop-shadow-[0_0_7px_#CFB53B77] disabled:from-gray-600 max-lg:col-span-1"
            disabled={isFormSubmitting}
          >
            <div className="z-10 h-full w-full rounded-lg bg-cta py-1.5 transition-colors hover:bg-transparent">
              {isFormSubmitting ? (
                <ImSpinner2 className="mx-auto my-0.5 h-6 w-6 animate-spin" />
              ) : (
                <span className="mx-auto">تایید</span>
              )}
            </div>
          </button>
          {formSubmitSuccessMsg && (
            <span className="col-span-2 text-center text-sm font-semibold text-bullish max-lg:col-span-1">
              {formSubmitSuccessMsg}
            </span>
          )}
          {formSubmitErrorMsg && (
            <span className="col-span-2 text-center text-sm font-semibold text-bearish max-lg:col-span-1">
              {formSubmitErrorMsg}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/prop-types
function GuideStep({ index, title, description, bingxLink }) {
  return (
    <div className="flex w-full gap-3 rounded-xl bg-gray-50 p-2">
      <div className="grid min-h-9 min-w-9 place-items-center rounded-full bg-gray-100">
        <span className="font-bold text-secondary">{index}</span>
      </div>
      <div>
        <h5 className="text-sm font-semibold text-black">
          {title}
          {bingxLink}
        </h5>
        <p className="text-xs font-light text-gray-500">{description}</p>
      </div>
    </div>
  );
}
