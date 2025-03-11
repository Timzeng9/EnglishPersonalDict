import React, { useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  removeNonEnglishLetters,
  // getPaginatedTopQueriesEfficient,
} from './commonFunctions';
// import { useAuth } from '../contexts/AuthContext';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsProps {
  wordSearchCounts: any;
  dailyWordCounts: any;
  onSearch: (searchTerm: string) => void;
}

const Statistics: React.FC<StatisticsProps> = ({ wordSearchCounts, dailyWordCounts, onSearch }) => {
  // const { currentUser } = useAuth();
  let dailyQueryCount = Array.from({ length: 5 }, (_, i) => ({
    date: `mockDay ${i + 1}`,
    count: Math.floor(Math.random() * 20) + 5, // Random count between 5 and 25
  }));

  if (dailyWordCounts) {
    for (const day in dailyWordCounts) {
      dailyQueryCount.push({
        date: day,
        count: dailyWordCounts[day],
      });
    }
  }

  let wordFrequency: { [word: string]: { count: number } } = {};
  if (wordSearchCounts) {
    for (const word in wordSearchCounts) {
      wordFrequency[word] = wordSearchCounts[word];
    }
  }

  const sortedWordFrequency = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 15);

  const barChartData = {
    labels: sortedWordFrequency.map(([word]) => word),
    datasets: [
      {
        label: 'Query Frequency',
        data: sortedWordFrequency.map(([, frequency]) => frequency.count),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
  };

  const [xLabelsCount, setXLabelsCount] = useState(10); // 默认显示 10 个横坐标标签
  const chartRef = useRef(null);

  const handleXLabelsCountChange = (event: { target: { value: string; }; }) => {
    setXLabelsCount(parseInt(event.target.value, 10));
  };

  // 更新 lineChartData，根据 xLabelsCount 显示标签
  const lineChartData = {
    labels: dailyQueryCount
      .slice(-xLabelsCount) // 只显示最后 xLabelsCount 个标签
      .map((item) => item.date),
    datasets: [
      {
        label: 'Daily Search Count',
        data: dailyQueryCount
          .slice(-xLabelsCount) // 只显示最后 xLabelsCount 个数据点
          .map((item) => item.count),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const [activeTab, setActiveTab] = useState('dailyQueryCount');

  const tabs = [
    { id: 'dailyQueryCount', label: 'Daily Count' },
    { id: 'wordFrequency', label: 'Word Frequency' },
  ];

  const handleSubmit = (word: string) => {
    onSearch(removeNonEnglishLetters(word))
  };

  // let historyCursors: any[] = [];
  // let currentData: { [word: string]: number; } | null = null;

  // async function nextPage() {
  //   const { data, nextCursor } = await getPaginatedTopQueriesEfficient(
  //     userId,
  //     pageSize,
  //     cursor
  //   );
  //   if (currentData) {
  //     historyCursors.unshift(cursor);
  //   }
  //   currentData = data;
  //   cursor = nextCursor;
  //   displayData(data);
  // }

  // async function previousPage() {
  //   if (historyCursors.length > 0) {
  //     cursor = historyCursors.shift();
  //     const { data, nextCursor } = await getPaginatedTopQueriesEfficient(
  //       userId,
  //       pageSize,
  //       cursor
  //     );
  //     currentData = data;
  //     cursor = nextCursor;
  //     displayData(data);
  //   } else {
  //     console.log("已经是第一页");
  //   }
  // }

  // useEffect(() => {
  //   if (currentUser) {
  //     const fetchData = async () => {
  //       try {
  //         const select_day = format(selectedDate, 'yyyy-MM-dd');
  //         const today = format(new Date(), 'yyyy-MM-dd');
  //         if (select_day === today) {
  //           setDayWords(() => Array.from(todayWords));
  //           return;
  //         }
  //         const dailyQueries = await getDailyQueries(currentUser.uid, select_day);
  //         if (dailyQueries) {
  //           setDayWords(() => Object.keys(dailyQueries.words));
  //         }
  //         else {
  //           setDayWords(() => []);
  //         }

  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     };

  //     fetchData();
  //   }
  // }, [wordSearchCounts, currentUser]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h2 className="text-4xl font-bold mb-4 text-blue-500">Statistics</h2>

      {/* 选项卡 */}
      <div className="flex mb-4 justify-center items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mr-4 px-4 py-2 rounded-lg ${activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 选项卡内容 */}
      <div>
        {activeTab === 'dailyQueryCount' && (
          <div>
            <div className="container mx-auto flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-500">
                Daily Search Count
              </h3>

              <div className="flex space-x-6">
                <label htmlFor="xLabelsCount" className="mr-2">
                  Show Days:
                </label>
                <select
                  id="xLabelsCount"
                  value={xLabelsCount}
                  onChange={handleXLabelsCountChange}
                >
                  <option value={10}>10</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="mt-4" style={{ overflowX: 'auto' }}> {/* 允许图表水平滚动 */}
              <Line data={lineChartData} ref={chartRef} /> {/* 添加 ref 属性 */}
            </div>
          </div>
        )}

        {activeTab === 'wordFrequency' && (
          <div>
            <h3 className="text-lg font-semibold text-blue-500">Word Search Frequency (Top 15)</h3>
            {/* <ul className="list-disc list-inside text-gray-600" style={{ columns: '3', columnGap: '1rem' }}> */}
            <ul className='columns-2 md:columns-3 gap-4 list-disc list-inside text-gray-600'>
              {sortedWordFrequency.map(([word, frequency], index) => (
                <li key={index}>
                  <span className="text-gray-600 cursor-pointer hover:underline hover:text-blue-500" onClick={() => handleSubmit(word)}>
                    {word}
                  </span>: {frequency.count}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Bar data={barChartData} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Statistics;
