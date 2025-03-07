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

  export function removeNonEnglishLetters(input: string): string {
    // 使用正则表达式匹配所有非英文字母的字符（包括空格、数字、标点符号等）
    // [^a-zA-Z] 匹配任何不在 a-z 和 A-Z 范围内的字符
    // g 修饰符表示全局匹配（替换所有匹配项，而不是只替换第一个）
    return input.replace(/[^a-zA-Z]/g, "");
  }