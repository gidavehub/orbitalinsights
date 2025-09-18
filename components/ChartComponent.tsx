// FILE: components/ChartComponent.tsx
import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector } from 'recharts';
import { AnalysisResult } from '../app/page';

interface ChartComponentProps {
  chartData: AnalysisResult['charts'][0];
}

// Vibrant, neon-like color palette for charts
const COLORS = ['#22d3ee', '#a3e635', '#fde047', '#f97316', '#a78bfa', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg shadow-black/50">
        <p className="label text-white font-semibold">{`${label}`}</p>
        <p className="intro text-cyan-300">{`${payload[0].name} : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

// Custom Active Shape for Pie Chart Hover Effect
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4} // Pop out effect
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{filter: `drop-shadow(0 0 8px ${fill})`}}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`${value.toLocaleString()}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const ChartComponent: React.FC<ChartComponentProps> = ({ chartData }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  if (!chartData || !chartData.data) return null;

  return (
    <div className="p-4 bg-gray-950/30 backdrop-blur-sm rounded-xl h-96 w-full border border-white/10 shadow-lg shadow-black/30">
      <h4 className="text-lg font-semibold text-center text-white/90 mb-4">{chartData.title}</h4>
      <ResponsiveContainer width="100%" height="85%">
        {chartData.type === 'bar' ? (
          <BarChart data={chartData.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.6)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255, 255, 255, 0.6)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            <Legend wrapperStyle={{ fontSize: '14px', color: '#FFF' }}/>
            <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1200}>
              {chartData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie 
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData.data} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              innerRadius={60}
              outerRadius={80} 
              fill="#8884d8" 
              onMouseEnter={onPieEnter}
              animationDuration={1200}
            >
              {chartData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={"#0a0a0a"} style={{filter: `drop-shadow(0 0 5px ${COLORS[index % COLORS.length]})`}} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;