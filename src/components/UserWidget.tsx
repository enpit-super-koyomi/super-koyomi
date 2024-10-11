"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";

const DEFAULT_IMAGE = "/images/default.png";

export const UserWeiget = ({
  signin,
  name,
  picture,
}: {
  signin: boolean;
  name: string | undefined;
  picture: string | undefined;
}) => {
  return (
    <div>
      {signin ? (
        <button
          onClick={async () => await signOut()}
          className="flex items-center gap-2 border-solid rounded-full hover:bg-gray-200 p-2"
        >
          <Image
            src={picture ?? DEFAULT_IMAGE}
            width={40}
            height={40}
            alt="アイコン"
            className="rounded-full"
          />
          <p>{name}</p>
        </button>
      ) : (
        <Button onClick={async () => await signIn()}>サインイン</Button>
      )}
    </div>
  );
};
