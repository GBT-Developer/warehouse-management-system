import { BsSearch } from 'react-icons/bs';

interface SearchBarProps {
  handleSearch: (value: string) => void;
}

export const SearchBar = ({ handleSearch }: SearchBarProps) => {
  return (
    <div className="w-full md:w-1/2 flex items-center">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <BsSearch />
        </div>
        <input
          type="text"
          id="simple-search"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Cari email pengguna"
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>
    </div>
  );
};
