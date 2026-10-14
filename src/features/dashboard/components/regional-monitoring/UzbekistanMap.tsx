import React, { useState } from "react";
import type { Region } from "../../../../types/region";
import { UZBEKISTAN_MAP_PATHS, UZBEKISTAN_VIEWBOX } from "./mapData";
import { RegionTooltip } from "./RegionTooltip";
import { useTranslation } from "react-i18next";

interface UzbekistanMapProps {
  regions: Region[];
  selectedRegionId: string | null;
  onSelectRegion: (region: Region) => void;
}

export const UzbekistanMap: React.FC<UzbekistanMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
}) => {
  const { i18n } = useTranslation();
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const regionMap = React.useMemo(() => {
    const map = new Map<string, Region>();
    for (const r of regions) {
      map.set(r.code, r);
      map.set(r.id, r);
    }
    return map;
  }, [regions]);

  const handleMouseMove = (e: React.MouseEvent, region: Region) => {
    setHoveredRegion(region);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
  };

  const getStatusStyles = (status: Region["status"], isSelected: boolean) => {
    switch (status) {
      case "healthy":
        return {
          fill: isSelected ? "rgba(16, 185, 129, 0.45)" : "rgba(16, 185, 129, 0.16)",
          stroke: isSelected ? "#34d399" : "#059669",
          strokeWidth: isSelected ? 2.6 : 1.2,
          hoverFill: "rgba(16, 185, 129, 0.32)",
          beaconColor: "#10b981",
        };
      case "warning":
        return {
          fill: isSelected ? "rgba(245, 158, 11, 0.52)" : "rgba(245, 158, 11, 0.22)",
          stroke: isSelected ? "#fbbf24" : "#d97706",
          strokeWidth: isSelected ? 2.8 : 1.4,
          hoverFill: "rgba(245, 158, 11, 0.38)",
          beaconColor: "#f59e0b",
        };
      case "critical":
        return {
          fill: isSelected ? "rgba(244, 63, 94, 0.6)" : "rgba(244, 63, 94, 0.28)",
          stroke: isSelected ? "#fb7185" : "#e11d48",
          strokeWidth: isSelected ? 3.0 : 1.6,
          hoverFill: "rgba(244, 63, 94, 0.44)",
          beaconColor: "#f43f5e",
        };
      case "offline":
      default:
        return {
          fill: isSelected ? "rgba(100, 116, 139, 0.45)" : "rgba(100, 116, 139, 0.18)",
          stroke: isSelected ? "#cbd5e1" : "#64748b",
          strokeWidth: isSelected ? 2.5 : 1.2,
          hoverFill: "rgba(100, 116, 139, 0.32)",
          beaconColor: "#94a3b8",
        };
    }
  };

  return (
    <div className="relative w-full aspect-[860/540] select-none rounded-xl overflow-hidden bg-slate-50/60 dark:bg-[#0c1222]/80 border border-slate-200/80 dark:border-slate-800/80 p-2 sm:p-4 shadow-inner">
      <svg
        viewBox={UZBEKISTAN_VIEWBOX}
        className="w-full h-full filter drop-shadow-lg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="region-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="region-glow-intense" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {UZBEKISTAN_MAP_PATHS.filter((p) => !p.isCityNode).map((pathDef) => {
          const region = regionMap.get(pathDef.code);
          const isSelected =
            selectedRegionId === pathDef.id || selectedRegionId === pathDef.code;
          const isHovered = hoveredRegion?.code === pathDef.code;
          const status = region?.status ?? "healthy";
          const styles = getStatusStyles(status, isSelected);

          return (
            <path
              key={pathDef.code}
              id={`map-region-${pathDef.code}`}
              d={pathDef.pathD}
              fill={isHovered ? styles.hoverFill : styles.fill}
              stroke={styles.stroke}
              strokeWidth={styles.strokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
              filter={
                isSelected
                  ? "url(#region-glow-intense)"
                  : isHovered
                  ? "url(#region-glow)"
                  : undefined
              }
              className="cursor-pointer transition-all duration-300 ease-out hover:brightness-110 active:scale-[0.999]"
              onMouseMove={(e) => region && handleMouseMove(e, region)}
              onMouseLeave={handleMouseLeave}
              onClick={() => region && onSelectRegion(region)}
            />
          );
        })}

        {(() => {
          const cityDef = UZBEKISTAN_MAP_PATHS.find((p) => p.isCityNode);
          if (!cityDef) return null;
          const cityRegion = regionMap.get(cityDef.code);
          const isCitySelected =
            selectedRegionId === cityDef.id || selectedRegionId === cityDef.code;
          const cityStatus = cityRegion?.status ?? "healthy";
          const cityStyles = getStatusStyles(cityStatus, isCitySelected);

          return (
            <g
              key="tashkent-city-node"
              className="cursor-pointer group"
              onMouseMove={(e) => cityRegion && handleMouseMove(e, cityRegion)}
              onMouseLeave={handleMouseLeave}
              onClick={() => cityRegion && onSelectRegion(cityRegion)}
            >
              <circle
                cx={cityDef.labelX}
                cy={cityDef.labelY}
                r="18"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.5"
                className="animate-ping origin-center"
                style={{ animationDuration: "2.4s" }}
              />
              <circle
                cx={cityDef.labelX}
                cy={cityDef.labelY}
                r="12"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1"
                opacity="0.7"
                className="animate-ping origin-center"
                style={{ animationDuration: "1.8s", animationDelay: "0.4s" }}
              />
              <circle
                cx={cityDef.labelX}
                cy={cityDef.labelY}
                r="11"
                fill={cityStyles.fill}
                stroke={cityStyles.stroke}
                strokeWidth="2.5"
                filter="url(#region-glow)"
                className="transition-transform duration-300 group-hover:scale-125"
              />
              <circle
                cx={cityDef.labelX}
                cy={cityDef.labelY}
                r="4.5"
                fill="#38bdf8"
                className="shadow-sm"
              />
            </g>
          );
        })()}

        {UZBEKISTAN_MAP_PATHS.map((p) => {
          const region = regionMap.get(p.code);
          const status = region?.status ?? "healthy";
          const isSelected = selectedRegionId === p.id || selectedRegionId === p.code;
          const styles = getStatusStyles(status, isSelected);

          const dotX = p.labelX - 16;
          const dotY = p.labelY - 1;

          const isPulsing =
            status === "critical" || status === "warning" || isSelected;

          return (
            <g
              key={`label-${p.code}`}
              className="pointer-events-none select-none font-mono"
            >
              {isPulsing && (
                <>
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={status === "critical" ? 14 : 10}
                    fill="none"
                    stroke={styles.beaconColor}
                    strokeWidth="1.5"
                    className="animate-ping origin-center"
                    style={{
                      animationDuration: status === "critical" ? "1.4s" : "2.2s",
                      opacity: 0.75,
                    }}
                  />
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r={status === "critical" ? 22 : 16}
                    fill="none"
                    stroke={styles.beaconColor}
                    strokeWidth="0.8"
                    className="animate-ping origin-center"
                    style={{
                      animationDuration: status === "critical" ? "1.9s" : "2.8s",
                      animationDelay: "0.5s",
                      opacity: 0.4,
                    }}
                  />
                </>
              )}

              <circle
                cx={dotX}
                cy={dotY}
                r={isSelected ? 4.5 : 3.5}
                fill={styles.beaconColor}
                filter={isSelected || isPulsing ? "url(#region-glow)" : undefined}
                className="transition-all duration-300"
              />

              <text
                x={p.labelX - 8}
                y={p.labelY + 3.5}
                fill={isSelected ? "#ffffff" : isPulsing ? "#f1f5f9" : "#94a3b8"}
                fontSize={isSelected ? "11.5" : "10.5"}
                fontWeight={isSelected ? "700" : isPulsing ? "600" : "500"}
                textAnchor="start"
                className="transition-all duration-300"
                style={{
                  textShadow:
                    "0 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)",
                  letterSpacing: "0.04em",
                }}
              >
                {p.code}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredRegion && <RegionTooltip region={hoveredRegion} position={mousePos} />}
    </div>
  );
};
