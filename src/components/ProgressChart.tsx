
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import config from '@/config';

const ProgressChart: React.FC = () => {
  const data = config.projectProgress.data;
  const colors = config.projectProgress.colors;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism p-2 border shadow-sm">
          <p className="text-sm font-medium">{`${label}`}</p>
          <p className="text-sm text-muted-foreground">
            Progress: <span className="font-medium">{`${payload[0].value}%`}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.secondary} opacity={0.4} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: colors.primary, fontSize: 12 }}
            stroke={colors.secondary}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: colors.primary, fontSize: 12 }}
            stroke={colors.secondary}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="progress" 
            stroke={colors.primary} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#progressGradient)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
