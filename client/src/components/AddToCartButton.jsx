import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import Loading from './Loading';
import { useSelector } from 'react-redux';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const AddToCartButton = ({ data }) => {
  const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);
  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemsDetails] = useState();
  const navigate = useNavigate();

  const handleADDTocart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.addTocart,
        data: {
          productId: data?._id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchCartItem) {
          fetchCartItem();
        }
      }
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  // Checking if item is in cart
  useEffect(() => {
    const checkingitem = cartItem.some((item) => item.productId._id === data._id);
    setIsAvailableCart(checkingitem);

    const product = cartItem.find((item) => item.productId._id === data._id);
    setQty(product?.quantity);
    setCartItemsDetails(product);
  }, [data, cartItem]);

  const increaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await updateCartItem(cartItemDetails?._id, qty + 1);

    if (response.success) {
      toast.success('Item added');
    }
  };

  const decreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (qty === 1) {
      deleteCartItem(cartItemDetails?._id);
    } else {
      const response = await updateCartItem(cartItemDetails?._id, qty - 1);

      if (response.success) {
        toast.success('Item removed');
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '120px' }}>
      {isAvailableCart ? (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Button
            onClick={decreaseQty}
            sx={{
              backgroundColor: '#111827',
              color: '#fff',
              minWidth: '32px',
              p: '6px',
              borderRadius: '4px 0 0 4px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#333',
                transform: 'scale(1.05)',
              },
            }}
          >
            <FaMinus size={12} />
          </Button>
          <Typography
            sx={{
              flex: 1,
              textAlign: 'center',
              fontSize: '0.9rem',
              fontWeight: 'medium',
              backgroundColor: '#fff',
              color: '#111827',
              borderLeft: 'none',
              borderRight: 'none',
              p: '6px',
              lineHeight: '1.4',
            }}
          >
            {qty}
          </Typography>
          <Button
            onClick={increaseQty}
            sx={{
              backgroundColor: '#111827',
              color: '#fff',
              minWidth: '32px',
              p: '6px',
              borderRadius: '0 4px 4px 0',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#333',
                transform: 'scale(1.05)',
              },
            }}
          >
            <FaPlus size={12} />
          </Button>
        </Box>
      ) : (
        <Button
          onClick={handleADDTocart}
          sx={{
            backgroundColor: '#111827',
            color: '#fff',
            width: '100%',
            px: { xs: 2, lg: 3 },
            py: '3px',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: 'medium',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#333',
              transform: 'scale(1.03)',
            },
          }}
        >
          {loading ? <Loading /> : 'Buy'}
        </Button>
      )}
    </Box>
  );
};

export default AddToCartButton;