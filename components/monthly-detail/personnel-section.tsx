"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TeamMember {
  person_name: string;
  actualFTE: number;
  plannedFTE: number;
  deviation: number;
  hours: number;
  entryCount: number;
}

interface TeamResponse {
  team: TeamMember[];
  totalHours: number;
  totalFTE: number;
  totalPlannedFTE: number;
}

interface PersonnelSectionProps {
  dateFrom: string;
  dateTo: string;
}

export function PersonnelSection({ dateFrom, dateTo }: PersonnelSectionProps) {
  const [data, setData] = useState<TeamMember[]>([]);
  const [totalFTE, setTotalFTE] = useState<number>(0);
  const [totalPlannedFTE, setTotalPlannedFTE] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/analytics/team?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team data");
        }

        const result: TeamResponse = await response.json();
        setData(result.team || []);
        setTotalFTE(result.totalFTE || 0);
        setTotalPlannedFTE(result.totalPlannedFTE || 0);
      } catch (err) {
        console.error("Team fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateFrom, dateTo]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const getDeviationColor = (deviation: number) => {
    if (deviation >= 0) return "#7BD4B4";  // All positive values: green
    if (deviation >= -20) return "#8AB5FA";  // -0.01% to -20%: blue
    return "#EB4899";  // All other negative values: pink
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Personnel Performance
        </CardTitle>
        <CardDescription>Planned vs Actual FTE comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actual FTE</TableHead>
              <TableHead className="text-right">Planned FTE</TableHead>
              <TableHead className="text-right">Deviation</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead className="text-right">Entries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((member) => (
              <TableRow key={member.person_name}>
                <TableCell className="font-medium">
                  {member.person_name || "Unknown"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {(member.actualFTE || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {(member.plannedFTE || 0) > 0
                    ? (member.plannedFTE || 0).toFixed(2)
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {(member.plannedFTE || 0) > 0 ? (
                    <Badge
                      style={{
                        backgroundColor: getDeviationColor(member.deviation || 0),
                        color: "#FFFFFF"
                      }}
                    >
                      {(member.deviation || 0) > 0 ? "+" : ""}
                      {member.deviation || 0}%
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {(member.hours || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {member.entryCount || 0}
                </TableCell>
              </TableRow>
            ))}
            {data.length > 0 && (
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {/* Use correctly calculated total FTE from API (sum hours first, then divide) */}
                  {totalFTE.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {/* Use month-by-month weighted planned FTE from API */}
                  {totalPlannedFTE.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">
                  {/* Total hours */}
                  {data.reduce((sum, m) => sum + (m.hours || 0), 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {/* Total entries */}
                  {data.reduce((sum, m) => sum + (m.entryCount || 0), 0)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No personnel data available for this period
          </div>
        )}

        {/* Chart: Only show main contributors (Actual FTE >= 0.25) */}
        {data.length > 0 &&
          (() => {
            const chartData = data
              .filter((member) => member.actualFTE >= 0.25)
              .sort((a, b) => b.actualFTE - a.actualFTE)
              .map((member) => ({
                name: member.person_name,
                actualFTE: member.actualFTE,
                plannedFTE: member.plannedFTE > 0 ? member.plannedFTE : 0,
              }));

            if (chartData.length === 0) return null;

            const CustomLabel = (props: any) => {
              const { x, y, width, height, value, dataKey } = props;
              if (!value || value === 0) return null;

              return (
                <text
                  x={x + width + 8}
                  y={y + height / 2}
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                  fontFamily="inherit"
                  dominantBaseline="middle"
                >
                  {value.toFixed(2)} FTE
                </text>
              );
            };

            return (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-medium mb-4">
                  FTE Visual Comparison for Main Contributors (more than 0.25 FTE)
                </h3>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(chartData.length * 100, 300)}
                >
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 120, left: 120, bottom: 5 }}
                    barGap={100}
                    barCategoryGap={1}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      type="number"
                      domain={[0, "auto"]}
                      tick={{
                        fontSize: 12,
                        fontFamily: "inherit",
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{
                        fontSize: 12,
                        fontFamily: "inherit",
                        fill: "hsl(var(--foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar
                      dataKey="actualFTE"
                      fill="#F9C57C"
                      radius={[0, 4, 4, 0]}
                      label={<CustomLabel />}
                      barSize={30}
                    />
                    <Bar
                      dataKey="plannedFTE"
                      fill="#B99EFB"
                      radius={[0, 4, 4, 0]}
                      label={<CustomLabel />}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: "#F9C57C" }}
                    ></div>
                    <span>Actual FTE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: "#B99EFB" }}
                    ></div>
                    <span>Planned FTE</span>
                  </div>
                </div>
              </div>
            );
          })()}
      </CardContent>
    </Card>
  );
}
