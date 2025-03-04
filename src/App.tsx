import React, { useState, useCallback, useRef, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WordDefinition from './components/WordDefinition';
import Statistics from './components/Statistics';
import { Book } from 'lucide-react';
interface DailyWordCountsDictionary {
  [key: string]: Array<string>; 
}

function App() {
  // localStorage.clear();
  const [wordData, setWordData] = useState({
    word: 'Apple',
    phonetic: '/ˈæpəl/',
    EnglishDefinition: ['A common, round fruit produced by the tree Malus domestica, cultivated in temperate climates.',],
    exampleSentences: ["I like apples.", "Apples are good for health."],
  });
  const [dailyWordCounts, setDailyWordCounts] = useState<{[key: string]: Set<string> }> (() => { //在这里添加索引签名，并且指明set的值类型
    const storedCounts = localStorage.getItem('dailyWordCounts');
    if (storedCounts) {
      const parsedCounts = JSON.parse(storedCounts);
      for (const day in parsedCounts) {
        parsedCounts[day] = new Set(parsedCounts[day]);
      }
      return parsedCounts;
    }
    return {};
  });
  const [wordSearchCounts, setWordSearchCounts] = useState(() => {
    const storedSearchCounts = localStorage.getItem('wordSearchCounts');
    return storedSearchCounts ? JSON.parse(storedSearchCounts) : {};
  });

  useEffect(() => {
    const countsToStore: DailyWordCountsDictionary = {};
    for (const day in dailyWordCounts) {
      countsToStore[day] = Array.from(dailyWordCounts[day]);
    }
    localStorage.setItem('dailyWordCounts', JSON.stringify(countsToStore));
  }, [dailyWordCounts]);

  useEffect(() => {
    localStorage.setItem('wordSearchCounts', JSON.stringify(wordSearchCounts));
  }, [wordSearchCounts]);

  const updateDailyWordCounts = (date: string, word: string) => {
    setDailyWordCounts((prevCounts: { [x: string]: Set<string>; }) => {
      const dayCounts = prevCounts[date] || new Set(); // 初始化Set
      dayCounts.add(word); // 使用 Set 的 add 方法确保唯一性

      return {
        ...prevCounts,
        [date]: dayCounts,
      };
    });
  };

  const updateWordSearchCounts = (word: string, count: number) => {
    setWordSearchCounts((prevCounts: any) => ({
      ...prevCounts,
      [word]: count,
    }));
  };


  const fetchWordData = async (term: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const wordData = {
          word: data[0].word,
          phonetic: data[0].phonetics[0]?.text || '',
          EnglishDefinition: [""],
          exampleSentences: [""],
        }
        if(data[0].meanings){
            for(const meaning of data[0].meanings){
              if(meaning.definitions){
                for(const definition of meaning.definitions){
                  wordData.EnglishDefinition.push(definition.definition)
                  if(definition.example && wordData.exampleSentences.length < 8){
                    wordData.exampleSentences.push(definition.example)
                  }
                }
              }
            }
        }
        
        return wordData
      }
      else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching word data:', error);
      return null;
    }
  };

  function isNotEnglishUnicode(text: string) {
    const allowedChars = /[^a-zA-Z\s.,!?';:"()\-\u2019]/;
    return allowedChars.test(text);
  }

  const openGoogleTranslate = (word: string) => {
    const url = `https://translate.google.com/?sl=zh-CN&tl=en&text=${word}&op=translate`;
    window.open(url, '_blank');
  };

  const handleSearch = async (term: string) => {
    if (isNotEnglishUnicode(term)) {
      openGoogleTranslate(term);
      return;
    }

    const wordData = await fetchWordData(term);
    if(wordData){
    setWordData(wordData);
      console.log("wordSearchCounts", wordSearchCounts)
      console.log("dailyWordCounts", dailyWordCounts)
      // 假设查询成功，更新查词列表
      updateWordSearchCounts(term, (wordSearchCounts[term] || 0) + 1);
      // 获取当前日期，并更新每日查词量
      // 获取当前日期，并更新每日查词量
      const today = new Date().toISOString().split('T')[0];
      updateDailyWordCounts(today, term);
    }else{
      console.log("Word not found")
    }

  };

  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col items-center justify-start">
      <header className="bg-blue-500 text-white p-4 rounded-md shadow-md mb-8 w-[80%] max-w-4xl">
        <nav className="bg-blue-500 text-white p-4 w-full">
          <div className="container mx-auto flex items-center justify-between">
            {/* 左侧：网站名称或 Logo */}
            <div className="flex items-center">
              <Book className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">English Word Learning</span>
            </div>

            {/* 右侧：导航链接 */}
            <ul className="flex space-x-6"> 
              <li><a href="#statistics" className="hover:text-gray-300">Statistics</a></li>
              <li><a href="#" className="hover:text-gray-300">About</a></li>
            </ul>
          </div>
        </nav>
      </header>
    
      {/* 搜索框居中 */}
      <div className="flex-grow flex items-center justify-center w-[80%] flex-1">
        <div className="max-w-4/5 w-full py-12">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* 内容区域*/}
      <div className="w-[80%] max-w-4/5 flex flex-col mb-8 mt-4 overflow-auto">
        <WordDefinition
          word={wordData.word}
          phonetic={wordData.phonetic}
          EnglishDefinitions={wordData.EnglishDefinition.length>0?wordData.EnglishDefinition:[""]}
          exampleSentences={wordData.exampleSentences.length>0?wordData.exampleSentences:[""]}
        />
        <div id="statistics">
          <Statistics wordSearchCounts={wordSearchCounts} dailyWordCounts={dailyWordCounts} />
        </div>
      </div>

    </div>
  );
}

export default App;
