import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  SubTitle,
  Title,
  Tooltip,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  SubTitle,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: Record<string, number> | undefined;
  chartTitle?: string;
  chartSubTitle?: string;
}

export const BarChart = ({
  data,
  chartTitle,
  chartSubTitle,
}: BarChartProps) => {
  return (
    <Bar
      data={{
        labels: data
          ? Object.keys(data).sort((a, b) => parseInt(a) - parseInt(b))
          : [],
        datasets: [
          {
            data: data
              ? // Sort the values by the key
                Object.keys(data)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((key) => data[key])
              : [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
          },
        ],
      }}
      options={{
        plugins: {
          filler: {
            propagate: true,
            drawTime: 'beforeDraw',
          },
          title: {
            align: 'center',
            display: true,
            position: 'top',
            color: '#000000',
            font: {
              size: 24,
            },
            fullSize: true,
            padding: {
              top: chartTitle ? 15 : 0,
              bottom: chartTitle ? 15 : 0,
            },
            text: chartTitle,
          },
          subtitle: {
            align: 'center',
            display: true,
            position: 'bottom',
            color: '#000000',
            font: {
              size: 16,
            },
            fullSize: true,
            padding: {
              top: chartSubTitle ? 15 : 0,
              bottom: chartSubTitle ? 15 : 0,
            },
            text: chartSubTitle,
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            grid: {
              display: false,
            },
          },
        },
        maintainAspectRatio: false,
        responsive: true,
      }}
    />
  );
};
