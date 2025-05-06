import React, { useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const CheckoutPage = () => {
  const {
    notDiscountTotalPrice,
    totalPrice,
    totalQty,
    fetchCartItem,
    fetchOrder,
  } = useGlobalContext();

  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector((state) => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(0);
  const cartItemsList = useSelector((state) => state.cartItem.cart);
  const navigate = useNavigate();

  const handleCashOnDelivery = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem?.();
        fetchOrder?.();
        navigate('/success', {
          state: { text: 'Order' },
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      toast.loading('Redirecting to payment...');
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey);

      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        },
      });

      const { data: responseData } = response;
      stripePromise.redirectToCheckout({ sessionId: responseData.id });

      fetchCartItem?.();
      fetchOrder?.();
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-tr from-blue-50 to-white py-10">
      <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row gap-10">
        {/* Address Section */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Select Delivery Address</h2>
          <div className="bg-white shadow rounded-xl p-6 space-y-4">
            {addressList.map((address, index) => (
              <label
                key={index}
                htmlFor={`address${index}`}
                className={`border rounded-xl p-5 cursor-pointer block transition-all duration-200 hover:border-blue-400 ${
                  selectAddress == index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } ${!address.status && 'hidden'}`}
              >
                <div className="flex gap-4 items-start">
                  <input
                    id={`address${index}`}
                    type="radio"
                    value={index}
                    checked={selectAddress == index}
                    onChange={(e) => setSelectAddress(e.target.value)}
                    name="address"
                    className="accent-blue-600 mt-1"
                  />
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-semibold">{address.address_line}</p>
                    <p>{address.city}, {address.state}</p>
                    <p>{address.country} - {address.pincode}</p>
                    <p className="text-gray-500">Mobile: {address.mobile}</p>
                  </div>
                </div>
              </label>
            ))}

            <div
              onClick={() => setOpenAddress(true)}
              className="border-2 border-dashed border-blue-400 text-blue-600 rounded-xl flex items-center justify-center h-14 cursor-pointer hover:bg-blue-50 transition"
            >
              + Add New Address
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-xl p-6 sticky top-20">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Order Summary</h2>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span>
                  <span className="line-through text-gray-400 mr-2">
                    {DisplayPriceInRupees(notDiscountTotalPrice)}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {DisplayPriceInRupees(totalPrice)}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span>{totalQty} items</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>

              <div className="border-t pt-4 flex justify-between text-base font-semibold text-gray-900">
                <span>Grand Total</span>
                <span>{DisplayPriceInRupees(totalPrice)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleOnlinePayment}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Pay Online
              </button>
              <button
                onClick={handleCashOnDelivery}
                className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition"
              >
                Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
    </section>
  );
};

export default CheckoutPage;