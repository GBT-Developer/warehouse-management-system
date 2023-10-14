import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme css file

interface DateRangeCompProps {
  startDate: string;
  endDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  showTop?: boolean;
}

const DateRangeComp = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  showTop = false,
}: DateRangeCompProps) => {
  // Open or close
  const [open, setOpen] = useState(false);

  // Get the target element to toggle
  const refOne = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Set current date on component load
    const escButtonListener = (e: KeyboardEvent) => hideOnEscape(e);

    // Close dropdown on click outside
    const clickListener = (e: MouseEvent) => {
      if (!refOne.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', escButtonListener);
    document.addEventListener('click', clickListener, true);

    return () => {
      document.removeEventListener('keydown', escButtonListener);
      document.removeEventListener('click', clickListener);
    };
  }, []);
  // Hide dropdown on escape
  const hideOnEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="flex flex-col w-2/3 relative">
      <div
        className="flex text-center items-center py-[0.15rem] w-[fit-content] rounded-sm cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <p>Dari:&nbsp;</p>
        <p className="font-medium text-[1.15rem]">
          {format(new Date(startDate), 'dd/MM/yyyy')}
        </p>
        <p>&nbsp;&nbsp;sampai:&nbsp;</p>
        <p className="font-medium text-[1.15rem]">
          {format(new Date(endDate), 'dd/MM/yyyy')}
        </p>
      </div>
      {open && (
        <div ref={refOne}>
          <DateRange
            className={`absolute ${
              showTop ? 'bottom-[60px]' : 'top-[50px]'
            } left-0 z-[100]`}
            onChange={(items) => {
              const startDate = items.selection.startDate;
              const endDate = items.selection.endDate;

              if (startDate && endDate) {
                setStartDate(format(startDate, 'yyyy-MM-dd'));
                setEndDate(format(endDate, 'yyyy-MM-dd'));
              }
            }}
            onRangeFocusChange={(focusedRange) => {
              if (focusedRange[1] === 0) setOpen(true);
            }}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={[
              {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                key: 'selection',
              },
            ]}
            months={1}
            direction="horizontal"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeComp;
