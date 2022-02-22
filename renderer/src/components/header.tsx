import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import { useCallback } from "react";

import type { GymFilter } from "../App";

type HeaderProps = {
  days?: string[];
  activeDayIdx: number;
  setActiveDay: (d: number) => void;
  setFilter: (f: GymFilter) => void;
};

const Header = ({
  activeDayIdx,
  days,
  setActiveDay,
  setFilter,
}: HeaderProps) => {
  const handleIncrement = useCallback(() => {
    if (days && activeDayIdx + 1 < days.length) {
      setActiveDay(activeDayIdx + 1);
    }
  }, [activeDayIdx, days, setActiveDay]);

  const handleDecrement = useCallback(() => {
    if (days && activeDayIdx - 1 >= 0) {
      setActiveDay(activeDayIdx - 1);
    }
  }, [activeDayIdx, days, setActiveDay]);

  return (
    <>
      <div className="w-full bg-indigo-600 p-6 border-b">
        <h1 className="text-2xl font-semibold text-white">Gym Bookings</h1>
      </div>
      <header className="sticky top-0 flex items-center justify-between p-6 bg-white border-b">
        <div className="flex flex-col">
          <select
            id="location"
            name="location"
            className={clsx(
              "flex w-full pl-3 pr-10 py-2 text-base border-gray-300 min-w-[200px] shadow-sm",
              "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            )}
            defaultValue="Poolside Gym"
            onChange={(e) => setFilter(e.target.value as GymFilter)}
          >
            <option>Poolside Gym</option>
            <option>Performance Gym</option>
          </select>
        </div>
        {days ? (
          <div className="flex shadow-sm rounded-md h-full">
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
                "border-t border-b border-gray-300 bg-white px-3.5 text-sm",
                "font-medium text-gray-700 pointer-events-none"
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
        ) : null}
      </header>
    </>
  );
};

export default Header;
