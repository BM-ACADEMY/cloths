import React from "react";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { Link } from "react-router-dom";
import { valideURLConvert } from "../utils/valideURLConvert";
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import AddToCartButton from "./AddToCartButton";

const CardProduct = ({ data }) => {
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden  transition-all duration-300 ease-in-out border border-gray-200 flex flex-col h-full">
      {/* Image container with badges */}
      <Link to={url} className="flex flex-col h-full" aria-label={`View ${data.name} product`}>
        <div className="relative pt-[100%] overflow-hidden bg-gray-50/50">
          <img
            src={data.image[0]}
            alt={data.name}
            className="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          {/* Badges container */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
           
            
            {/* Discount badge */}
            {Boolean(data.discount) && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {data.discount}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name */}
          <h3 className="font-semibold text-gray-900 text-sm md:text-[15px] mb-1.5 line-clamp-2 leading-snug">
            {data.name}
          </h3>
          
          {/* Unit */}
          <p className="text-xs text-gray-500 mb-3">{data.unit}</p>
          
          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gray-900 text-lg md:text-xl">
                {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
              </span>
              {Boolean(data.discount) && (
                <span className="text-xs text-gray-400 line-through">
                  {DisplayPriceInRupees(data.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Add to cart button */}
      <div className="px-4 pb-4">
        {data.stock === 0 ? (
          <div className="w-full py-2.5 text-center text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100">
            Out of stock
          </div>
        ) : (
          <AddToCartButton 
            data={data} 
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-xs transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add to Cart
          </AddToCartButton>
        )}
      </div>
    </div>
  );
};

export default CardProduct;