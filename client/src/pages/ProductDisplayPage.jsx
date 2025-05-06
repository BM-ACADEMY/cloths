import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import Divider from '../components/Divider';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from '../components/AddToCartButton';
import DOMPurify from 'dompurify';

const ProductDisplayPage = () => {
  const params = useParams();
  let productId = params?.product?.split("-")?.slice(-1)[0];
  const [data, setData] = useState({
    name: "",
    image: [],
    size: [],
    description: "",
    unit: "",
    more_details: {},
    price: 0,
    discount: 0,
    stock: 0
  });
  const [image, setImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(false);
  const imageContainer = useRef();

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId
        }
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params]);

  const handleScrollRight = () => {
    imageContainer.current.scrollLeft += 100;
  };

  const handleScrollLeft = () => {
    imageContainer.current.scrollLeft -= 100;
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  const renderDescription = (description) => {
    if (!description) return null;
    
    // Sanitize the HTML content
    const cleanDescription = DOMPurify.sanitize(description);
    
    // Check if the description contains list items
    if (cleanDescription.includes('<ul>') || cleanDescription.includes('<li>')) {
      return <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />;
    }
    
    // If it's plain text with bullet points or dashes
    if (cleanDescription.includes('•') || cleanDescription.includes('-')) {
      const items = cleanDescription.split('\n').filter(item => item.trim());
      return (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, index) => (
            <li key={index}>{item.replace(/^[•-]\s*/, '').trim()}</li>
          ))}
        </ul>
      );
    }
    
    // Default case - return as paragraphs
    return cleanDescription.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-2">{paragraph}</p>
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <section className='container mx-auto p-4 grid lg:grid-cols-2 gap-6'>
      {/* Product Images */}
      <div className='space-y-4'>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='aspect-square flex items-center justify-center'>
            {data.image.length > 0 ? (
              <img
                src={data.image[image]}
                className='w-full h-full object-contain p-4'
                alt={data.name}
              />
            ) : (
              <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                <span className='text-gray-400'>No Image Available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Image Indicators */}
        <div className='flex items-center justify-center gap-3'>
          {data.image.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === image ? 'bg-gray-800' : 'bg-gray-300'}`}
              onClick={() => setImage(index)}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Thumbnail Scroll */}
        <div className='relative'>
          <div 
            ref={imageContainer} 
            className='flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory'
          >
            {data.image.map((img, index) => (
              <button
                key={index}
                className={`w-20 h-20 min-w-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${index === image ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => setImage(index)}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className='w-full h-full object-cover'
                />
              </button>
            ))}
          </div>
          
          {data.image.length > 4 && (
            <>
              <button 
                onClick={handleScrollLeft}
                className='absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100'
                aria-label="Scroll thumbnails left"
              >
                <FaAngleLeft className="text-gray-700" />
              </button>
              <button 
                onClick={handleScrollRight}
                className='absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100'
                aria-label="Scroll thumbnails right"
              >
                <FaAngleRight className="text-gray-700" />
              </button>
            </>
          )}
        </div>
        
        {/* Additional Details (Desktop) */}
        <div className='hidden lg:block space-y-4 mt-6'>
          {data?.more_details && Object.entries(data.more_details).map(([key, value]) => (
            <div key={key}>
              <h3 className='font-semibold text-gray-700 capitalize'>{key}</h3>
              <p className='text-gray-600'>{value || 'Not specified'}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Product Info */}
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl lg:text-3xl text-gray-900'>{data.name}</h1>
          <Divider />
        </div>
        
        {/* Price Section */}
        <div className='space-y-2'>
          <p className='text-gray-600'>Price</p>
          <div className='flex items-center gap-4'>
            <p className='text-2xl font-bold text-gray-900'>
              {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
            </p>
            {data.discount > 0 && (
              <>
                <p className='text-lg line-through text-gray-500'>
                  {DisplayPriceInRupees(data.price)}
                </p>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {data.discount}% OFF
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Size Selection */}
        {data.size.length > 0 && (
          <div className='space-y-2'>
            <p className='font-semibold text-gray-700'>Select Size</p>
            <div className='flex flex-wrap gap-2'>
              {data.size.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-4 py-2 border rounded-md transition-colors
                    ${selectedSize === size 
                      ? 'bg-gray-900 text-white border-gray-900' 
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Stock Status */}
        {data.stock === 0 ? (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
            <p>Out of Stock</p>
          </div>
        ) : (
          <div className='flex gap-4'>
            <AddToCartButton 
              data={{ ...data, selectedSize }} 
              className="flex-1"
            />
          </div>
        )}
        
        {/* Description */}
        <div className='space-y-2'>
          <h2 className='font-semibold text-gray-700'>Description</h2>
          <div className='text-gray-600'>
            {renderDescription(data.description)}
          </div>
        </div>
        
        

        <div className='hidden lg:block space-y-4 mt-6'>
          {data?.more_details && Object.entries(data.more_details).map(([key, value]) => (
            <div key={key}>
              <h3 className='font-semibold text-gray-700 capitalize'>{key}</h3>
              <p className='text-gray-600'>{value || 'Not specified'}</p>
            </div>
          ))}
        </div>
        
        {/* Additional Details (Mobile) */}
        <div className='lg:hidden space-y-4'>
          {data?.more_details && Object.entries(data.more_details).map(([key, value]) => (
            <div key={key}>
              <h3 className='font-semibold text-gray-700 capitalize'>{key}</h3>
              <p className='text-gray-600'>{value || 'Not specified'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductDisplayPage;