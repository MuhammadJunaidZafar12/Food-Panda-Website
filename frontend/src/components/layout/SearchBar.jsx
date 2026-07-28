import { Search } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search restaurants or food...",
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md overflow-hidden rounded-xl border border-gray-300 bg-white"
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 outline-none"
      />

      <button
        type="submit"
        className="bg-pink-600 px-5 text-white transition hover:bg-pink-700"
      >
        <Search size={20} />
      </button>
    </form>
  );
};

export default SearchBar;