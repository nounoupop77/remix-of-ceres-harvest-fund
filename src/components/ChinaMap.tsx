import { useState, useEffect } from "react";
import { Sun, CloudRain, Flame, Waves, Wind, Loader2 } from "lucide-react";
import chinaFarmlandMap from "@/assets/china-farmland-map.png";
import { supabase } from "@/integrations/supabase/client";

export type WeatherType = "sunny" | "rain" | "drought" | "flood" | "typhoon";

export interface MarketHotspot {
  id: string;
  city: string;
  province: string;
  weather: WeatherType;
  weatherStatus: string;
  crop: string;
  poolSize: number;
  position: { top: string; left: string };
  title: string;
  endDate: string;
}

// Map weather_condition from DB to WeatherType
const weatherConditionMap: Record<string, WeatherType> = {
  drought: "drought",
  flood: "flood",
  frost: "sunny",
  heatwave: "drought",
  storm: "typhoon",
  sunny: "sunny",
  rain: "rain",
  typhoon: "typhoon",
  pending: "sunny", // Default to sunny for pending markets
};

const weatherStatusMap: Record<string, string> = {
  drought: "干旱",
  flood: "洪涝",
  frost: "霜冻",
  heatwave: "高温",
  storm: "暴风雨",
  sunny: "晴朗",
  rain: "小雨",
  typhoon: "台风预警",
  pending: "开放预测",
};

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <Sun className="w-3 h-3" />,
  rain: <CloudRain className="w-3 h-3" />,
  drought: <Flame className="w-3 h-3" />,
  flood: <Waves className="w-3 h-3" />,
  typhoon: <Wind className="w-3 h-3" />,
};

const weatherLabels: Record<WeatherType, string> = {
  sunny: "晴天",
  rain: "小雨",
  drought: "干旱",
  flood: "暴雨/洪涝",
  typhoon: "台风",
};

const weatherBgColors: Record<WeatherType, string> = {
  sunny: "bg-weather-sunny",
  rain: "bg-weather-rain",
  drought: "bg-weather-drought",
  flood: "bg-weather-flood",
  typhoon: "bg-weather-typhoon",
};

const weatherBorderColors: Record<WeatherType, string> = {
  sunny: "border-weather-sunny",
  rain: "border-weather-rain",
  drought: "border-weather-drought",
  flood: "border-weather-flood",
  typhoon: "border-weather-typhoon",
};

const weatherPingColors: Record<WeatherType, string> = {
  sunny: "bg-weather-sunny/40",
  rain: "bg-weather-rain/40",
  drought: "bg-weather-drought/40",
  flood: "bg-weather-flood/40",
  typhoon: "bg-weather-typhoon/40",
};

// For backwards compatibility with BettingModal
export interface Province {
  id: string;
  name: string;
  weather: WeatherType;
  crop: string;
  poolSize: number;
  title?: string;
  city?: string;
  province?: string;
  endDate?: string;
}

interface ChinaMapProps {
  onProvinceClick: (province: Province) => void;
}

