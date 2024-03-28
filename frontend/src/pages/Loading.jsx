import { ImSpinner2 } from "react-icons/im";

export default function Loading() {
  return (
    <div className="grid h-screen w-screen place-items-center bg-gradient-to-r from-background-3 to-background-1">
      <ImSpinner2 className="h-20 w-20 animate-spin text-secondary drop-shadow-[0_0_3px_yellow]" />
    </div>
  );
}
