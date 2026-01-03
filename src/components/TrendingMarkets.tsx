import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Sun, CloudRain, Wind, Waves, Loader2 } from "lucide-react";
import { WeatherType } from "./ChinaMap";
import AnimatedCounter from "./AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";

interface TrendingMarketsProps {
  onMarketClick: (market: TrendingMarket) => void;
}

export interface TrendingMarket {
  id: string;
  title: string;
  city: string;
  province: string;
  weather_condition: string;
  yes_pool: number;
  no_pool: number;
  end_date: string;
  status: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-5 h-5" />,
  rain: <CloudRain className="w-5 h-5" />,
  drought: <Flame className="w-5 h-5" />,
  flood: <Waves className="w-5 h-5" />,
  typhoon: <Wind className="w-5 h-5" />,
  frost: <CloudRain className="w-5 h-5" />,
  heatwave: <Sun className="w-5 h-5" />,
  storm: <CloudRain className="w-5 h-5" />,
  pending: <TrendingUp className="w-5 h-5" />,
};

const weatherLabels: Record<string, string> = {
  sunny: "气象平稳",
  rain: "持续小雨",
  drought: "干旱预警",
  flood: "洪涝预警",
  typhoon: "台风预警",
  frost: "霜冻预警",
  heatwave: "高温预警",
  storm: "暴风雨预警",
  pending: "开放预测",
};

const weatherBgColors: Record<string, string> = {
  sunny: "bg-weather-sunny/20",
  rain: "bg-weather-rain/20",
  drought: "bg-weather-drought/20",
  flood: "bg-weather-flood/20",
  typhoon: "bg-weather-typhoon/20",
  frost: "bg-weather-rain/20",
  heatwave: "bg-weather-sunny/20",
  storm: "bg-weather-rain/20",
  pending: "bg-primary/20",
};

const weatherIconColors: Record<string, string> = {
  sunny: "text-weather-sunny",
  rain: "text-weather-rain",
  drought: "text-weather-drought",
  flood: "text-weather-flood",
  typhoon: "text-weather-typhoon",
  frost: "text-weather-rain",
  heatwave: "text-weather-sunny",
  storm: "text-weather-rain",
  pending: "text-primary",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const TrendingMarkets = ({ onMarketClick }: TrendingMarketsProps) => {
  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("id, title, city, province, weather_condition, yes_pool, no_pool, end_date, status")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setMarkets(data);
      }
      setIsLoading(false);
    };

    fetchMarkets();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (markets.length === 0) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-serif font-semibold text-foreground">
                热门博弈
              </h2>
            </div>
            <span className="text-sm text-muted-foreground">(Trending)</span>
          </div>
          <div className="text-center text-muted-foreground py-8">
            暂无进行中的博弈市场，请等待管理员创建
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              热门博弈
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">(Trending)</span>
        </motion.div>

        {/* Horizontal Scrolling Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        >
          {markets.map((market, index) => {
            const totalPool = market.yes_pool + market.no_pool;
            const yesPercent = totalPool > 0 ? Math.round((market.yes_pool / totalPool) * 100) : 50;
            const noPercent = 100 - yesPercent;
            const yesOdds = market.yes_pool > 0 ? (totalPool / market.yes_pool).toFixed(2) : "2.00";
            const noOdds = market.no_pool > 0 ? (totalPool / market.no_pool).toFixed(2) : "2.00";
            const weather = market.weather_condition as WeatherType;

            return (
              <motion.div
                key={market.id}
                variants={cardVariants}
                onClick={() => onMarketClick(market)}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                className="flex-shrink-0 w-64 bg-card rounded-2xl p-4 border border-border shadow-soft cursor-pointer group relative overflow-hidden"
                style={{
                  boxShadow: "0 4px 20px -4px hsl(var(--primary) / 0.08)",
                }}
              >
                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at center, hsl(var(--accent) / 0.08) 0%, transparent 70%)",
                  }}
                />

                {/* Header */}
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <motion.div
                    className={`p-2.5 rounded-xl ${weatherBgColors[weather] || "bg-muted"}`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  >
                    <div className={weatherIconColors[weather] || "text-muted-foreground"}>
                      {weatherIcons[weather] || <Sun className="w-5 h-5" />}
                    </div>
                  </motion.div>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent">
                    <TrendingUp className="w-4 h-4" />
                    {yesPercent}%
                  </div>
                </div>

                {/* Content */}
                <div className="mb-3 relative z-10">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {market.city} ({market.province}) · {weatherLabels[weather] || market.weather_condition}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {market.title}
                  </p>
                </div>

                {/* Pool Info */}
                <div className="flex items-center justify-between pt-3 border-t border-border relative z-10">
                  <span className="text-xs text-muted-foreground">资金池</span>
                  <span className="text-sm font-semibold text-accent">
                    <AnimatedCounter
                      value={totalPool}
                      prefix="$"
                      suffix=""
                      duration={1.5 + index * 0.2}
                    />
                  </span>
                </div>

                {/* Odds Preview */}
                <div className="mt-2 flex gap-2 relative z-10">
                  <div className="flex-1 text-center py-1.5 bg-accent/10 rounded-lg">
                    <span className="text-xs font-medium text-accent">
                      YES {yesOdds}x
                    </span>
                  </div>
                  <div className="flex-1 text-center py-1.5 bg-destructive/10 rounded-lg">
                    <span className="text-xs font-medium text-destructive">
                      NO {noOdds}x
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingMarkets;
