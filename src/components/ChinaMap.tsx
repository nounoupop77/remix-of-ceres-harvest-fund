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

// 20 city hotspots with corrected geographic coordinates (shifted left & up)
const cityHotspots: CityHotspot[] = [
  // 东北组 (黑土地)
  {
    id: "hulunbuir",
    city: "呼伦贝尔",
    province: "内蒙古",
    shortProvince: "蒙",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "春小麦",
    poolSize: 210000,
    position: { top: "16%", left: "65%" },
  },
  {
    id: "harbin",
    city: "哈尔滨",
    province: "黑龙江",
    shortProvince: "黑",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "水稻/大豆",
    poolSize: 420000,
    position: { top: "24%", left: "72%" },
  },
  {
    id: "suihua",
    city: "绥化",
    province: "黑龙江",
    shortProvince: "黑",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "玉米/大豆",
    poolSize: 380000,
    position: { top: "21%", left: "70%" },
  },
  {
    id: "changchun",
    city: "长春",
    province: "吉林",
    shortProvince: "吉",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "玉米",
    poolSize: 350000,
    position: { top: "28%", left: "70%" },
  },
  // 华北/中原组 (旱地之魂)
  {
    id: "shijiazhuang",
    city: "石家庄",
    province: "河北",
    shortProvince: "冀",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "小麦",
    poolSize: 290000,
    position: { top: "40%", left: "58%" },
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
    position: { top: "41%", left: "64%" },
  },
  {
    id: "dezhou",
    city: "德州",
    province: "山东",
    shortProvince: "鲁",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "小麦/玉米",
    poolSize: 280000,
    position: { top: "43%", left: "61%" },
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
    position: { top: "50%", left: "57%" },
  },
  {
    id: "nanyang",
    city: "南阳",
    province: "河南",
    shortProvince: "豫",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "小麦",
    poolSize: 310000,
    position: { top: "53%", left: "55%" },
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
    position: { top: "54%", left: "60%" },
  },
  // 南方/长江组 (水田带)
  {
    id: "chengdu",
    city: "成都",
    province: "四川",
    shortProvince: "川",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "水稻",
    poolSize: 156000,
    position: { top: "63%", left: "42%" },
  },
  {
    id: "xiangyang",
    city: "襄阳",
    province: "湖北",
    shortProvince: "鄂",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "小麦/水稻",
    poolSize: 245000,
    position: { top: "58%", left: "54%" },
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
    position: { top: "67%", left: "53%" },
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
    position: { top: "69%", left: "63%" },
  },
  {
    id: "ganzhou",
    city: "赣州",
    province: "江西",
    shortProvince: "赣",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "水稻/脐橙",
    poolSize: 185000,
    position: { top: "75%", left: "59%" },
  },
  {
    id: "yancheng",
    city: "盐城",
    province: "江苏",
    shortProvince: "苏",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "水稻",
    poolSize: 295000,
    position: { top: "52%", left: "67%" },
  },
  // 华南/西部组
  {
    id: "zhanjiang",
    city: "湛江",
    province: "广东",
    shortProvince: "粤西",
    weather: "typhoon",
    weatherStatus: "台风预警",
    crop: "糖蔗/水稻",
    poolSize: 145000,
    position: { top: "83%", left: "54%" },
  },
  {
    id: "maoming",
    city: "茂名",
    province: "广东",
    shortProvince: "粤",
    weather: "typhoon",
    weatherStatus: "台风预警",
    crop: "荔枝/水稻",
    poolSize: 135000,
    position: { top: "81%", left: "56%" },
  },
  {
    id: "nanning",
    city: "南宁",
    province: "广西",
    shortProvince: "桂",
    weather: "rain",
    weatherStatus: "小雨",
    crop: "甘蔗/水稻",
    poolSize: 175000,
    position: { top: "79%", left: "50%" },
  },
  {
    id: "akesu",
    city: "阿克苏",
    province: "新疆",
    shortProvince: "新",
    weather: "sunny",
    weatherStatus: "晴朗",
    crop: "棉花/苹果",
    poolSize: 220000,
    position: { top: "42%", left: "26%" },
  },
];

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
      {/* Map Container - narrowed to keep hotspots over land */}
      <div className="relative w-full max-w-4xl aspect-[4/3]">
        {/* Background Map Image with warm paper filter */}
        <img
          src={chinaFarmlandMap}
          alt="China Farmland Map"
          className="w-full h-full object-contain"
          style={{ filter: "brightness(0.96) sepia(0.05)" }}
          draggable={false}
        />

        {/* City Hotspots - Smaller with pulse animation */}
        {cityHotspots.map((city) => (
          <div
            key={city.id}
            className="absolute"
            style={{
              top: city.position.top,
              left: city.position.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Ping animation layer */}
            <span
              className={`absolute inset-0 w-7 h-7 rounded-full ${weatherPingColors[city.weather]} animate-[ping-slow_3s_ease-in-out_infinite]`}
            />
            
            {/* Main hotspot button with drop-shadow */}
            <button
              className={`relative w-7 h-7 rounded-full cursor-pointer
                transition-all duration-300 border-[1.5px] backdrop-blur-sm
                ${weatherBgColors[city.weather]} ${weatherBorderColors[city.weather]}
                hover:scale-125 hover:shadow-lg
                flex items-center justify-center z-10
                drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]
              `}
              onMouseEnter={() => setHoveredHotspot(city)}
              onMouseLeave={() => setHoveredHotspot(null)}
              onClick={() => handleCityClick(city)}
              aria-label={`${city.city} - ${city.weatherStatus}`}
            >
              {city.weather === "sunny" && <Sun className="w-3.5 h-3.5 text-foreground/80" />}
              {city.weather === "rain" && <CloudRain className="w-3.5 h-3.5 text-foreground/80" />}
              {city.weather === "drought" && <Flame className="w-3.5 h-3.5 text-foreground/80" />}
              {city.weather === "flood" && <Waves className="w-3.5 h-3.5 text-foreground/80" />}
              {city.weather === "typhoon" && <Wind className="w-3.5 h-3.5 text-foreground/80" />}
            </button>
          </div>
        ))}

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

        {/* Legend - Scaled up 1.2x, positioned closer to map edge */}
        <div 
          className="absolute glass rounded-xl p-4 shadow-soft"
          style={{
            bottom: "12%",
            left: "8%",
            transform: "scale(1.2)",
            transformOrigin: "bottom left",
          }}
        >
          <p className="text-xs font-medium text-foreground mb-2">图例</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {(Object.keys(weatherLabels) as WeatherType[]).map((weather) => (
              <div key={weather} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-sm ${weatherBgColors[weather]}`}
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
