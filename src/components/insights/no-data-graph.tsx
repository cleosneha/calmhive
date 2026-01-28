import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NoDataGraphProps {
  title: string;
  description?: string;
  pattern?: "trend" | "time" | "holidays";
}

const patterns = {
  trend: {
    topColor: "#6ec89e",
    lineColor: "#5fc88a",
    gradientStart: "#6ec89e",
    gradientEnd: "#6ec89e",
    path: "M 0 160 Q 100 100 200 90 Q 300 85 400 60",
  },
  time: {
    topColor: "#5fc88a",
    lineColor: "#4dc875",
    gradientStart: "#5fc88a",
    gradientEnd: "#5fc88a",
    path: "M 0 150 Q 100 110 200 100 Q 300 95 400 70",
  },
  holidays: {
    topColor: "#7ed4a8",
    lineColor: "#6dc89f",
    gradientStart: "#7ed4a8",
    gradientEnd: "#7ed4a8",
    path: "M 0 155 Q 100 105 200 95 Q 300 90 400 65",
  },
};

export function NoDataGraph({ title, pattern = "trend" }: NoDataGraphProps) {
  const patternConfig = patterns[pattern];

  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="relative h-48 sm:h-64 w-full bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <style>{`
            @keyframes graphFloat {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 0.65; }
            }
            @keyframes graphLineFlow {
              0% {
                stroke-dashoffset: 1000;
              }
              100% {
                stroke-dashoffset: 0;
              }
            }
            @keyframes graphAreaFlow {
              0% {
                clip-path: inset(0 100% 0 0);
              }
              100% {
                clip-path: inset(0 0 0 0);
              }
            }
            .graph-line {
              stroke-dasharray: 1000;
              animation: graphLineFlow 2.5s ease-out, graphFloat 4s ease-in-out 2.5s infinite;
            }
            .graph-area {
              animation: graphAreaFlow 2.5s ease-out, graphFloat 4s ease-in-out 2.5s infinite;
            }
          `}</style>

          {/* Animated SVG graph background */}
          <svg
            className="absolute inset-0 w-full h-full blur-sm"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={`graphGradient-${pattern}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={patternConfig.gradientStart}
                  stopOpacity="0.4"
                />
                <stop
                  offset="50%"
                  stopColor={patternConfig.gradientStart}
                  stopOpacity="0.15"
                />
                <stop
                  offset="100%"
                  stopColor={patternConfig.gradientEnd}
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>
            {/* Animated curved line */}
            <path
              d={patternConfig.path}
              stroke={patternConfig.lineColor}
              strokeWidth="2.5"
              fill="none"
              className="graph-line"
              strokeLinecap="round"
            />
            {/* Fill area under curve with gradient fade */}
            <path
              d={`${patternConfig.path} L 400 200 L 0 200 Z`}
              fill={`url(#graphGradient-${pattern})`}
              className="graph-area"
            />
          </svg>

          {/* Very subtle overlay */}
          <div className="relative z-10 text-center space-y-2 bg-[var(--ch-sage-light)]/70 rounded-lg p-1 sm:p-2">
            <p className="text-xs sm:text-sm font-light text-slate-800">
              No data available
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
