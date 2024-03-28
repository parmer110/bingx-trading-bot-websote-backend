// eslint-disable-next-line react/prop-types
export default function NotificationsIcon({ stroke, ping }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 5.36667V8.14167"
        stroke={stroke}
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M10.0166 1.66667C6.94992 1.66667 4.46658 4.15 4.46658 7.21667V8.96667C4.46658 9.53334 4.23325 10.3833 3.94158 10.8667L2.88325 12.6333C2.23325 13.725 2.68325 14.9417 3.88325 15.3417C7.86658 16.6667 12.1749 16.6667 16.1582 15.3417C17.2832 14.9667 17.7666 13.65 17.1582 12.6333L16.0999 10.8667C15.8082 10.3833 15.5749 9.52501 15.5749 8.96667V7.21667C15.5666 4.16667 13.0666 1.66667 10.0166 1.66667Z"
        stroke={stroke}
        strokeWidth="1.25"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M12.7751 15.6833C12.7751 17.2083 11.5251 18.4583 10.0001 18.4583C9.24176 18.4583 8.54176 18.1417 8.04176 17.6417C7.54176 17.1417 7.2251 16.4417 7.2251 15.6833"
        stroke={stroke}
        strokeWidth="1.25"
        strokeMiterlimit="10"
      />
      {ping ? (
        <>
          <rect
            x="11.6668"
            y="0.833333"
            width="7.5"
            height="7.5"
            rx="3.75"
            fill="#CFB53B"
          />
          <rect
            x="11.6668"
            y="0.833333"
            width="7.5"
            height="7.5"
            rx="3.75"
            stroke="#151924"
            strokeWidth="1.66667"
          />
        </>
      ) : null}
    </svg>
  );
}
