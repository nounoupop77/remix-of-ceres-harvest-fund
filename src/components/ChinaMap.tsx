import { useState } from "react";
import { Sun, CloudRain, Flame, Waves, Wind } from "lucide-react";
import chinaFarmlandMap from "@/assets/china-farmland-map.png";

export type WeatherType = "sunny" | "rain" | "drought" | "flood" | "typhoon";

export interface CityHotspot {
  id: string;
  city: string;
  province: string;
  shortProvince: string;
  weather: WeatherType;
  weatherStatus: string;
  crop: string;
  poolSize: number;
  position: { top: string; left: string };
}

// 10 city hotspots with precise agricultural data
const cityHotspots: CityHotspot[] = [
  {
    id: "suihua",
    city: "绥化",
    province: "黑龙江",
    shortProvince: "黑龙江",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "玉米/大豆",
    poolSize: 380000,
    position: { top: "18%", left: "78%" },
  },
  {
    id: "zhumadian",
    city: "驻马店",
    province: "河南",
    shortProvince: "豫",
    weather: "drought",
    weatherStatus: "干旱",
    crop: "小麦/玉米",
    poolSize: 456000,
    position: { top: "42%", left: "58%" },
  },
  {
    id: "weifang",
    city: "潍坊",
    province: "山东",
    shortProvince: "鲁",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "蔬菜/小麦",
    poolSize: 320000,
    position: { top: "34%", left: "66%" },
  },
  {
    id: "fuyang",
    city: "阜阳",
    province: "安徽",
    shortProvince: "皖",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "小麦/水稻",
    poolSize: 275000,
    position: { top: "44%", left: "62%" },
  },
  {
    id: "changde",
    city: "常德",
    province: "湖南",
    shortProvince: "湘",
    weather: "flood",
    weatherStatus: "暴雨",
    crop: "水稻",
    poolSize: 198000,
    position: { top: "56%", left: "54%" },
  },
  {
    id: "chengdu",
    city: "成都",
    province: "四川",
    shortProvince: "川",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "水稻",
    poolSize: 156000,
    position: { top: "50%", left: "38%" },
  },
  {
    id: "shijiazhuang",
    city: "石家庄",
    province: "河北",
    shortProvince: "冀",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "小麦",
    poolSize: 290000,
    position: { top: "32%", left: "58%" },
  },
  {
    id: "hulunbuir",
    city: "呼伦贝尔",
    province: "内蒙古",
    shortProvince: "蒙",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "春小麦",
    poolSize: 210000,
    position: { top: "14%", left: "68%" },
  },
  {
    id: "shangrao",
    city: "上饶",
    province: "江西",
    shortProvince: "赣",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "水稻",
    poolSize: 165000,
    position: { top: "54%", left: "64%" },
  },
  {
    id: "zhanjiang",
    city: "湛江",
    province: "广东",
    shortProvince: "粤西",
    weather: "typhoon",
    weatherStatus: "台风预警",
    crop: "糖蔗/水稻",
    poolSize: 145000,
    position: { top: "74%", left: "52%" },
  },
];

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4" />,
  rain: <CloudRain className="w-4 h-4" />,
  drought: <Flame className="w-4 h-4" />,
  flood: <Waves className="w-4 h-4" />,
  typhoon: <Wind className="w-4 h-4" />,
};

const weatherLabels: Record<WeatherType, string> = {
  sunny: "晴天",
  rain: "小雨",
  drought: "干旱",
  flood: "暴雨/洪涝",
  typhoon: "台风",
};

const weatherBgColors: Record<WeatherType, string> = {
  sunny: "bg-weather-sunny/60",
  rain: "bg-weather-rain/60",
  drought: "bg-weather-drought/60",
  flood: "bg-weather-flood/60",
  typhoon: "bg-weather-typhoon/60",
};

const weatherBorderColors: Record<WeatherType, string> = {
  sunny: "border-weather-sunny",
  rain: "border-weather-rain",
  drought: "border-weather-drought",
  flood: "border-weather-flood",
  typhoon: "border-weather-typhoon",
};

// For backwards compatibility with BettingModal
export interface Province {
  id: string;
  name: string;
  weather: WeatherType;
  crop: string;
  poolSize: number;
}

interface ChinaMapProps {
  onProvinceClick: (province: Province) => void;
}

const ChinaMap = ({ onProvinceClick }: ChinaMapProps) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<CityHotspot | null>(null);

  const handleCityClick = (city: CityHotspot) => {
    // Convert to Province format for backwards compatibility
    const province: Province = {
      id: city.id,
      name: city.city,
      weather: city.weather,
      crop: city.crop,
      poolSize: city.poolSize,
    };
    onProvinceClick(province);
  };

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

        {/* City Hotspots */}
        {cityHotspots.map((city) => (
          <button
            key={city.id}
            className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-full cursor-pointer
              transition-all duration-300 border-2 backdrop-blur-sm
              ${weatherBgColors[city.weather]} ${weatherBorderColors[city.weather]}
              hover:scale-110 hover:shadow-lg hover:shadow-${city.weather}/30
              flex items-center justify-center
            `}
            style={{
              top: city.position.top,
              left: city.position.left,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredHotspot(city)}
            onMouseLeave={() => setHoveredHotspot(null)}
            onClick={() => handleCityClick(city)}
            aria-label={`${city.city} - ${city.weatherStatus}`}
          >
            {city.weather === "sunny" && <Sun className="w-5 h-5 md:w-6 md:h-6 text-foreground/80" />}
            {city.weather === "rain" && <CloudRain className="w-5 h-5 md:w-6 md:h-6 text-foreground/80" />}
            {city.weather === "drought" && <Flame className="w-5 h-5 md:w-6 md:h-6 text-foreground/80" />}
            {city.weather === "flood" && <Waves className="w-5 h-5 md:w-6 md:h-6 text-foreground/80" />}
            {city.weather === "typhoon" && <Wind className="w-5 h-5 md:w-6 md:h-6 text-foreground/80" />}
          </button>
        ))}

        {/* Tooltip */}
        {hoveredHotspot && (
          <div
            className="absolute z-50 pointer-events-none animate-fade-in"
            style={{
              top: `calc(${hoveredHotspot.position.top} - 8%)`,
              left: hoveredHotspot.position.left,
              transform: "translateX(-50%)",
            }}
          >
            <div className="glass rounded-xl p-3 shadow-medium min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    hoveredHotspot.weather === "sunny"
                      ? "bg-weather-sunny"
                      : hoveredHotspot.weather === "rain"
                      ? "bg-weather-rain"
                      : hoveredHotspot.weather === "drought"
                      ? "bg-weather-drought"
                      : hoveredHotspot.weather === "flood"
                      ? "bg-weather-flood"
                      : "bg-weather-typhoon"
                  }`}
                >
                  {weatherIcons[hoveredHotspot.weather]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {hoveredHotspot.city} ({hoveredHotspot.shortProvince})
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

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass rounded-xl p-3 shadow-soft">
          <p className="text-xs font-medium text-foreground mb-2">图例</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {(Object.keys(weatherLabels) as WeatherType[]).map((weather) => (
              <div key={weather} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-sm ${
                    weather === "sunny"
                      ? "bg-weather-sunny"
                      : weather === "rain"
                      ? "bg-weather-rain"
                      : weather === "drought"
                      ? "bg-weather-drought"
                      : weather === "flood"
                      ? "bg-weather-flood"
                      : "bg-weather-typhoon"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {weatherLabels[weather]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChinaMap;
export { weatherIcons, weatherLabels, cityHotspots };
