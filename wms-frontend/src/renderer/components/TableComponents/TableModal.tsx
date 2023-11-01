import { useState } from 'react';
import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BsSearch } from 'react-icons/bs';
import { useAuth } from 'renderer/providers/AuthProvider';
import { TableHeader } from './TableHeader';

export interface SearchProps {
  motor_type: string;
  part: string;
  color: string;
}

interface TableModalProps {
  title: string;
  headerList: string[];
  children?: React.ReactNode;
  handleSearch?: (search: SearchProps) => Promise<void>;
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  motor_type_placeholder?: string;
  part_placeholder?: string;
  color_placeholder?: string;
}

export const TableModal = ({
  title,
  children,
  headerList,
  handleSearch,
  modalOpen,
  setModalOpen,
  motor_type_placeholder,
  part_placeholder,
  color_placeholder,
}: TableModalProps) => {
  const [search, setSearch] = useState<SearchProps>({
    motor_type: '',
    part: '',
    color: '',
  });
  const [loading, setLoading] = useState(false);
  const { warehousePosition } = useAuth();

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
            <div className={`w-full flex justify-between items-center gap-2`}>
              <div className="w-full h-[1px] bg-gray-100"></div>
              <p
                className="rounded-md p-2 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                onClick={toggleModal}
              >
                <AiOutlineClose />
              </p>
            </div>
            {handleSearch && (
              <form
                className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 py-4 mb-[2rem]"
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoading(true);
                  handleSearch(search).finally(() => {
                    setLoading(false);
                  });
                }}
              >
                <p className="text-3xl font-medium tracking-tight text-gray-900">
                  {title}
                </p>
                <div className="w-full md:w-1/2 flex items-center">
                  <div className="relative flex w-full bg-gray-50 border border-gray-300 rounded-lg">
                    <button
                      type="submit"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    >
                      <BsSearch />
                    </button>

                    <input
                      type="text"
                      id="motor-type-search"
                      className="bg-transparent text-gray-900 text-sm focus:outline-none focus:border-primary-500 block w-full p-2 border-r border-gray-300"
                      placeholder={
                        motor_type_placeholder
                          ? motor_type_placeholder
                          : 'Telusuri ...'
                      }
                      onChange={(event) => {
                        setSearch((prev) => ({
                          ...prev,
                          motor_type: event.target.value,
                        }));
                      }}
                    />

                    <input
                      disabled={search.motor_type === ''}
                      type="text"
                      id="part-search"
                      className="bg-transparent text-gray-900 text-sm focus:outline-none focus:border-primary-500 block w-full p-2 border-r border-gray-300"
                      placeholder={
                        part_placeholder ? part_placeholder : 'Telusuri ...'
                      }
                      onChange={(event) =>
                        setSearch((prev) => ({
                          ...prev,
                          part: event.target.value,
                        }))
                      }
                    />

                    {warehousePosition !== 'Gudang Bahan' && (
                      <input
                        disabled={
                          search.motor_type === '' ||
                          warehousePosition === 'Gudang Bahan'
                        }
                        type="text"
                        id="color-search"
                        className="bg-transparent text-gray-900 text-sm focus:outline-none focus:border-primary-500 block w-full pr-10 p-2"
                        placeholder={
                          color_placeholder ? color_placeholder : 'Telusuri ...'
                        }
                        onChange={(event) =>
                          setSearch((prev) => ({
                            ...prev,
                            color: event.target.value,
                          }))
                        }
                      />
                    )}
                  </div>
                </div>
              </form>
            )}
            <div className="overflow-y-auto h-full relative">
              {loading && (
                <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-50 bg-opacity-50">
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
