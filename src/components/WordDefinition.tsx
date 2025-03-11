import React, { useCallback, useEffect } from 'react';
import { Play, Youtube, Image } from 'lucide-react';
import usePronunciationSound from '../hooks/usePronunciation'
import { openYouglish, removeNonEnglishLetters, openPixabaySearch } from './commonFunctions';

interface WordDefinitionProps {
  word: string;
  phonetic: string;
  EnglishDefinitions: string[];
  exampleSentences: string[];
  onSearch: (searchTerm: string) => void;
}
const WordDefinition: React.FC<WordDefinitionProps> = ({
  word,
  phonetic,
  EnglishDefinitions,
  exampleSentences,
  onSearch,
}) => {

  const { play, stop } = usePronunciationSound(word)

  const playSound = useCallback(() => {
    stop()
    play()
  }, [play, stop])

  useEffect(() => {
    if (word) {
      stop();
      play();
    }
  }, [word, play, stop]);

  const handleSubmit = (word : string) => {
    onSearch(removeNonEnglishLetters(word))
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4 relative">
      <h2 className="text-5xl font-bold mb-2">
      <span
        className="cursor-pointer text-blue-500"
        >
          {word} {' '} 
        </span>
        <button
          className="text-green-500 hover:text-green-700 focus:outline-none"
          onClick={() => openPixabaySearch(word)}
        >
          <Image className="inline-block h-10 w-10" />
        </button>
        {' '} 
        <button
          className="text-red-500 hover:text-red-700 focus:outline-none"
          onClick={() => openYouglish(word)}
        >
          <Youtube className="inline-block h-12 w-12" />
        </button>
        {' '} 
        <button
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
          onClick={playSound}
        >
          <Play className="inline-block h-10 w-10" />
        </button>
      </h2>
      <p className="text-gray-600 mb-2">{phonetic}</p>

      <h4 className="text-2xl font-bold mb-2 py-8">Meanings</h4>
      <ul>
        {EnglishDefinitions.map((definition, index) => (
          <li key={index} className="text-gray-800 mt-2">
            {index > 0 && (<span > {index} {'.'} </span>)}
            {definition.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="cursor-pointer hover:underline hover:text-blue-500"
                onClick={() => handleSubmit(word)}
              >
                {word} {' '} 
              </span>
            ))}
          </li>
        ))}
      </ul>

      {exampleSentences.length > 1 && <h4 className="text-2xl font-bold mb-2 py-8">Example Sentences</h4>}
      <ul>
        {exampleSentences.map((sentence, index) => (
          <li key={index} className="text-gray-800 mt-2">
            {index > 0 && (<span > {index} {'.'} </span>)}
            {sentence.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="cursor-pointer hover:underline hover:text-blue-500"
                onClick={() => handleSubmit(word)}
              >
                {word} {' '}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WordDefinition;
