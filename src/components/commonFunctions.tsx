export const openYouglish = (word: string) => {
    const url = `https://youglish.com/pronounce/${word}/english/us`;
    window.open(url, '_blank');
  };