import React from "react";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";
import { useNavigate } from "react-router-dom";
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Box, useMediaQuery, useTheme, IconButton, Skeleton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Banner images
import banner from "../assets/3.png";
import banner2 from "../assets/4.png";
import bannerMobile from "../assets/banner-mobile1.png";
import bannerMobile2 from "../assets/banner-mobile2.png";

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleRedirectProductListpage = (id, cat) => {
    const subcategory = subCategoryData.find((sub) => {
      const filterData = sub.category.some((c) => c._id === id);
      return filterData ? true : null;
    });
    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`;
    navigate(url);
  };

  // Banner images for carousel
  const banners = isMobile
    ? [
        { src: bannerMobile, alt: "Mobile Banner 1" },
        { src: bannerMobile2, alt: "Mobile Banner 2" },
      ]
    : [
        { src: banner, alt: "Premium cloths Collection" },
        { src: banner2, alt: "Summer Sale - Up to 40% Off" },
      ];

  return (
    <section className="mb-10">
      {/* Banner Section with Container */}
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "800px", md: "1000px", lg: "1400px", xl: "1800px" },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          position: "relative", // For navigation buttons
        }}
      >
        {/* Swiper Carousel for Banner */}
        <Box
          sx={{
            width: "100%",
            pt: 0,
            mt: 1,
            minHeight: isMobile ? "200px" : "400px",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            "&:hover": {
              ".custom-swiper-button": {
                opacity: 1,
              },
            },
          }}
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={0}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: ".custom-swiper-button-next",
              prevEl: ".custom-swiper-button-prev",
            }}
            style={{
              "--swiper-pagination-color": theme.palette.primary.main,
              "--swiper-pagination-bullet-inactive-color": "#d1d5db",
              "--swiper-pagination-bullet-inactive-opacity": "0.5",
              "--swiper-pagination-bullet-size": "10px",
              "--swiper-pagination-bullet-horizontal-gap": "6px",
            }}
          >
            {banners.map((bannerItem, index) => (
              <SwiperSlide key={index}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <img
                    src={bannerItem.src}
                    alt={bannerItem.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                    aria-label={bannerItem.alt}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {!isMobile && (
            <>
              <IconButton
                className="custom-swiper-button custom-swiper-button-prev"
                sx={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  color: theme.palette.text.primary,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>
              <IconButton
                className="custom-swiper-button custom-swiper-button-next"
                sx={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  color: theme.palette.text.primary,
                  opacity: 0,
                  transition: "opacity 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Category Grid */}
<div className="container mx-auto px-4 my-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
  {loadingCategory ? (
    new Array(10).fill(null).map((_, index) => (
      <div
        key={index + "loadingcategory"}
        className="bg-white rounded-lg p-4 min-h-36 grid gap-6 shadow animate-pulse"
      >
        <Skeleton variant="rectangular" width="100%" height={100} />
        <Skeleton variant="text" height={30} width="80%" />
      </div>
    ))
  ) : (
    categoryData.map((cat) => (
      <div
        key={cat._id + "displayCategory"}
        className="cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105"
        onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
      >
        <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto rounded-full overflow-hidden">
          <img
            src={cat.image}
            className="w-full h-full object-cover"
            alt={cat.name}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1 rounded-b-full">
            {cat.name}
          </div>
        </div>
      </div>
    ))
  )}
</div>


      {/* Category Wise Product Display */}
      {categoryData?.map((c) => (
        <CategoryWiseProductDisplay
          key={c?._id + "CategorywiseProduct"}
          id={c?._id}
          name={c?.name}
        />
      ))}
    </section>
  );
};

export default Home;