import React from "react";

import ModalCard from "./ModalCard";
import Image from "next/image";

interface ItemCardProps {
  name: string;
  imgURL: string;
  description: string;
  price: number;
}

const ItemCard = ({ name, imgURL, description, price }: ItemCardProps) => {
  return (
    <div
      className="flex flex-col gap-2 p-4 min-w-sm max-w-md rounded-lg bg-cover bg-center"
      style={{ backgroundImage: `url(${imgURL})` }}
    >
      <h3>{name}</h3>
      <p>{price}</p>

      <ModalCard buttonText="Detail">
        <p>{description}</p>
      </ModalCard>
    </div>
  );
};

export default ItemCard;