const ChinaMap = ({ onProvinceClick }: ChinaMapProps) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<MarketHotspot | null>(null);
  const [markets, setMarkets] = useState<MarketHotspot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      // Fetch markets with position data
      const { data: marketsData, error: marketsError } = await supabase
        .from("markets")
        .select("*")
        .eq("status", "active")
        .not("position_top", "is", null)
        .not("position_left", "is", null);

      if (marketsError || !marketsData) {
        setIsLoading(false);
        return;
      }

      // Fetch all bets to determine most-bet weather per market (by amount, not count)
      const { data: betsData } = await supabase
        .from("bets")
        .select("market_id, position, amount");

      // Calculate most-bet weather for each market based on total amount
      const weatherAmountByMarket: Record<string, Record<string, number>> = {};
      
      if (betsData) {
        betsData.forEach((bet) => {
          if (!weatherAmountByMarket[bet.market_id]) {
            weatherAmountByMarket[bet.market_id] = {};
          }
          // Position contains weather type like "sunny_yes", "rain_no", etc.
          const weatherType = bet.position.split("_")[0];
          weatherAmountByMarket[bet.market_id][weatherType] = 
            (weatherAmountByMarket[bet.market_id][weatherType] || 0) + bet.amount;
        });
      }

      const hotspots: MarketHotspot[] = marketsData.map((market) => {
        // Find most-bet weather for this market (by total amount)
        const weatherAmounts = weatherAmountByMarket[market.id] || {};
        let mostBetWeather = "sunny"; // default
        let maxAmount = 0;
        
        Object.entries(weatherAmounts).forEach(([weather, amount]) => {
          if (amount > maxAmount) {
            maxAmount = amount;
            mostBetWeather = weather;
          }
        });

        const weatherType = weatherConditionMap[mostBetWeather] || "sunny";
        const weatherStatus = maxAmount > 0 
          ? weatherStatusMap[mostBetWeather] || "开放预测"
          : "开放预测";

        return {
          id: market.id,
          city: market.city,
          province: market.province,
          weather: weatherType,
          weatherStatus: weatherStatus,
          crop: market.crop || "农作物",
          poolSize: market.yes_pool + market.no_pool,
          position: { top: market.position_top!, left: market.position_left! },
          title: market.title,
          endDate: market.end_date,
        };
      });
      setMarkets(hotspots);
      setIsLoading(false);
    };

    fetchMarkets();

    // Subscribe to realtime updates for both markets and bets
    const marketsChannel = supabase
      .channel("markets-map")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "markets" },
        () => fetchMarkets()
      )
      .subscribe();

    const betsChannel = supabase
      .channel("bets-map")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bets" },
        () => fetchMarkets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(marketsChannel);
      supabase.removeChannel(betsChannel);
    };
  }, []);

  const handleCityClick = (market: MarketHotspot) => {
    const province: Province = {
      id: market.id,
      name: market.city,
      weather: market.weather,
      crop: market.crop,
      poolSize: market.poolSize,
      title: market.title,
      city: market.city,
      province: market.province,
      endDate: market.endDate,
    };
    onProvinceClick(province);
  };

  if (isLoading) {
    return (
      <div className="relative w-full flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center">
      {/* Map Container */}
      <div className="relative w-full max-w-[65rem] aspect-[4/3]">
        {/* Background Map Image with warm paper filter */}
        <img
          src={chinaFarmlandMap}
          alt="China Farmland Map"
          className="w-full h-full object-contain scale-[1.3] origin-center"
          style={{ filter: "brightness(0.96) sepia(0.05)" }}
          draggable={false}
        />

        {/* Market Hotspots from database */}
        {markets.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">暂无活跃市场</p>
              <p className="text-xs text-muted-foreground/70 mt-1">请在后台创建博弈市场</p>
            </div>
          </div>
        ) : (
          markets.map((market) => (
            <div
              key={market.id}
              className="absolute"
              style={{
                top: market.position.top,
                left: market.position.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Ping animation layer */}
              <span
                className={`absolute inset-0 w-7 h-7 rounded-full ${weatherPingColors[market.weather]} animate-[ping-slow_3s_ease-in-out_infinite]`}
              />
              
              {/* Main hotspot button with drop-shadow */}
              <button
                className={`relative w-7 h-7 rounded-full
                  transition-all duration-300 border-[1.5px] backdrop-blur-sm
                  ${weatherBgColors[market.weather]} ${weatherBorderColors[market.weather]}
                  hover:scale-125 hover:shadow-lg cursor-pointer
                  flex items-center justify-center z-10
                  drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]
                `}
                onMouseEnter={() => setHoveredHotspot(market)}
                onMouseLeave={() => setHoveredHotspot(null)}
                onClick={() => handleCityClick(market)}
                aria-label={`${market.city} - ${market.weatherStatus}`}
              >
                {market.weather === "sunny" && <Sun className="w-3.5 h-3.5 text-foreground/80" />}
                {market.weather === "rain" && <CloudRain className="w-3.5 h-3.5 text-foreground/80" />}
                {market.weather === "drought" && <Flame className="w-3.5 h-3.5 text-foreground/80" />}
                {market.weather === "flood" && <Waves className="w-3.5 h-3.5 text-foreground/80" />}
                {market.weather === "typhoon" && <Wind className="w-3.5 h-3.5 text-foreground/80" />}
              </button>
            </div>
          ))
        )}

        {/* Tooltip */}
        {hoveredHotspot && (
          <div
            className="absolute z-50 pointer-events-none animate-fade-in"
            style={{
              top: `calc(${hoveredHotspot.position.top} - 6%)`,
              left: hoveredHotspot.position.left,
              transform: "translateX(-50%)",
            }}
          >
            <div className="glass rounded-xl p-3 shadow-medium min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${weatherBgColors[hoveredHotspot.weather]}`}
                >
                  {weatherIcons[hoveredHotspot.weather]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {hoveredHotspot.city} ({hoveredHotspot.province})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hoveredHotspot.crop}产区
                  </p>
                </div>
              </div>
              <div className="text-sm text-foreground/90 mb-2">
                当前状态：<span className="font-medium">{hoveredHotspot.weatherStatus}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">资金池</span>
                  <span className="font-medium text-accent">
                    ${(hoveredHotspot.poolSize / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2 pt-2 border-t border-border">
                点击开设博弈
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChinaMap;
export { weatherIcons, weatherLabels };
