import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { DateRange } from 'react-date-range';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

interface DateRangeCompProps {
  initRange: {
    startDate: Date;
    endDate: Date;
    key: string;
  }[];
  setRange: React.Dispatch<
    React.SetStateAction<
      {
        startDate: Date;
        endDate: Date;
        key: string;
      }[]
    >
  >;
}

const DateRangeComp = ({ initRange, setRange }: DateRangeCompProps) => {
  //open or close
  const [open, setOpen] = useState(false);

  //get the target element to toggle
  const refOne = useRef(null);

  useEffect(() => {
    //set current date on component load
    document.addEventListener('keydown', hideOnEscape, true);
    document.addEventListener('click', hideOnClickOutside, true);
  }, []);
  //hide dropdown on escape
  const hideOnEscape = (e: any) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };
  //hide dropdown on outside click
  const hideOnClickOutside = (e: any) => {
    if (
      refOne.current &&
      !(refOne.current as HTMLElement).contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };

  return (
    <div className="block relative w-1/3 p-3">
      <input
        className="text-[22px] border-[2px] border-[#0000] rounded-[3px] p-[5px] min-w-[25rem]"
        value={
          'From:' +
          ' ' +
          format(initRange[0].startDate, 'yyyy-MM-dd') +
          ' To: ' +
          format(initRange[0].endDate, 'yyyy-MM-dd')
        }
        readOnly
        onClick={() => {
          setOpen((open) => !open);
        }}
      />
      <div ref={refOne} className="flex justify-center ">
        {open && (
          <DateRange
            onChange={(items) => setRange([items.selection])}
            editableDateInputs={true}
            moveRangeOnFirstSelection={false}
            ranges={initRange}
            months={1}
            direction="horizontal"
          />
        )}
      </div>
    </div>
  );
};

export default DateRangeComp;
