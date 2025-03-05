import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="flex items-center rounded-full bg-white shadow-md p-2 w-full">
      <input
        type="text"
        placeholder="Enter English word..."
        className="flex-grow outline-none px-4 rounded-full"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={(e) => {if (e.key === 'Enter') { handleSearchSubmit(e)}}}
      />
      <button onClick={handleSearchSubmit} className="text-gray-500 hover:text-gray-700 focus:outline-none">
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SearchBar;
