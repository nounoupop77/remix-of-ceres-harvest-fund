import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ChinaMap, { Province } from "@/components/ChinaMap";
import BettingModal from "@/components/BettingModal";
import CharityDrawer from "@/components/CharityDrawer";
import HistoryDrawer from "@/components/HistoryDrawer";
import TrendingMarkets from "@/components/TrendingMarkets";
import FundParticle from "@/components/FundParticle";
import BokehBackground from "@/components/BokehBackground";
import { Sprout } from "lucide-react";

const Index = () => {
  const [charityOpen, setCharityOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [showParticle, setShowParticle] = useState(false);
  const [charityPoolAmount, setCharityPoolAmount] = useState(128);
  const charityButtonRef = useRef<HTMLButtonElement>(null);

  const handleProvinceClick = (province: Province) => {
    setSelectedProvince(province);
    setBettingOpen(true);
  };

  const handleBetConfirm = useCallback((amount: number) => {
    // Trigger the fund particle animation
    setShowParticle(true);
    
    // Update charity pool after particle animation
    setTimeout(() => {
      const donation = amount * 0.01; // 1% donation
      setCharityPoolAmount((prev) => prev + donation / 1000); // Convert to K
    }, 1200);
  }, []);

  const handleParticleComplete = useCallback(() => {
    setShowParticle(false);
  }, []);

  return (
    <>
      <Helmet>
        <title>Ceres · 息壤 | Web3 ReFi 再生金融 DApp</title>
        <meta name="description" content="Gamble for Greed, Pay for Need - 利用天气预测市场的博弈收益资助农业灾害救助的去中心化应用" />
      </Helmet>

      {/* Bokeh Background */}
      <BokehBackground />

      {/* Fund Particle Animation */}
      <FundParticle
        isActive={showParticle}
        onComplete={handleParticleComplete}
      />

      <div className="min-h-screen gradient-cream relative z-10">
        {/* Navbar */}
        <Navbar
          onOpenCharity={() => setCharityOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
          charityPoolAmount={charityPoolAmount}
          charityButtonRef={charityButtonRef}
        />

        {/* Hero Section */}
        <main className="pt-20 pb-8">
          {/* Hero Header */}
          <section className="container mx-auto px-4 py-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full mb-4"
            >
              <Sprout className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-secondary-foreground">
                Web3 再生金融 · ReFi
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3"
            >
              天气博弈，助农公益
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto"
            >
              <span className="text-primary font-medium">Gamble for Greed</span>
              <span className="mx-2">·</span>
              <span className="text-accent font-medium">Pay for Need</span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto"
            >
              点击地图选择省份，预测天气变化，博弈收益的 1% 将自动捐赠至助农资金池
            </motion.p>
          </section>

          {/* China Map */}
          <section className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card/50 rounded-3xl border border-border shadow-soft p-4 sm:p-6 backdrop-blur-sm"
            >
              <ChinaMap onProvinceClick={handleProvinceClick} />
            </motion.div>
          </section>

          {/* Trending Markets */}
          <TrendingMarkets onMarketClick={handleProvinceClick} />
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="border-t border-border py-6 text-center"
        >
          <div className="container mx-auto px-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Ceres · 息壤 — 去中心化农业再生金融协议
            </p>
            <p className="text-xs mt-1 text-primary">Created By:  @C87938xiaochong & @bzdjiaosm_xiao7</p>
          </div>
        </motion.footer>

        {/* Modals & Drawers */}
        <BettingModal
          province={selectedProvince}
          open={bettingOpen}
          onOpenChange={setBettingOpen}
          onBetConfirm={handleBetConfirm}
        />
        <CharityDrawer open={charityOpen} onOpenChange={setCharityOpen} />
        <HistoryDrawer open={historyOpen} onOpenChange={setHistoryOpen} />
      </div>
    </>
  );
};

export default Index;
