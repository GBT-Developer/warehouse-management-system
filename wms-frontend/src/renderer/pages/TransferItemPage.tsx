import { useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from 'renderer/layout/PageLayout';

export const TransferItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <PageLayout>
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
        Transfer Item
      </h1>
      <form
        className={`w-2/3 py-14 my-10 flex flex-col gap-3 relative${
          loading ? 'p-2' : ''
        }`}
      >
        {loading && (
          <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0">
            <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
          </div>
        )}
      </form>
    </PageLayout>
  );
};
