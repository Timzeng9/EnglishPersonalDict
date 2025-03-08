import {
  ref,
  get,
  runTransaction,
  orderByChild,
  limitToLast,
  query,
} from "firebase/database";
import { db } from "../firebase";
import { format, subDays } from 'date-fns';

export const openYouglish = (word: string) => {
  const url = `https://youglish.com/pronounce/${word}/english/us`;
  window.open(url, '_blank');
};

export function isNotEnglishUnicode(text: string) {
  const allowedChars = /[^a-zA-Z\s.,!?';:"()\-\u2019]/;
  return allowedChars.test(text);
}

export const openGoogleTranslate = (word: string) => {
  const url = `https://translate.google.com/?sl=zh-CN&tl=en&text=${word}&op=translate`;
  window.open(url, '_blank');
};

export const openPixabaySearch = (word: string) => {
  const url = `https://pixabay.com/images/search/${word}/`;
  window.open(url, '_blank');
};

export function removeNonEnglishLetters(input: string): string {
  // 使用正则表达式匹配所有非英文字母的字符（包括空格、数字、标点符号等）
  // [^a-zA-Z] 匹配任何不在 a-z 和 A-Z 范围内的字符
  // g 修饰符表示全局匹配（替换所有匹配项，而不是只替换第一个）
  return input.replace(/[^a-zA-Z]/g, "");
}

export const fetchWordData = async (term: string) => {
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
      if (data[0].meanings) {
        for (const meaning of data[0].meanings) {
          if (meaning.definitions) {
            for (const definition of meaning.definitions) {
              wordData.EnglishDefinition.push(definition.definition)
              if (definition.example && wordData.exampleSentences.length < 8) {
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

// 添加查询的单词（包括每日和总计）
export async function addQueriedWord(userId: string, word: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dailyWordsRef = ref(db, `users/${userId}/dailyQueries/${today}/words`);
  const dailyCountRef = ref(db, `users/${userId}/dailyQueries/${today}/count`);
  const allTimeRef = ref(db, `users/${userId}/allTimeQueries/${word}`);

  // 1. 客户端检查：检查单词是否已存在于当天的 dailyQueries 中
  const dailyWordsSnapshot = await get(dailyWordsRef);
  const wordAlreadyExistsToday = dailyWordsSnapshot.exists() && dailyWordsSnapshot.val()[word];

  // 2. 更新 dailyQueries (如果需要)
  if (!wordAlreadyExistsToday) {
    try {
      await runTransaction(dailyWordsRef, (currentData) => {
        if (currentData) {
          currentData[word] = true;
          return currentData;
        } else {
          return { [word]: true };
        }
      });
      await runTransaction(dailyCountRef, (currentData) => {
        if (currentData) {
          return currentData + 1
        } else {
          return 1; //如果count不存在，则初始化为1
        }
      })
    } catch (error) {
      console.error("Daily queries transaction failed:", error);
      throw error; // 或进行其他错误处理
    }
  }

  // 3. 更新 allTimeQueries (总是更新)
  try {
    await runTransaction(allTimeRef, (currentCount) => {
      return (currentCount || 0) + 1;
    });
  } catch (error) {
    console.error("All-time queries transaction failed:", error);
    throw error; // 或进行其他错误处理
  }
}

// 高效获取用户查询次数最高的前 N 个单词及其次数
export async function getTopNQueriesEfficient(
  userId: string,
  n: number
): Promise<{ [word: string]: number } | null> {
  const allTimeRef = ref(db, `users/${userId}/allTimeQueries`);

  // 构建查询
  const topNQuery = query(
    allTimeRef,
    orderByChild('count'), // 按 'count' 字段排序
    limitToLast(n)     // 获取最后（最大）的 N 个
  );

  const snapshot = await get(topNQuery);

  if (snapshot.exists()) {
    // 因为 limitToLast 返回的是按 key 升序排列的结果，我们需要反转
    const orderedData: { [key: string]: number } = {};
    const keys = Object.keys(snapshot.val()).reverse();
    keys.forEach(key => {
      orderedData[key] = snapshot.val()[key];
    });

    return orderedData;
  } else {
    return null;
  }
}

// 获取用户某天的查询记录
export async function getDailyQueries(userId: string, date: string): Promise<{ words: { [word: string]: true }, count: number } | null> {
  const dailyRef = ref(db, `users/${userId}/dailyQueries/${date}`);
  const snapshot = await get(dailyRef);
  if (snapshot.exists()) {
    return snapshot.val()
  } else {
    return null
  }
}

// 获取用户最近 N 天每天的查询数量
export async function getDailyQueryCounts(userId: string, nDays: number): Promise<{ [date: string]: number }> {
  const today = new Date();
  const results: { [date: string]: number } = {};

  // 构建 N 天的日期数组
  const dates = Array.from({ length: nDays }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd')).reverse();

  // 使用 Promise.all 并发查询
  await Promise.all(
    dates.map(async (date) => {
      const dailyCountRef = ref(db, `users/${userId}/dailyQueries/${date}/count`);
      const snapshot = await get(dailyCountRef);
      results[date] = snapshot.exists() ? (snapshot.val() as number) : 0; // 获取数量，如果不存在则为 0
    })
  );

  return results;
}

