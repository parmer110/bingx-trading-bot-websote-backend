import { useContext, useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import SignupForm from "./SignupForm"; // Import the SignupForm component
import { axiosBase } from "../../api/axios";
import { AppContext } from "../../context/AppContext";
import { UserContext } from "../../context/UserContext";

export default function SignupLoginCard() {
  const { setAppState } = useContext(AppContext);
  const { user, setUser } = useContext(UserContext);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsFormSubmitting(true);
    try {
      const response = await axiosBase.post("/auth/login", formData);
      const { phoneNumber } = response.data; // Assuming the response contains user's phone number
      setUser({ phoneNumber });
      localStorage.setItem("phoneNumber", phoneNumber);
      setAppState("otp");
    } catch (error) {
      console.error("Error logging in:", error);
      // Handle errors here
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="grid h-80 w-96 place-items-center rounded bg-white px-10 max-md:absolute max-md:top-[30vh] max-md:w-[350px]">
      <form className="grid gap-8" onSubmit={handleFormSubmit}>
        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">ورود</h3>
          <p className="text-xs">لطفا نام کاربری و رمز عبور خود را وارد کنید.</p>
        </div>

        {/* Username Input */}
        <div>
          <input
            type="text"
            name="username"
            placeholder="نام کاربری"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg bg-gray-100 p-2 shadow-inner transition-colors hover:bg-gray-200 focus:outline-bullish"
          />
        </div>

        {/* Password Input */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="رمز عبور"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full rounded-lg bg-gray-100 p-2 shadow-inner transition-colors hover:bg-gray-200 focus:outline-bullish"
          />
        </div>

        {/* Submit Button */}
        <div className="flex w-full flex-col gap-3">
          <button
            type="submit"
            className="rounded-lg bg-background-1 px-10 py-2 font-medium text-white transition-colors hover:bg-background-3 disabled:bg-background-3/50"
            disabled={isFormSubmitting}
          >
            {isFormSubmitting ? "در حال ورود..." : "ورود"}
          </button>
        </div>

        {/* Signup Link */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            حساب کاربری ندارید؟{" "}
            <button
              type="button"
              onClick={() => setAppState("signup")}
              className="text-primary underline focus:outline-bullish"
            >
              ثبت نام
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
