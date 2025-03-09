import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import {
  getDailyQueries,
} from './commonFunctions';
import { removeNonEnglishLetters } from './commonFunctions';

interface HistoryProps {
  todayWords: any;
  onSearch: (searchTerm: string) => void;
}

const History: React.FC<HistoryProps> = ({todayWords, onSearch}) => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dayWords, setDayWords] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDate && currentUser) {
      const fetchData = async () => {
        try {
          const select_day = format(selectedDate, 'yyyy-MM-dd');
          const today = format(new Date(), 'yyyy-MM-dd');
          if(select_day === today){
            setDayWords(() => Array.from(todayWords));
            return;
          }
          const dailyQueries = await getDailyQueries(currentUser.uid, select_day);
          if (dailyQueries) {
            setDayWords(() => Object.keys(dailyQueries.words));
          }
          else {
            setDayWords(()=> []);
          }

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [selectedDate, todayWords, currentUser]);

  const handleSubmit = (word: string) => {
    onSearch(removeNonEnglishLetters(word))
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      <div className="mb-4">
        <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700">
          Select Date:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate((date || new Date()) as Date)}
          dateFormat="yyyy-MM-dd" // 显示格式
          className="mt-1 p-2 border rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          id="date-picker"
          placeholderText="YYYY-MM-DD" // 提示文字
          showYearDropdown  // 显示年份下拉框
          showMonthDropdown // 显示月份下拉框
          scrollableYearDropdown // 年份下拉框可滚动
          yearDropdownItemNumber={15} // 显示的年份数量
          maxDate={new Date()}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-blue-500">Daily Search Words</h3>
        <span className="text-gray-600">Total: {dayWords.length}</span>
        {/* <ul className="list-disc list-inside text-gray-600" style={{ columns: '3', columnGap: '1rem' }}> */}
        <ul className='columns-2 md:columns-3 gap-4 list-disc list-inside text-gray-600'>
          {dayWords.map((word, index) => (
            <li key={index}>
              <span className="text-gray-600 cursor-pointer hover:underline hover:text-blue-500" onClick={() => handleSubmit(word)}>
                {word}
              </span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default History;
