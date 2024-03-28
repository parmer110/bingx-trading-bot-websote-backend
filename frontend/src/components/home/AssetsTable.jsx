import { useEffect, useState } from "react";
import { Link } from "react-scroll";
import { axiosAuthorize } from "../../api/axios";
import vaultImg from "../../assets/images/vault-wallpaper.png";
import { ImSpinner2 } from "react-icons/im";

export default function AssetsTable() {
  const [assets, setAssets] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  async function setCapitalUSDT(capitalUSDT) {
    await axiosAuthorize.patch(
      "/user/capital-usdt",
      {},
      { params: { capital_usdt: capitalUSDT } },
    );
  }

  async function getBalance() {
    return await axiosAuthorize
      .get("/bingx/balance")
      .then((res) => {
        if (res.status === 200) {
          const modifiedAssets = res.data.map(({ asset, free, locked }) => ({
            asset,
            free: free == 0 ? "-" : Number(free).toFixed(5),
            locked: locked == 0 ? "-" : Number(locked).toFixed(5),
          }));
          setAssets(modifiedAssets);
          const usdtObject = modifiedAssets.find(
            ({ asset }) => asset === "USDT",
          );
          if (usdtObject?.free !== "-") {
            setCapitalUSDT(Number(usdtObject.free));
          } else {
            setCapitalUSDT(0);
          }
        } else if (res.status === 403) return;
      })
      .finally(() => {
        setIsDataLoading(false);
      });
  }

  useEffect(() => {
    setIsDataLoading(true);
    getBalance();
    const interval = setInterval(getBalance, 10_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="assets"
      className="my-5 flex w-[1024px] items-center justify-between max-lg:w-[90vw]"
    >
      {/* Assets Table */}
      <div
        className="relative flex w-1/2 flex-col whitespace-nowrap rounded border-b-2 border-l border-primary/30 bg-background-3/70
          p-10 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm max-lg:w-full max-lg:p-6"
      >
        {/* Title */}
        <h3 className="mb-7 text-2xl font-bold">دارایی ها</h3>

        {/* Positions Table */}
        <table className="divide-y divide-table">
          <thead>
            <tr>
              {["ارز", "در دسترس", "فریز شده"].map((title, index) => (
                <th
                  key={index}
                  scope="col"
                  className="py-4 text-center text-sm font-medium text-neutral"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-table">
            {assets.map(({ asset, free, locked }) => (
              <tr
                key={asset}
                className="text-center text-sm font-medium *:py-4"
              >
                <td>{asset}</td>
                <td>{free}</td>
                <td>{locked}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {localStorage.getItem("isKeysValid") === "false" ? (
          <p className="my-5 text-wrap text-center text-gray-400">
            <span>لطفا برای مشاهده دارایی ها، ابتدا فرم</span>
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
          assets.length === 0 && (
            <p className="my-5 text-wrap text-center font-light text-gray-400">
              دارایی های شما خالی می باشد !
            </p>
          )
        )}
      </div>

      <img
        src={vaultImg}
        className="w-2/5 rounded-full border-b-2 border-l border-primary/30 shadow-[-5px_10px_25px] shadow-primary/10 max-lg:hidden"
      />
    </div>
  );
}
