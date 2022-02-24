import { ReactNode } from "react";

import { Session } from "../../lib/gym-sessions";

const timeFmt = (d: Date) => {
  return new Intl.DateTimeFormat("en-us", {
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(d);
};

type SessionProps = {
  session: Session;
  activeDay: string;
  children: ReactNode;
};

const SessionItem = ({ session, activeDay, children }: SessionProps) => {
  const startDate = new Date(activeDay + "-" + session.time);
  const endDate = new Date(startDate.getTime() + 75 * 60000);
  const bookingDate = new Date(startDate.getTime() - 180 * 60000);

  return (
    <li className="flex justify-between items-center p-4 border shadow rounded-lg">
      <div>
        <p className="text-gray-900 text-lg flex items-center">
          {session.location}
        </p>
        <p className="text-gray-700">
          {timeFmt(startDate)} - {timeFmt(endDate)} ({timeFmt(bookingDate)})
        </p>
      </div>
      {children}
    </li>
  );
};

export default SessionItem;
