// FILE: components/ChartComponent.tsx
import React from 'react';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AnalysisResult } from '../app/page'; // Import the type

interface ChartComponentProps {
  chartData: AnalysisResult['charts'][0];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ChartComponent: React.FC<ChartComponentProps> = ({ chartData }) => {
  if (!chartData || !chartData.data) return null;

  return (
    <div className="p-4 bg-gray-900 rounded-lg h-80 w-full">
      <h4 className="text-lg font-semibold text-center text-white mb-4">{chartData.title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        {chartData.type === 'bar' ? (
          <BarChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis dataKey="name" stroke="#a0aec0" />
            <YAxis stroke="#a0aec0" />
            <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
            <Legend />
            <Bar dataKey="value" fill="#3182ce" />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={chartData.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {chartData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;