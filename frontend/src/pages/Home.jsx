import AssetsTable from "../components/home/AssetsTable";
import BotSettings from "../components/home/BotSettings";
import CurrentPositionsTable from "../components/home/CurrentPositionsTable";
import Footer from "../components/home/Footer";
import Navbar from "../components/home/Navbar";
import PositionsHistoryTable from "../components/home/PositionsHistoryTable";

export default function Home() {
  return (
    <div className="bg-gradient-to-r from-background-2 to-background-1 text-white">
      <div className="flex flex-col items-center gap-2 overflow-x-hidden py-6">
        <Navbar />
        <AssetsTable />
        <CurrentPositionsTable />
        <BotSettings />
        <PositionsHistoryTable />
        <Footer />
      </div>
    </div>
  );
}
