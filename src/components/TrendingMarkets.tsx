import { motion } from "framer-motion";
import { Flame, TrendingUp, Sun, CloudRain, Wind, Waves } from "lucide-react";
import { Province, WeatherType } from "./ChinaMap";
import AnimatedCounter from "./AnimatedCounter";

interface TrendingMarketsProps {
  onMarketClick: (province: Province) => void;
}

const trendingMarkets: {
  province: Province;
  city: string;
  provinceName: string;
  trend: "up" | "down";
  change: number;
}[] = [
  {
    province: {
      id: "zhumadian",
      name: "驻马店",
      weather: "drought",
      crop: "小麦/玉米",
      poolSize: 456000,
    },
    city: "驻马店",
    provinceName: "河南",
    trend: "up",
    change: 23,
  },
  {
    province: {
      id: "zhanjiang",
      name: "湛江",
      weather: "typhoon",
      crop: "糖蔗/水稻",
      poolSize: 345000,
    },
    city: "湛江",
    provinceName: "广东",
    trend: "up",
    change: 18,
  },
  {
    province: {
      id: "changde",
      name: "常德",
      weather: "flood",
      crop: "水稻",
      poolSize: 312000,
    },
    city: "常德",
    provinceName: "湖南",
    trend: "down",
    change: 5,
  },
  {
    province: {
      id: "harbin",
      name: "哈尔滨",
      weather: "sunny",
      crop: "玉米/大豆",
      poolSize: 289000,
    },
    city: "哈尔滨",
    provinceName: "黑龙江",
    trend: "up",
    change: 12,
  },
  {
    province: {
      id: "chengdu",
      name: "成都",
      weather: "rain",
      crop: "水稻/油菜",
      poolSize: 267000,
    },
    city: "成都",
    provinceName: "四川",
    trend: "up",
    change: 31,
  },
];

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <Sun className="w-5 h-5" />,
  rain: <CloudRain className="w-5 h-5" />,
  drought: <Flame className="w-5 h-5" />,
  flood: <Waves className="w-5 h-5" />,
  typhoon: <Wind className="w-5 h-5" />,
};

const weatherLabels: Record<WeatherType, string> = {
  sunny: "气象平稳",
  rain: "持续小雨",
  drought: "干旱预警",
  flood: "洪涝预警",
  typhoon: "台风预警",
};

const weatherBgColors: Record<WeatherType, string> = {
  sunny: "bg-weather-sunny/20",
  rain: "bg-weather-rain/20",
  drought: "bg-weather-drought/20",
  flood: "bg-weather-flood/20",
  typhoon: "bg-weather-typhoon/20",
};

const weatherIconColors: Record<WeatherType, string> = {
  sunny: "text-weather-sunny",
  rain: "text-weather-rain",
  drought: "text-weather-drought",
  flood: "text-weather-flood",
  typhoon: "text-weather-typhoon",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.8,
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
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
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
          {trendingMarkets.map((market, index) => (
            <motion.div
              key={market.province.id}
              variants={cardVariants}
              onClick={() => onMarketClick(market.province)}
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
                  className={`p-2.5 rounded-xl ${weatherBgColors[market.province.weather]}`}
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
                  <div className={weatherIconColors[market.province.weather]}>
                    {weatherIcons[market.province.weather]}
                  </div>
                </motion.div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    market.trend === "up" ? "text-accent" : "text-destructive"
                  }`}
                >
                  <TrendingUp
                    className={`w-4 h-4 ${
                      market.trend === "down" ? "rotate-180" : ""
                    }`}
                  />
                  {market.change}%
                </div>
              </div>

              {/* Content */}
              <div className="mb-3 relative z-10">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {market.city} ({market.provinceName}) · {weatherLabels[market.province.weather]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  主要作物: {market.province.crop}
                </p>
              </div>

              {/* Pool Info */}
              <div className="flex items-center justify-between pt-3 border-t border-border relative z-10">
                <span className="text-xs text-muted-foreground">资金池</span>
                <span className="text-sm font-semibold text-accent">
                  <AnimatedCounter
                    value={market.province.poolSize / 1000}
                    prefix="$"
                    suffix="K"
                    duration={1.5 + index * 0.2}
                  />
                </span>
              </div>

              {/* Odds Preview */}
              <div className="mt-2 flex gap-2 relative z-10">
                <div className="flex-1 text-center py-1.5 bg-accent/10 rounded-lg">
                  <span className="text-xs font-medium text-accent">
                    YES 2.35x
                  </span>
                </div>
                <div className="flex-1 text-center py-1.5 bg-destructive/10 rounded-lg">
                  <span className="text-xs font-medium text-destructive">
                    NO 1.85x
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingMarkets;
