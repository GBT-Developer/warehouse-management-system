import React from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

export const TableHeader = () => {
  return (
    <div className="flex items-center space-x-6">
      <div className="flex gap-2 text-sm font-normal text-gray-500 dark:text-gray-400">
        Showing
        <p className="font-semibold text-gray-900 dark:text-white">1-1</p>
        of
        <p className="font-semibold text-gray-900 dark:text-white">1</p>
      </div>
      <ul className="inline-flex items-stretch -space-x-px">
        <li>
          <a
            href="/"
            className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <BsChevronLeft />
          </a>
        </li>
        <li>
          <a
            href="/"
            className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            1
          </a>
        </li>
        <li>
          <a
            href="/"
            className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            2
          </a>
        </li>
        <li>
          <a
            href="/"
            className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <BsChevronRight />
          </a>
        </li>
      </ul>
    </div>
  );
};
