import { MagnifyingGlassIcon } from '@phosphor-icons/react';

export default function SearchBar({ value = '', onChange }) {
  return (
    <div
      className={`group relative flex items-center w-10 h-10 px-4 py-2 rounded-lg border border-gray-600 overflow-hidden transition-all ease-in-out ${value.length > 0 ? 'w-64' : 'focus-within:w-64'}`}
    >
      <label
        className="absolute left-0 flex items-center justify-center w-10 h-10 transition-all ease-in-out cursor-pointer"
        htmlFor="admSearch"
      >
        <MagnifyingGlassIcon size={20} />
      </label>
      <input
        className={`w-full h-full pl-6 opacity-0 outline-none cursor-pointer group-focus-within:cursor-text placeholder:text-gray-500 ${value.length > 0 ? 'opacity-100 cursor-text' : 'group-focus-within:opacity-100'}`}
        id="admSearch"
        type="text"
        placeholder="Pesquisar usuário..."
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
