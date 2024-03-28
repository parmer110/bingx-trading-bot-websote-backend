import ownerPicture from "../../assets/images/owner-picture.svg";

export default function Footer() {
  return (
    <div className="max-lg:w-[90vw] my-10 flex w-[1024px] flex-col items-center justify-center max-lg:mb-32">
      {/* Owner Picture */}
      <img src={ownerPicture} className="-mb-7 drop-shadow-[0_0_5px_#243B55]" />

      {/* Card */}
      <svg
        width="291"
        height="220"
        viewBox="0 0 291 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 259C7.16344 259 0 251.837 0 243V16C0 7.16345 7.16345 0 16 0H68.3764C83.6937 0 96.1914 13.7977 107.158 24.4909C116.326 33.4294 130.32 39.1416 146 39.1416C161.68 39.1416 175.674 33.4294 184.842 24.4909C195.809 13.7977 208.306 0 223.624 0H275C283.837 0 291 7.16344 291 16V243C291 251.837 283.837 259 275 259H16Z"
          fill="#132031"
        />
      </svg>

      {/* Owner Info. */}
      <div className="-mt-40 grid w-full place-items-center gap-3 font-semibold">
        <span className="text-gray-400">مدیر وبسایت</span>
        <h6 dir="ltr">جناب آقای حسین الماسی</h6>
        <span className="text-gray-400">شماره تماس</span>
        <h6 dir="ltr">+98 937 153 2160</h6>
      </div>
    </div>
  );
}
