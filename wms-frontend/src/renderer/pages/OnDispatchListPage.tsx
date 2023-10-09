import { format } from 'date-fns';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { PiFilePdfBold } from 'react-icons/pi';
import DateRangeComp from 'renderer/components/DateRangeComp';
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
  const [filteredDispatchNoteList, setFilteredDispatchNoteList] = useState<
    DispatchNote[]
  >([]);
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

  // Take the first date of the month as the start date
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      'yyyy-MM-dd'
    )
  );
  // Take the last date of the month as the end date
  const [endDate, setEndDate] = useState(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      'yyyy-MM-dd'
    )
  );
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

  //filter by date
  useEffect(() => {
    // Convert startDate and endDate to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Use the filter method to filter invoices within the date range
    const filteredDispatchNoteList = dispatchNoteList.filter((dispatchNote) => {
      const dispatchNoteDate = new Date(dispatchNote.date ?? '');
      // Check if the invoice date is within the date range
      return dispatchNoteDate >= startDateObj && dispatchNoteDate <= endDateObj;
    });
    setFilteredDispatchNoteList(filteredDispatchNoteList);
  }, [startDate, endDate, dispatchNoteList]);

  return (
    <PageLayout>
      <div className="w-full h-full bg-transparent overflow-hidden">
        <div className="relative shadow-md sm:rounded-lg overflow-auto h-full flex flex-col justify-between">
          <TableTitle setSearch={setSearch}>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              List Pengiriman
            </h1>
          </TableTitle>
          <div className="flex flex-col justify-center">
            <p>Periode tanggal:</p>
            <DateRangeComp
              {...{ startDate, endDate, setStartDate, setEndDate }}
            />
          </div>
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
                      <p className="flex justify-center">Data tidak tersedia</p>
                    </td>
                  </tr>
                ) : (
                  filteredDispatchNoteList
                    .filter((dispatchNote) => {
                      if (search === '') return dispatchNote;
                      else if (
                        dispatchNote.painter
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                        return dispatchNote;
                    })
                    .sort((a, b) => {
                      if (a.time === undefined || b.time === undefined)
                        return 0;
                      return a.time > b.time ? -1 : 1;
                    })
                    .sort((a, b) => {
                      if (a.date === undefined || b.date === undefined)
                        return 0;
                      return (
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      );
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
                          <SingleTableItem>
                            <span className="font-medium text-md">
                              {dispatchNote.date}
                              <br />
                              <span className="text-sm font-normal">
                                {dispatchNote.time}
                              </span>
                            </span>
                          </SingleTableItem>
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
