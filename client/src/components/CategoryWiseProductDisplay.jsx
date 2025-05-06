import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AxiosToastError from "../utils/AxiosToastError";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import CardLoading from "./CardLoading";
import CardProduct from "./CardProduct";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CategoryWiseProductDisplay = ({ id, name }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const loadingCardNumber = new Array(6).fill(null);

  const fetchCategoryWiseProduct = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategory,
        data: { id },
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
    fetchCategoryWiseProduct();
  }, []);

  const handleRedirectProductListpage = () => {
    const subcategory = subCategoryData.find((sub) =>
      sub.category.some((c) => c._id === id)
    );
    const url = `/${valideURLConvert(name)}-${id}/${valideURLConvert(
      subcategory?.name
    )}-${subcategory?._id}`;
    return url;
  };

  const redirectURL = handleRedirectProductListpage();

  // Unique class names for navigation buttons to ensure independent scrolling
  const prevButtonClass = `swiper-button-prev-${id}`;
  const nextButtonClass = `swiper-button-next-${id}`;

  return (
    <div className="mb-8">
      <div className="container mx-auto p-4 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg md:text-xl">{name}</h3>
        <Link
          to={redirectURL}
          className="text-gray-600 hover:text-red-400 flex items-center gap-1"
        >
         More <FaAngleRight />
        </Link>
      </div>
      <div className="relative container mx-auto px-4">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          navigation={{
            nextEl: `.${nextButtonClass}`,
            prevEl: `.${prevButtonClass}`,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          style={{
            "--swiper-pagination-color": "#16a34a",
            "--swiper-pagination-bullet-inactive-color": "#d1d5db",
            "--swiper-pagination-bullet-inactive-opacity": "0.5",
            "--swiper-pagination-bullet-size": "8px",
            "--swiper-pagination-bullet-horizontal-gap": "4px",
          }}
          className="mySwiper"
        >
          {loading
            ? loadingCardNumber.map((_, index) => (
                <SwiperSlide key={"CategorywiseProductDisplay123" + index}>
                  <CardLoading />
                </SwiperSlide>
              ))
            : data.map((p, index) => (
                <SwiperSlide key={p._id + "CategorywiseProductDisplay" + index}>
                  <CardProduct data={p} />
                </SwiperSlide>
              ))}
        </Swiper>
        <button
          className={`${prevButtonClass} absolute top-1/2 left-0 z-10 bg-white hover:bg-gray-100 shadow-lg p-3 rounded-full transform -translate-y-1/2`}
          aria-label={`Previous ${name} products`}
        >
          <FaAngleLeft className="text-xl text-gray-700" />
        </button>
        <button
          className={`${nextButtonClass} absolute top-1/2 right-0 z-10 bg-white hover:bg-gray-100 shadow-lg p-3 rounded-full transform -translate-y-1/2`}
          aria-label={`Next ${name} products`}
        >
          <FaAngleRight className="text-xl text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;
