"use client";

import { MessagesSquare, User, X } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.svg";
import { useChat } from "@/state";
import { signout } from "@/app/login/actions";
import { Cart } from "./cart";

const Navbar = () => {
  const { isChatOpen, toggleChat } = useChat();
  

  return (
    <div className="flex justify-between items-center w-full gap-3">
      <button className="p-3 flex cursor-pointer justify-center items-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
        <User onClick={signout} className="text-stone-800 w-5 h-5" />
      </button>
      <Image
        width="400"
        height="400"
        src={logo.src}
        alt={"Dar Alkhayma"}
        title={logo.title || "Dar Alkhayma"}
        className="h-16 dark:invert"
      />
      <div className="flex gap-2">
        <Cart />
        <button
          onClick={toggleChat}
          className="p-3 flex cursor-pointer justify-center items-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {isChatOpen ? <X className="text-stone-800 w-5 h-5" /> : <MessagesSquare className="text-stone-800 w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
