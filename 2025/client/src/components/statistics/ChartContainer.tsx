import React from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Sector
} from 'recharts';
import Card from '../common/Card';
import { AlertTriangle } from 'lucide-react';
import {ChartData} from "../../types";

type ChartType = 'pie' | 'bar' | 'line';

interface ChartContainerProps {
  title: string;
  data: ChartData[];
  type: ChartType;
  icon?: React.ReactNode;
  dataKey?: string; // Default 'value'
  nameKey?: string; // Default 'name'
}

const ActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 11;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold dark:fill-gray-200">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 6}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="#333" className="dark:fill-gray-300 text-xs">{`$${value.toFixed(0)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} dy={12} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(Rate ${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};


const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  data,
  type,
  icon,
  dataKey = 'value',
  nameKey = 'name',
}) => {

  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = (_: any, index: number) => setActiveIndex(index);


  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
          <AlertTriangle size={32} className="mb-2 opacity-50"/>
          No data available for this chart.
        </div>
      );
    }

    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={ActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={96}
                fill="#8884d8"
                dataKey={dataKey}
                onMouseEnter={onPieEnter}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} stroke={entry.color || '#cccccc'} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !shadow-lg !rounded-md"
                contentStyle={{ backgroundColor: 'transparent', border: 'none'}}
                labelStyle={{ color: '#333', fontWeight: 'bold'}} // Example: customizing label style
                itemStyle={{ color: '#555' }} // Example: customizing item style
              />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey={nameKey} tickLine={false} axisLine={false} className="text-xs text-gray-500 dark:text-gray-400" />
              <YAxis tickLine={false} axisLine={false} className="text-xs text-gray-500 dark:text-gray-400" tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !shadow-lg !rounded-md" />
              <Legend iconSize={16} wrapperStyle={{fontSize: "12px", paddingTop: "8px"}}/>
              <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
       case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey={nameKey} tickLine={false} axisLine={false} className="text-xs text-gray-500 dark:text-gray-400" />
              <YAxis tickLine={false} axisLine={false} className="text-xs text-gray-500 dark:text-gray-400" tickFormatter={(value) => `$${value / 1000}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} wrapperClassName="!bg-white dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !shadow-lg !rounded-md" />
              <Legend iconSize={10} wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
              <Line type="monotone" dataKey={dataKey} stroke={data[0]?.color || '#8884d8'} strokeWidth={2} dot={{ r: 4, strokeWidth:2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-full" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-white">
          {title}
        </h3>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      {renderChart()}
    </Card>
  );
};

export default ChartContainer;
