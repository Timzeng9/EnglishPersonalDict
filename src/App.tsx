import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WordDefinition from './components/WordDefinition';
import Statistics from './components/Statistics';
import { Book } from 'lucide-react';
import { isNotEnglishUnicode, openGoogleTranslate } from './components/commonFunctions';

interface DailyWordCountsDictionary {
  [key: string]: Array<string>; 
}

function App() {
  // localStorage.clear();
  const [wordData, setWordData] = useState({
    word: 'Apple',
    phonetic: '/ˈæpəl/',
    EnglishDefinition: ['','A common, round fruit produced by the tree Malus domestica, cultivated in temperate climates.',],
    exampleSentences: ['',"I like apples.", "Apples are good for health."],
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
      const today = new Date().toISOString().split('T')[0];
      updateDailyWordCounts(today, term);
    }else{
      console.log("Word not found")
      showToast("Sorry, the word was not found.");
    }

  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // 阻止表单的默认提交
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAboutClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  function showToast(message: string): void {
    const toastContainer = document.getElementById('toast-container') as HTMLDivElement | null;
    const toastMessageElement = document.getElementById('toast-message') as HTMLDivElement | null;

    if (!toastContainer || !toastMessageElement) {
        console.error("Toast container or message element not found!");
        return;
    }

    toastMessageElement.classList.remove('fade-out');
    toastMessageElement.style.opacity = '1';
    toastMessageElement.classList.add('bg-blue-400');
    toastMessageElement.textContent = message;

    toastContainer.style.display = 'block';
    // 触发 reflow
    toastMessageElement.offsetHeight;
    toastMessageElement.classList.add('fade-out');

    setTimeout(() => {
        toastMessageElement.classList.remove('fade-out');
        toastMessageElement.classList.remove('bg-blue-400');
        toastContainer.style.display = 'none';
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col items-center justify-start">
      <header className="bg-blue-500 text-white p-4 rounded-md shadow-md mb-8 w-[90%] mobile:w-[90%] md:w-[80%] max-w-4xl">
        <nav className="bg-blue-500 text-white p-4 w-full">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <Book className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">English Dictionary</span>
            </div>

            <ul className="flex space-x-6"> 
              <li><a href="#statistics" className="hover:text-gray-300">Statistics</a></li>
              <li>
                <button 
                  onClick={handleAboutClick}
                  className="hover:text-gray-300"
                  type="button"
                >
                  About
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <div id="toast-container">
        <div id="toast-message">
            </div>
      </div>

      {/* 显式添加 form 并绑定 onSubmit */}
      <form onSubmit={handleSubmit} className="flex-grow flex items-center justify-center w-[90%] mobile:w-[90%] md:w-[80%] flex-1">
        <div className="max-w-4/5 w-full py-12">
          <SearchBar onSearch={handleSearch} />
        </div>
      </form>

      <div className="w-[90%] mobile:w-[90%] md:w-[80%] max-w-4/5 flex flex-col mb-8 mt-4 overflow-auto">
        <WordDefinition
          word={wordData.word}
          phonetic={wordData.phonetic}
          EnglishDefinitions={wordData.EnglishDefinition.length>0?wordData.EnglishDefinition:[""]}
          exampleSentences={wordData.exampleSentences.length>0?wordData.exampleSentences:[""]}
          onSearch={handleSearch}
        />
        <div id="statistics">
          <Statistics 
              wordSearchCounts={wordSearchCounts} 
              dailyWordCounts={dailyWordCounts}
              onSearch={handleSearch}
          />
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] mobile:w-[90%] md:w-[80%] max-w-md">
            <h2 className="text-lg font-semibold text-blue-500 mb-4">About</h2>
            <p>This is a fun English dictionary app for personal use.</p>
            <p>More details email <a href="mailto:zzhmail01@gmail.com" className="text-blue-500 hover:underline">zzhmail01@gmail.com</a> </p>
            <button
              onClick={handleCloseDialog}
              type="button"
              className="px-4 py-2 mt-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 mx-auto block"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
