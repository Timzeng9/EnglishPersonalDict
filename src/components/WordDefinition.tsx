import React, { useState, useCallback } from 'react';
import { Play } from 'lucide-react';
import { openYouglish } from './commonFunctions';

interface WordDefinitionProps {
  word: string;
  phonetic: string;
  EnglishDefinitions: string[];
  exampleSentences: string[];
}
const WordDefinition: React.FC<WordDefinitionProps> = ({
  word,
  phonetic,
  EnglishDefinitions,
  exampleSentences,
}) => {

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4 relative">
      <h2 className="text-6xl font-bold mb-2">
        {word}{' '}
        <button
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
          onClick={() => openYouglish(word)}
        >
          <Play className="inline-block h-10 w-10" />
        </button>
      </h2>
      <p className="text-gray-600 mb-2">{phonetic}</p>

      <h4 className="text-2xl font-bold mb-2 py-8">Meanings</h4>
      <ul>
        {EnglishDefinitions.map((definition, index) => (
          <li key={index} className="text-gray-800 mt-2">
            {definition.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="cursor-pointer hover:underline hover:text-blue-500"
                onClick={() => openYouglish(word)}
              >
                {word} {' '} {/* Add space after each word */}
              </span>
            ))}
          </li>
        ))}
      </ul>

      <h4 className="text-2xl font-bold mb-2 py-8">Example Sentences</h4>
      <ul>
        {exampleSentences.map((sentence, index) => (
          <li key={index} className="text-gray-800 mt-2">
            {sentence.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="cursor-pointer hover:underline hover:text-blue-500"
                onClick={() => openYouglish(word)}
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
