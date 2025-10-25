import { Calendar, Moon } from "lucide-react";
import React from "react";

const ReservationInfo = () => {
  return (
    <div className="flex flex-col text-white z-1 w-[90vw] py-10">
      <h1 className="font-medium text-6xl">Hi, Mr Ahmed</h1>

      <h3 className="flex items-center text-2xl mt-4 gap-3">
        <Calendar /> Thu 31 Augh → Sun 3 Sept <Moon /> 3 Nights
      </h3>
    </div>
  );
};

export default ReservationInfo;
