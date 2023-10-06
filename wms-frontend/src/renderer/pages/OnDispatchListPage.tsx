import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { PiFilePdfBold } from 'react-icons/pi';
import { PdfViewer } from 'renderer/components/PdfViewer';
import { SingleTableItem } from 'renderer/components/TableComponents/SingleTableItem';
import { TableHeader } from 'renderer/components/TableComponents/TableHeader';
import { TableTitle } from 'renderer/components/TableComponents/TableTitle';
import { db } from 'renderer/firebase';
import { DispatchNote } from 'renderer/interfaces/DispatchNote';
import { Product } from 'renderer/interfaces/Product';
import { PageLayout } from 'renderer/layout/PageLayout';

export const OnDispatchListPage = () => {
  const [search, setSearch] = useState('');
  const [dispatchNoteList, setDispatchNoteList] = useState<DispatchNote[]>([]);
  const [products, setProducts] = useState<
    (Product & {
      dispatch_note_id: string;
    })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showProductsMap, setShowProductsMap] = useState<
    Record<string, boolean>
  >({});
  const [modalOpen, setModalOpen] = useState(false);
  const [clickedDispatchNote, setClickedDispatchNote] =
    useState<DispatchNote | null>(null);

  const toggleShowProducts = (purchaseId: string) => {
    setShowProductsMap((prevState) => ({
      ...prevState,
      [purchaseId]: !prevState[purchaseId],
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // First fetch the dispatch notes
        const dispatchnoteQuery = query(collection(db, 'dispatch_note'));
        const dispatchnoteSnapshot = await getDocs(dispatchnoteQuery);
        const dispatchnoteList: DispatchNote[] = [];
        dispatchnoteSnapshot.forEach((doc) => {
          const data = doc.data() as DispatchNote;
          data.id = doc.id;
          dispatchnoteList.push(data);
        });

        if (dispatchnoteList.length === 0) {
          setLoading(false);
          return;
        }

        // Then fetch the products
        const productQuery = query(
          collection(db, 'on_dispatch'),
          where(
            'dispatch_note_id',
            'in',
            dispatchnoteList.map((dn) => dn.id)
          )
        );
        const productSnapshot = await getDocs(productQuery);
        const productList: (Product & { dispatch_note_id: string })[] = [];
        productSnapshot.forEach((doc) => {
          const data = doc.data() as Product & { dispatch_note_id: string };
          productList.push(data);
        });

        setDispatchNoteList(dispatchnoteList);
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().catch((error) => {
      console.log(error);
    });
  }, []);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              List Pengiriman
            </h1>
          </TableTitle>
          <div className="overflow-y-auto h-full relative">
            {loading && (
              <div className="absolute flex justify-center items-center py-2 px-3 top-0 left-0 w-full h-full bg-gray-50 rounded-lg z-0 bg-opacity-50">
                <AiOutlineLoading3Quarters className="animate-spin flex justify-center text-4xl" />
              </div>
            )}

            <table className="w-full text-sm text-left text-gray-500">
              <TableHeader>
                <th className=" py-3">Tanggal</th>
                <th className=" py-3">Nomor Surat Jalan</th>
                <th className=" py-3">Nama Tukang Cat</th>
                <th className=" py-3">Jumlah Produk</th>
              </TableHeader>
              <tbody>
                {dispatchNoteList.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3" colSpan={4}>
                      <p className="flex justify-center">No data</p>
                    </td>
                  </tr>
                ) : (
                  dispatchNoteList
                    .filter((dispatchNote) => {
                      if (search === '') return dispatchNote;
                      else if (
                        dispatchNote.painter
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return dispatchNote;
                    })
                    .map((dispatchNote, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className="border-b hover:shadow-md cursor-pointer"
                          onClick={() => {
                            if (!dispatchNote.id) return;
                            toggleShowProducts(dispatchNote.id);
                          }}
                        >
                          <SingleTableItem>{dispatchNote.date}</SingleTableItem>
                          <SingleTableItem>{dispatchNote.id}</SingleTableItem>
                          <SingleTableItem>
                            {dispatchNote.painter}
                          </SingleTableItem>
                          <SingleTableItem>
                            {dispatchNote.dispatch_items.length}
                          </SingleTableItem>
                          <SingleTableItem>
                            <button
                              type="button"
                              className="text-blue-500 text-lg p-2 hover:text-blue-700 cursor-pointer bg-transparent rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!dispatchNote) return;
                                setClickedDispatchNote(dispatchNote);
                                setModalOpen(true);
                              }}
                            >
                              <PiFilePdfBold />
                            </button>
                          </SingleTableItem>
                        </tr>
                        {dispatchNote.id &&
                          showProductsMap[dispatchNote.id] && (
                            <tr className="border-b">
                              <td colSpan={5}>
                                {' '}
                                {products
                                  .filter(
                                    (product) =>
                                      product.dispatch_note_id ===
                                      dispatchNote.id
                                  )
                                  .map((product, index) => (
                                    <div key={index} className="py-[0.75rem]">
                                      <div>
                                        {product.brand +
                                          ' ' +
                                          product.motor_type +
                                          ' ' +
                                          product.part +
                                          ' ' +
                                          product.available_color}
                                        : {product.count}x
                                      </div>
                                    </div>
                                  ))}
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    ))
                )}
              </tbody>
            </table>
          </div>
          {clickedDispatchNote && (
            <PdfViewer
              products={products.filter(
                (product) => product.dispatch_note_id === clickedDispatchNote.id
              )}
              setInvoice={() => {}}
              setDipatchNote={setClickedDispatchNote}
              dispatchNote={clickedDispatchNote}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              invoice={null}
              destinationName={clickedDispatchNote.painter}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};
