import { useState, useRef } from "react";
import { Sun, CloudRain, Flame, Waves, Wind, Move } from "lucide-react";
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

// 20 city hotspots with precise geographic coordinates
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
    position: { top: "12%", left: "76%" },
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
    position: { top: "20%", left: "86%" },
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
    position: { top: "24%", left: "84%" },
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
    position: { top: "28%", left: "82%" },
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
    position: { top: "38%", left: "71%" },
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
    position: { top: "40%", left: "78%" },
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
    position: { top: "42%", left: "74%" },
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
    position: { top: "48%", left: "69%" },
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
    position: { top: "51%", left: "66%" },
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
    position: { top: "53%", left: "72%" },
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
    position: { top: "60%", left: "52%" },
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
    position: { top: "56%", left: "65%" },
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
    position: { top: "64%", left: "64%" },
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
    position: { top: "66%", left: "73%" },
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
    position: { top: "72%", left: "70%" },
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
    position: { top: "52%", left: "78%" },
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
    position: { top: "86%", left: "66%" },
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
    position: { top: "83%", left: "68%" },
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
    position: { top: "80%", left: "61%" },
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
    position: { top: "42%", left: "22%" },
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
  const [devMode, setDevMode] = useState(false);
  const [hotspotPositions, setHotspotPositions] = useState<Record<string, { top: string; left: string }>>(
    () => Object.fromEntries(cityHotspots.map(c => [c.id, c.position]))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<string | null>(null);

  const handleCityClick = (city: CityHotspot) => {
    if (devMode) return; // Don't open modal in dev mode
    const province: Province = {
      id: city.id,
      name: city.city,
      weather: city.weather,
      crop: city.crop,
      poolSize: city.poolSize,
    };
    onProvinceClick(province);
  };

  const handleMouseDown = (cityId: string) => {
    if (!devMode) return;
    draggingRef.current = cityId;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!devMode || !draggingRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const left = ((e.clientX - rect.left) / rect.width) * 100;
    const top = ((e.clientY - rect.top) / rect.height) * 100;
    
    setHotspotPositions(prev => ({
      ...prev,
      [draggingRef.current!]: { 
        top: `${Math.max(0, Math.min(100, top)).toFixed(1)}%`, 
        left: `${Math.max(0, Math.min(100, left)).toFixed(1)}%` 
      }
    }));
  };

  const handleMouseUp = () => {
    if (draggingRef.current && devMode) {
      // Output all positions to console
      console.log("📍 当前热点坐标：");
      console.log(JSON.stringify(hotspotPositions, null, 2));
    }
    draggingRef.current = null;
  };

  return (
    <div className="relative w-full flex justify-center">
      {/* Dev Mode Toggle */}
      <button
        onClick={() => setDevMode(!devMode)}
        className={`absolute top-2 right-2 z-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
          ${devMode 
            ? 'bg-accent text-accent-foreground shadow-lg' 
            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
      >
        <Move className="w-3 h-3" />
        {devMode ? '拖拽模式 ON' : '调试'}
      </button>

      {/* Map Container */}
      <div 
        ref={containerRef}
        className={`relative w-full max-w-[65rem] aspect-[4/3] ${devMode ? 'cursor-crosshair' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Map Image with warm paper filter */}
        <img
          src={chinaFarmlandMap}
          alt="China Farmland Map"
          className="w-full h-full object-contain scale-[1.3] origin-center"
          style={{ filter: "brightness(0.96) sepia(0.05)" }}
          draggable={false}
        />

        {/* City Hotspots - Smaller with pulse animation */}
        {cityHotspots.map((city) => {
          const pos = hotspotPositions[city.id] || city.position;
          return (
            <div
              key={city.id}
              className={`absolute ${devMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
              style={{
                top: pos.top,
                left: pos.left,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={() => handleMouseDown(city.id)}
            >
              {/* Ping animation layer */}
              {!devMode && (
                <span
                  className={`absolute inset-0 w-7 h-7 rounded-full ${weatherPingColors[city.weather]} animate-[ping-slow_3s_ease-in-out_infinite]`}
                />
              )}
              
              {/* Main hotspot button with drop-shadow */}
              <button
                className={`relative w-7 h-7 rounded-full
                  transition-all duration-300 border-[1.5px] backdrop-blur-sm
                  ${weatherBgColors[city.weather]} ${weatherBorderColors[city.weather]}
                  ${devMode ? 'ring-2 ring-accent ring-offset-1' : 'hover:scale-125 hover:shadow-lg cursor-pointer'}
                  flex items-center justify-center z-10
                  drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]
                `}
                onMouseEnter={() => !devMode && setHoveredHotspot(city)}
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
              
              {/* Dev mode label */}
              {devMode && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono bg-background/90 px-1 rounded whitespace-nowrap">
                  {city.city}
                </span>
              )}
            </div>
          );
        })}

        {/* Tooltip */}
        {hoveredHotspot && !devMode && (
          <div
            className="absolute z-50 pointer-events-none animate-fade-in"
            style={{
              top: `calc(${hotspotPositions[hoveredHotspot.id]?.top || hoveredHotspot.position.top} - 6%)`,
              left: hotspotPositions[hoveredHotspot.id]?.left || hoveredHotspot.position.left,
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
