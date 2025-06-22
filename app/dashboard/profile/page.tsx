"use client";

import React from "react";
import Image from "next/image";
import ProfilePlaceholder from "@/public/assets/profile_picture_placeholder.png";

import { useAuth } from "@/context/AuthContext";

const ProfileOverview = () => {
  const { username, email, totalPoint, avatarURL } = useAuth();
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-10">
        <div id="leftPart" className="flex flex-row items-center gap-5">
          <Image
            src={avatarURL || ProfilePlaceholder}
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full"
          />
          <div className="text-left flex flex-col h-full justify-center gap-2">
            <h1 className="text-4xl font-bold">{username}</h1>
            <p className="text-md font-normal">{email}</p>
          </div>
        </div>
        <div id="rightPart">
          <h1 className="text-4xl font-bold">{totalPoint}</h1>
          <p className="text-md font-normal">Total Point</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
