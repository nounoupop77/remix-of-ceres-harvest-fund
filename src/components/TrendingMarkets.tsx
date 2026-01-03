import { Flame, TrendingUp, Sun, CloudRain, Wind, Waves } from "lucide-react";
import { Province, WeatherType } from "./ChinaMap";

interface TrendingMarketsProps {
  onMarketClick: (province: Province) => void;
}

const trendingMarkets: {
  province: Province;
  trend: "up" | "down";
  change: number;
}[] = [
  {
    province: {
      id: "henan",
      name: "河南",
      weather: "drought",
      crop: "玉米",
      poolSize: 456000,
    },
    trend: "up",
    change: 23,
  },
  {
    province: {
      id: "zhejiang",
      name: "浙江",
      weather: "typhoon",
      crop: "茶叶",
      poolSize: 345000,
    },
    trend: "up",
    change: 18,
  },
  {
    province: {
      id: "shaanxi",
      name: "陕西",
      weather: "drought",
      crop: "小麦",
      poolSize: 312000,
    },
    trend: "down",
    change: 5,
  },
  {
    province: {
      id: "hubei",
      name: "湖北",
      weather: "flood",
      crop: "水稻",
      poolSize: 289000,
    },
    trend: "up",
    change: 12,
  },
  {
    province: {
      id: "fujian",
      name: "福建",
      weather: "typhoon",
      crop: "水稻",
      poolSize: 267000,
    },
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
  sunny: "晴天预报",
  rain: "降雨预警",
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

const TrendingMarkets = ({ onMarketClick }: TrendingMarketsProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-serif font-semibold text-foreground">
              热门博弈
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">(Trending)</span>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {trendingMarkets.map((market) => (
            <div
              key={market.province.id}
              onClick={() => onMarketClick(market.province)}
              className="flex-shrink-0 w-64 bg-card rounded-2xl p-4 border border-border shadow-soft hover:shadow-medium transition-all cursor-pointer hover:-translate-y-1 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    weatherBgColors[market.province.weather]
                  }`}
                >
                  <div className={weatherIconColors[market.province.weather]}>
                    {weatherIcons[market.province.weather]}
                  </div>
                </div>
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
              <div className="mb-3">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {market.province.name} ·{" "}
                  {weatherLabels[market.province.weather]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  主要作物: {market.province.crop}
                </p>
              </div>

              {/* Pool Info */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">资金池</span>
                <span className="text-sm font-semibold text-accent">
                  ${(market.province.poolSize / 1000).toFixed(0)}K
                </span>
              </div>

              {/* Odds Preview */}
              <div className="mt-2 flex gap-2">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingMarkets;
