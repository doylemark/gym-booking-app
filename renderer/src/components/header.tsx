import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import { useCallback } from "react";

type HeaderProps = {
  days: string[];
  activeDayIdx: number;
  setActiveDay: (d: number) => void;
};

const Header = ({ activeDayIdx, days, setActiveDay }: HeaderProps) => {
  const handleIncrement = useCallback(() => {
    if (activeDayIdx + 1 < days.length) {
      setActiveDay(activeDayIdx + 1);
    }
  }, [activeDayIdx, days.length, setActiveDay]);

  const handleDecrement = useCallback(() => {
    if (activeDayIdx - 1 >= 0) {
      setActiveDay(activeDayIdx - 1);
    }
  }, [activeDayIdx, setActiveDay]);

  return (
    <header className="sticky top-0 flex items-center justify-between w-full p-6 bg-white border-b">
      <h1 className="text-xl">Gym Bookings</h1>
      <div className="flex shadow rounded-md">
        <button
          type="button"
          className={clsx(
            "flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2",
            "text-gray-400 hover:text-gray-500 focus:relative w-9 px-2 hover:bg-gray-50 border-r",
            "disabled:cursor-not-allowed"
          )}
          disabled={activeDayIdx - 1 < 0}
          onClick={handleDecrement}
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={clsx(
            "border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 pointer-events-none"
          )}
        >
          {new Intl.DateTimeFormat("en-us", {
            day: "numeric",
            weekday: "long",
            month: "long",
          }).format(new Date(days[activeDayIdx]))}
        </button>
        <button
          type="button"
          className={clsx(
            "flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2",
            "text-gray-400 hover:text-gray-500 focus:relative w-9 px-2 hover:bg-gray-50 border-l",
            "disabled:cursor-not-allowed"
          )}
          disabled={activeDayIdx + 1 >= days.length}
          onClick={handleIncrement}
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default Header;
