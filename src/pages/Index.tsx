import { useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import ChinaMap, { Province } from "@/components/ChinaMap";
import BettingModal from "@/components/BettingModal";
import CharityDrawer from "@/components/CharityDrawer";
import HistoryDrawer from "@/components/HistoryDrawer";
import TrendingMarkets from "@/components/TrendingMarkets";
import { Sprout } from "lucide-react";
const Index = () => {
  const [charityOpen, setCharityOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province);
    setBettingOpen(true);
  };
  return <>
      <Helmet>
        <title>Ceres · 息壤 | Web3 ReFi 再生金融 DApp</title>
        <meta name="description" content="Gamble for Greed, Pay for Need - 利用天气预测市场的博弈收益资助农业灾害救助的去中心化应用" />
      </Helmet>

      <div className="min-h-screen gradient-cream">
        {/* Navbar */}
        <Navbar onOpenCharity={() => setCharityOpen(true)} onOpenHistory={() => setHistoryOpen(true)} />

        {/* Hero Section */}
        <main className="pt-20 pb-8">
          {/* Hero Header */}
          <section className="container mx-auto px-4 py-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full mb-4 animate-fade-in">
              <Sprout className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                Web3 再生金融 · ReFi
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 animate-fade-in">
              天气博弈，助农公益
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto animate-fade-in">
              <span className="text-primary font-medium">Gamble for Greed</span>
              <span className="mx-2">·</span>
              <span className="text-accent font-medium">Pay for Need</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">点击地图选择省份，预测天气变化，博弈收益的 1% 将自动捐赠至助农资金池</p>
          </section>

          {/* China Map */}
          <section className="container mx-auto px-4">
            <div className="bg-card/50 rounded-3xl border border-border shadow-soft p-4 sm:p-6 backdrop-blur-sm">
              <ChinaMap onProvinceClick={handleProvinceClick} />
            </div>
          </section>

          {/* Trending Markets */}
          <TrendingMarkets onMarketClick={handleProvinceClick} />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center">
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Ceres · 息壤 — 去中心化农业再生金融协议
            </p>
            <p className="text-xs mt-1 text-primary">Created By: 
@C87938xiaochong</p>
          </div>
        </footer>

        {/* Modals & Drawers */}
        <BettingModal province={selectedProvince} open={bettingOpen} onOpenChange={setBettingOpen} />
        <CharityDrawer open={charityOpen} onOpenChange={setCharityOpen} />
        <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} />
      </div>
    </>;
};
export default Index;