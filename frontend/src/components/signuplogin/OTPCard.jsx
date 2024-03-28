import { useContext, useState } from "react";
import Countdown from "react-countdown";
import { ImSpinner2 } from "react-icons/im";
import { PiArrowClockwise } from "react-icons/pi";
import OTPInput from "react-otp-input";
import { axiosBase } from "../../api/axios";
import { AppContext } from "../../context/AppContext";
import { UserContext } from "../../context/UserContext";

export default function OTPCard() {
  const { setAppState } = useContext(AppContext);
  const { user } = useContext(UserContext);
  const [otp, setOtp] = useState("");
  const [isOTPValid, setIsOTPValid] = useState(false);
  const [otpInputErrorMsg, setOtpInputErrorMsg] = useState("");
  const [canResendCode, setCanResendCode] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [countdownTimeDelta, setCountdownTimeDelta] = useState(
    Date.now() + 60_000,
  );

  function handleOTPValidation(value) {
    setOtp(value);
    if (/^\d{6}$/.test(value)) {
      setOtpInputErrorMsg("کد تایید معتبر است.");
      setIsOTPValid(true);
    } else {
      setOtpInputErrorMsg("کد تایید کوتاه است!");
      setIsOTPValid(false);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsFormSubmitting(true);
    await axiosBase
      .post(
        "/auth/otp/validate",
        {},
        { params: { phone_number: "0" + user.phoneNumber, otp: otp } },
      )
      .then((res) => {
        if (res.status === 200) {
          setAppState("home");
          const { access_token, refresh_token } = res.data;
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("refreshToken", refresh_token);
          if (!localStorage.getItem("isKeysValid")) {
            localStorage.setItem("isKeysValid", false);
          }
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setOtpInputErrorMsg("سرویس دارای مشکل است! لطفا بعدا امتحان کنید...");
          setIsOTPValid(false);
        } else if (err.response && err.response.status === 410) {
          setOtpInputErrorMsg("کد تایید منقضی شده است.");
          setIsOTPValid(false);
        } else if (err.response && err.response.status === 401) {
          setOtpInputErrorMsg("کد تایید اشتباه است.");
          setIsOTPValid(false);
        }
      });
    setIsFormSubmitting(false);
  };

  const resendOTPCode = async () => {
    await axiosBase.post(
      "/auth/otp/generate",
      {},
      { params: { phone_number: "0" + user.phoneNumber } },
    );
  };

  function handleResendCodeClick() {
    setCanResendCode(false);
    setCountdownTimeDelta(Date.now() + 60_000);
    setOtp("");
    setOtpInputErrorMsg("لطفا کد جدید را وارد کنید.");
    setIsOTPValid(true);
    resendOTPCode();
  }

  return (
    <div className="flex h-80 w-96 flex-col justify-center rounded bg-white px-10 max-md:absolute max-md:top-[30vh] max-md:w-[350px]">
      {/* OTP Form */}
      <form className="grid gap-10" onSubmit={(e) => handleSubmit(e)}>
        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">ارسال کد تایید</h3>
          <div className="text-xs">
            <span className="ml-2">{user.phoneNumber}</span>
            <a
              className="cursor-pointer text-primary transition-all hover:text-secondary active:text-primary"
              onClick={() => setAppState("login")}
            >
              ویرایش
            </a>
          </div>
        </div>

        {/* OTP Input */}
        <div>
          {/* Input */}
          <div className="flex gap-1 text-sm font-semibold" dir="ltr">
            <OTPInput
              containerStyle="flex w-full justify-between"
              inputStyle="h-10 min-w-10 rounded-lg bg-gray-100 shadow-inner transition-colors hover:bg-gray-200 focus:outline-primary"
              numInputs={6}
              value={otp}
              onChange={handleOTPValidation}
              required
              renderInput={(props) => <input {...props} />}
            />
          </div>

          {/* Input Error Message */}
          <div
            className={`mt-2 text-right text-xs ${isOTPValid ? "text-bullish" : "text-bearish"}`}
          >
            {otpInputErrorMsg}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          {/* Description */}
          <div className="text-center text-xs text-gray-500">
            {canResendCode ? (
              <a
                className="flex cursor-pointer justify-center gap-1 text-primary hover:text-secondary"
                onClick={handleResendCodeClick}
              >
                <span>ارسال مجدد کد</span>
                <PiArrowClockwise />
              </a>
            ) : (
              <div>
                <span>ارسال مجدد کد تا </span>
                <Countdown
                  date={countdownTimeDelta}
                  renderer={({ minutes, seconds }) => (
                    <span>
                      {minutes.toString().padStart(2, "0")}:
                      {seconds.toString().padStart(2, "0")}
                    </span>
                  )}
                  onComplete={() => setCanResendCode(true)}
                />
              </div>
            )}
          </div>

          {/* Enter Button */}
          <button
            type="submit"
            className="rounded-lg bg-background-1 px-10 py-2 font-medium text-white transition-colors hover:bg-background-3 active:bg-background-2 disabled:bg-background-3/50"
            disabled={!isOTPValid || isFormSubmitting}
          >
            {isFormSubmitting ? (
              <ImSpinner2 className="mx-auto h-6 w-6 animate-spin" />
            ) : (
              <span>ورود</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
