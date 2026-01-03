import { useState } from "react";
import { Sun, CloudRain, Flame, Waves, Wind } from "lucide-react";
import chinaFarmlandMap from "@/assets/china-farmland-map.png";

export type WeatherType = "sunny" | "rain" | "drought" | "flood" | "typhoon";

export interface Province {
  id: string;
  name: string;
  weather: WeatherType;
  crop: string;
  poolSize: number;
}

// Hotspot regions for the image overlay approach
const hotspots: Province[] = [
  {
    id: "henan",
    name: "河南",
    weather: "drought",
    crop: "玉米",
    poolSize: 456000,
  },
  {
    id: "guangdong",
    name: "广东",
    weather: "flood",
    crop: "水稻",
    poolSize: 198000,
  },
  {
    id: "sichuan",
    name: "四川",
    weather: "rain",
    crop: "水稻",
    poolSize: 156000,
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

interface ChinaMapProps {
  onProvinceClick: (province: Province) => void;
}

const ChinaMap = ({ onProvinceClick }: ChinaMapProps) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<Province | null>(null);

  return (
    <div className="relative w-full flex justify-center">
      {/* Map Container */}
      <div className="relative w-full max-w-[65rem] aspect-[4/3]">
        {/* Background Map Image */}
        <img
          src={chinaFarmlandMap}
          alt="China Farmland Map"
          className="w-full h-full object-contain scale-[1.3] origin-center"
          draggable={false}
        />

        {/* Hotspot A: Henan (Central/North) - Drought */}
        <button
          className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer
            transition-all duration-300 border-2 backdrop-blur-sm
            ${weatherBgColors.drought} ${weatherBorderColors.drought}
            hover:scale-110 hover:shadow-lg hover:shadow-weather-drought/30
            flex items-center justify-center
          `}
          style={{
            top: "38%",
            left: "58%",
            transform: "translate(-50%, -50%)",
          }}
          onMouseEnter={() => setHoveredHotspot(hotspots[0])}
          onMouseLeave={() => setHoveredHotspot(null)}
          onClick={() => onProvinceClick(hotspots[0])}
          aria-label="河南 - 干旱"
        >
          <Flame className="w-6 h-6 md:w-8 md:h-8 text-foreground/80" />
        </button>

        {/* Hotspot B: Guangdong (South) - Flood */}
        <button
          className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer
            transition-all duration-300 border-2 backdrop-blur-sm
            ${weatherBgColors.flood} ${weatherBorderColors.flood}
            hover:scale-110 hover:shadow-lg hover:shadow-weather-flood/30
            flex items-center justify-center
          `}
          style={{
            top: "72%",
            left: "62%",
            transform: "translate(-50%, -50%)",
          }}
          onMouseEnter={() => setHoveredHotspot(hotspots[1])}
          onMouseLeave={() => setHoveredHotspot(null)}
          onClick={() => onProvinceClick(hotspots[1])}
          aria-label="广东 - 暴雨/洪涝"
        >
          <Waves className="w-6 h-6 md:w-8 md:h-8 text-foreground/80" />
        </button>

        {/* Hotspot C: Sichuan (West) - Rain */}
        <button
          className={`absolute w-14 h-14 md:w-18 md:h-18 rounded-full cursor-pointer
            transition-all duration-300 border-2 backdrop-blur-sm
            ${weatherBgColors.rain} ${weatherBorderColors.rain}
            hover:scale-110 hover:shadow-lg hover:shadow-weather-rain/30
            flex items-center justify-center
          `}
          style={{
            top: "52%",
            left: "38%",
            transform: "translate(-50%, -50%)",
          }}
          onMouseEnter={() => setHoveredHotspot(hotspots[2])}
          onMouseLeave={() => setHoveredHotspot(null)}
          onClick={() => onProvinceClick(hotspots[2])}
          aria-label="四川 - 小雨"
        >
          <CloudRain className="w-5 h-5 md:w-7 md:h-7 text-foreground/80" />
        </button>

        {/* Tooltip */}
        {hoveredHotspot && (
          <div
            className="absolute z-50 pointer-events-none animate-fade-in"
            style={{
              top: hoveredHotspot.id === "henan" ? "28%" : hoveredHotspot.id === "guangdong" ? "62%" : "42%",
              left: hoveredHotspot.id === "henan" ? "58%" : hoveredHotspot.id === "guangdong" ? "72%" : "48%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="glass rounded-xl p-3 shadow-medium min-w-[160px]">
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
                    {hoveredHotspot.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {weatherLabels[hoveredHotspot.weather]}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">主要作物</span>
                  <span className="font-medium">{hoveredHotspot.crop}</span>
                </div>
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
export { weatherIcons, weatherLabels };
