import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { TableHeader } from './TableHeader';
import { TableTitle } from './TableTitle';

interface TableModalProps {
  title: string;
  headerList: string[];
  children?: React.ReactNode;
  handleSearch?: (search: string) => Promise<void>;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  placeholder?: string;
}

export const TableModal = ({
  title,
  children,
  headerList,
  handleSearch,
  modalOpen,
  setModalOpen,
  placeholder,
}: TableModalProps) => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        modalOpen ? 'block' : 'hidden'
      } w-full p-4 overflow-x-hidden overflow-y-auto h-full bg-black bg-opacity-50 flex justify-center items-center backdrop-filter backdrop-blur-sm`}
      onClick={toggleModal}
    >
      <div
        className="relative bg-white rounded-lg shadow w-4/5 h-4/5 p-6 overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="w-full h-full bg-transparent rounded-lg overflow-hidden">
          <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
            {handleSearch && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  handleSearch(search).finally(() => {
                    setLoading(false);
                  });
                }}
              >
                <TableTitle placeholder={placeholder} setSearch={setSearch}>
                  <p className="text-3xl font-medium tracking-tight text-gray-900">
                    {title}
                  </p>
                </TableTitle>
              </form>
            )}
            <div className="overflow-y-auto h-full relative">
              {loading && (
                <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                  <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
                </div>
              )}
              <table className="w-full text-sm text-left text-gray-500">
                <TableHeader>
                  {headerList.length > 0 &&
                    headerList.map((header, index) => (
                      <th className="py-3" key={index}>
                        {header}
                      </th>
                    ))}
                </TableHeader>
                <tbody className="overflow-y-auto">{children}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
