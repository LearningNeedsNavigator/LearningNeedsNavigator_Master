
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

type DataItem = {
  name: string;
  value: number;
  color: string;
};

type ResultsChartProps = {
  data: DataItem[];
  title: string;
  description: string;
};

// Custom tooltip component to display the value with proper formatting
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-muted-foreground">
          {typeof data.value === 'number' ? data.value.toFixed(1) : data.value}%
        </p>
      </div>
    );
  }
  return null;
};

const ResultsChart = ({ data, title, description }: ResultsChartProps) => {
  const isMobile = useIsMobile();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 print:px-2">
        <div className="h-64 sm:h-[28rem] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 24, right: 96, bottom: 24, left: 96 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={!isMobile}
                outerRadius={isMobile ? 75 : 85}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={
                  isMobile
                    ? false
                    : ({ name, value }) =>
                        `${name}: ${typeof value === "number" ? value.toFixed(1) : value}%`
                }
                style={{ fontSize: 11 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Mobile legend: stacked labels below the chart */}
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:hidden">
          {data.map((d) => (
            <li
              key={d.name}
              className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-start gap-2">
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: d.color }}
                />
                <span className="break-words leading-snug">{d.name}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {typeof d.value === "number" ? d.value.toFixed(1) : d.value}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ResultsChart;
