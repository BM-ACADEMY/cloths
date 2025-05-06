import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FaCaretRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { pricewithDiscount } from '../utils/PriceWithDiscount';
import AddToCartButton from './AddToCartButton';
import imageEmpty from '../assets/empty_cart.png';
import toast from 'react-hot-toast';

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';

const DisplayCartItem = ({ close }) => {
  const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext();
  const cartItem = useSelector((state) => state.cartItem.cart);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const redirectToCheckoutPage = () => {
    if (user?._id) {
      navigate('/checkout');
      close?.();
    } else {
      toast.error('Please Login to proceed');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: 420 },
          height: '100%',
          backgroundColor: '#f9fbfd',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="primary">
            Your Cart
          </Typography>
          <IconButton onClick={close}>
            <IoClose size={26} />
          </IconButton>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {cartItem.length > 0 ? (
            <>
              {/* Cart Items */}
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  {cartItem.map((item) => (
                    <Box
                      key={item._id}
                      sx={{ display: 'flex', gap: 2, mb: 3 }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                        }}
                      >
                        <img
                          src={item?.productId?.image[0]}
                          alt={item?.productId?.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={500}
                          sx={{
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {item?.productId?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {item?.productId?.unit}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {DisplayPriceInRupees(
                            pricewithDiscount(item?.productId?.price, item?.productId?.discount)
                          )}
                        </Typography>
                        <Box mt={1}>
                          <AddToCartButton data={item?.productId} />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* Bill Details */}
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Bill Summary
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Typography>Items Total</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Typography>
                        <span style={{ textDecoration: 'line-through', color: '#888' }}>
                          {DisplayPriceInRupees(notDiscountTotalPrice)}
                        </span>{' '}
                        {DisplayPriceInRupees(totalPrice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>Quantity</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Typography>{totalQty} item(s)</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography>Delivery</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Typography color="success.main">Free</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Grand Total
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        {DisplayPriceInRupees(totalPrice)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </>
          ) : (
            // Empty Cart
            <Box
              sx={{
                textAlign: 'center',
                mt: 8,
              }}
            >
              <img
                src={imageEmpty}
                alt="Empty Cart"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  opacity: 0.7,
                }}
              />
              <Typography variant="h6" mt={4} mb={2}>
                Your cart is empty!
              </Typography>
              <Button
                component={Link}
                to="/"
                onClick={close}
                variant="contained"
                size="large"
                sx={{ borderRadius: 2, px: 5 }}
              >
                Shop Now
              </Button>
            </Box>
          )}
        </Box>

        {/* Footer Checkout */}
        {cartItem.length > 0 && (
          <Box sx={{ p: 3, backgroundColor: '#e3f2fd', boxShadow: '0 -2px 6px rgba(0,0,0,0.1)' }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              color="primary"
              onClick={redirectToCheckoutPage}
              sx={{
                borderRadius: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography fontWeight="bold">
                {DisplayPriceInRupees(totalPrice)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>Proceed</Typography>
                <FaCaretRight size={18} style={{ marginLeft: 4 }} />
              </Box>
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DisplayCartItem;
