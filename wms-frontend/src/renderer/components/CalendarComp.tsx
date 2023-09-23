import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const CalendarComp = () => {
  //date state
  const [calendar, setCalendar] = useState('');
  //open or close
  const [open, setOpen] = useState(false);

  //get the target element to toggle
  const refOne = useRef(null);

  useEffect(() => {
    //set current date on component load
    setCalendar(format(new Date(), 'yyyy-MM-dd'));
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
  //on change, store data in state
  const handleSelect = (date: Date) => {
    setCalendar(format(date, 'yyyy-MM-dd'));
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <input
        value={'Date:' + ' ' + calendar}
        readOnly
        className="text-[22px] border-[2px] border-[#0000] rounded-[3px] p-[5px]"
        onClick={(e) => {
          //console log what was clicked
          console.log('clicked');
          setOpen((open) => !open);
        }}
      />
      <div ref={refOne}>
        {open && (
          <Calendar
            date={new Date(calendar)}
            className="calendarElement"
            onChange={handleSelect}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarComp;
