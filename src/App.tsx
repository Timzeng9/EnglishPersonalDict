import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WordDefinition from './components/WordDefinition';
import Statistics from './components/Statistics';
import History from './components/History';
import ScrollToTopButton from './components/ScrollToTopButton';
import { Book } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import Modal from './components/Modal';
import AuthForm from './components/AuthForm';
import { format } from 'date-fns';
import {
  isNotEnglishUnicode,
  fetchWordData,
  openGoogleTranslate,
  addQueriedWord,
  getDailyQueries,
  getTopNQueriesEfficient,
  getDailyQueryCounts,
} from './components/commonFunctions';

function App() {

  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制 Modal 显示的状态

  // 当前查询的单词
  const [wordData, setWordData] = useState({
    word: 'Apple',
    phonetic: '/ˈæpəl/',
    EnglishDefinition: ['', 'A common, round fruit produced by the tree Malus domestica, cultivated in temperate climates.',],
    exampleSentences: ['', "I like apples.", "Apples are good for health."],
  });
  // 每日查词数量
  const [dailyWordCounts, setDailyWordCounts] = useState<{ [key: string]: number }>({});
  const addDailyWordCounts = (date: string, count: number) => {
    setDailyWordCounts((prevCounts: { [x: string]: number; }) => {
      const dayCounts = (prevCounts[date] || 0) + count; // 初始化Set
      return {
        ...prevCounts,
        [date]: dayCounts,
      };
    });
  };
  // 今日查询单词
  const [todayWords, setTodayWords] = useState<Set<string>>(new Set());
  const addWord = (newWord: string) => {
    setTodayWords(prevWords => new Set([...prevWords, newWord]));
  };

  const [wordFrequency, setWordFrequency] = useState<{ [word: string]: number }>({});
  const addwordFrequency = (newWord: string) => {
    setWordFrequency((prevCounts: { [x: string]: number; }) => {
      const dayCounts = (prevCounts[newWord] || 0) + 1; // 初始化Set
      return {
        ...prevCounts,
        [newWord]: dayCounts,
      };
    });
  };

  let login_init = false;
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) { // 检查 currentUser 是否存在 (已登录)
        try {
          if (login_init) return;
          login_init = true;
          const today = format(new Date(), 'yyyy-MM-dd');
          const dailyQueries = await getDailyQueries(currentUser.uid, today);
          if (dailyQueries) {
            setTodayWords(() => new Set(Object.keys(dailyQueries.words)));
          }

          getDailyQueryCounts(currentUser.uid, 50).then((result) => {
            if (!result) return;
            setDailyWordCounts(() => result);
          });

          getTopNQueriesEfficient(currentUser.uid, 15).then((result) => {
            if (!result) return;
            setWordFrequency(() => result);
          });

        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.log("login currentUser", currentUser);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSearch = async (term: string) => {
    if (isNotEnglishUnicode(term)) {
      openGoogleTranslate(term);
      return;
    }

    const wordData = await fetchWordData(term);
    if (wordData) {
      setWordData(wordData);
      addwordFrequency(term);
      if (!todayWords.has(term)) {
        addDailyWordCounts(format(new Date(), 'yyyy-MM-dd'), 1);
        addWord(term);
      }

      // 增加查询的单词到数据库
      if (currentUser && currentUser.uid) {
        await addQueriedWord(currentUser.uid as string, term);
        const result = await getTopNQueriesEfficient(currentUser.uid, 15);
        if (result) {
          setWordFrequency(() => result);
        }
      }

    } else {
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast("Signed out successfully.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-400 py-6 flex flex-col items-center justify-start">
      <header className="bg-blue-500 text-white p-4 rounded-md shadow-md mb-8 w-[90%] mobile:w-[90%] md:w-[80%] max-w-4xl">
        <nav className="bg-blue-500 text-white p-4 w-full">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <Book className="h-6 w-6 mr-2" />
              <span className="text-lg mobile:text-lg md:text-xl font-bold">English Dictionary</span>
            </div>

            <ul className="flex space-x-3 mt-4 md:mt-0">
              <li>{currentUser?.email?.split('@')[0]} </li>
              <li><a href="#statistics" className="hover:text-gray-300">Statistics</a></li>
              <li><a href="#history" className="hover:text-gray-300">History</a></li>
              <li>
                <button
                  onClick={handleAboutClick}
                  className="hover:text-gray-300"
                  type="button"
                >
                  About
                </button>
              </li>
              <li>
                {currentUser ? (
                  <button onClick={handleSignOut} className="hover:text-gray-300">
                    Logout
                  </button>
                ) : (
                  <button onClick={() => setIsModalOpen(true)} className="hover:text-gray-300">
                    Login / Sign Up
                  </button>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <AuthForm onClose={() => setIsModalOpen(false)} />
      </Modal>
      <ScrollToTopButton />
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
          EnglishDefinitions={wordData.EnglishDefinition.length > 0 ? wordData.EnglishDefinition : [""]}
          exampleSentences={wordData.exampleSentences.length > 0 ? wordData.exampleSentences : [""]}
          onSearch={handleSearch}
        />

        <div id="statistics">
          <Statistics
            todayWords={todayWords}
            wordSearchCounts={wordFrequency}
            dailyWordCounts={dailyWordCounts}
            onSearch={handleSearch}
          />
        </div>
        <div id="history">
          <History
            todayWords={todayWords}
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
