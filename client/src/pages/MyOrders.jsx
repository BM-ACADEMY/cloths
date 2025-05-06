// frontend/src/pages/MyOrders.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoData from "../components/NoData";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InfoIcon from "@mui/icons-material/Info";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import { setOrder } from "../store/orderSlice";
import UserTrackingModal from "../components/UserTrackingModal";

const MyOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.order);

  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [openTrackingModal, setOpenTrackingModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOrderId, setMenuOrderId] = useState(null);

  const handleOpenCancelModal = (order) => {
    if (
      order.tracking_status === "Shipped" ||
      order.tracking_status === "Delivered" ||
      order.isCancelled
    ) {
      toast.error("Cannot cancel this order");
      return;
    }
    setSelectedOrder(order);
    setOpenCancelModal(true);
    handleCloseMenu();
  };

  const handleOpenTrackingModal = (order) => {
    setSelectedOrder(order);
    setOpenTrackingModal(true);
    handleCloseMenu();
  };

  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setOpenDetailsModal(true);
    handleCloseMenu();
  };

  const handleCloseCancelModal = () => {
    setOpenCancelModal(false);
    setSelectedOrder(null);
    setCancellationReason("");
    setCustomReason("");
  };

  const handleCloseTrackingModal = () => {
    setOpenTrackingModal(false);
    setSelectedOrder(null);
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleMenuOpen = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setMenuOrderId(orderId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOrderId(null);
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason) {
      toast.error("Please select or enter a cancellation reason");
      return;
    }

    const reason = cancellationReason === "Other" ? customReason : cancellationReason;
    if (!reason) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.cancelOrder,
        data: {
          orderId: selectedOrder.orderId,
          cancellationReason: reason,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        const orderResponse = await Axios(SummaryApi.getOrderItems);
        if (orderResponse.data.success) {
          dispatch(setOrder(orderResponse.data.data));
        }
        handleCloseCancelModal();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  return (
    <div className="p-4">
      <div className="bg-white shadow-md p-4 rounded-md mb-4">
        <h1 className="text-lg font-semibold text-gray-800">My Orders</h1>
      </div>

      {!orders?.length ? (
        <NoData />
      ) : (
        <div className="grid gap-4">
          {orders.map((order, index) => (
            <div
              key={order._id + index + "order"}
              className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100 relative"
            >
              <div className="mb-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Order No:</span>{" "}
                {order?.orderId}
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={order.product_details.image[0]}
                  alt={order.product_details.name}
                  className="w-16 h-16 object-cover rounded border"
                />
                <div>
                  <h2
                    className={`font-semibold text-gray-800 text-sm sm:text-base ${
                      order.isCancelled ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {order.product_details.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Price: ₹{order.totalAmt} | Status: {order.tracking_status}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                <p>Payment: {order.payment_status}</p>
                <p>
                  Address: {order.delivery_address?.address_line},{" "}
                  {order.delivery_address?.city}, {order.delivery_address?.state},{" "}
                  {order.delivery_address?.pincode}
                </p>
                {order.isCancelled && (
                  <p className="text-red-500">
                    Cancelled: {order.cancellationReason} on{" "}
                    {new Date(order.cancellationDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <IconButton
                aria-controls={menuOrderId === order._id ? "order-menu" : undefined}
                aria-haspopup="true"
                onClick={(event) => handleMenuOpen(event, order._id)}
                sx={{ position: "absolute", top: 16, right: 16 }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                id="order-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && menuOrderId === order._id}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {!order.isCancelled && (
                  <MenuItem onClick={() => handleOpenCancelModal(order)}>
                    <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                    Cancel Order
                  </MenuItem>
                )}
                <MenuItem onClick={() => handleOpenTrackingModal(order)}>
                  <TrackChangesIcon fontSize="small" sx={{ mr: 1 }} />
                  View Tracking
                </MenuItem>
                <MenuItem onClick={() => handleOpenDetailsModal(order)}>
                  <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                  Details
                </MenuItem>
              </Menu>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Dialog
        open={openCancelModal}
        onClose={handleCloseCancelModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Order #{selectedOrder?.orderId}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Why do you want to cancel this order?
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
            >
              <FormControlLabel
                value="Changed my mind"
                control={<Radio />}
                label="Changed my mind"
              />
              <FormControlLabel
                value="Found a better alternative"
                control={<Radio />}
                label="Found a better alternative"
              />
              <FormControlLabel
                value="Order placed by mistake"
                control={<Radio />}
                label="Order placed by mistake"
              />
              <FormControlLabel value="Other" control={<Radio />} label="Other" />
            </RadioGroup>
            {cancellationReason === "Other" && (
              <TextField
                fullWidth
                label="Please specify"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                margin="normal"
                variant="outlined"
              />
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelModal} color="inherit">
            Close
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            startIcon={<CancelIcon />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tracking Modal */}
      {selectedOrder && (
        <UserTrackingModal
          open={openTrackingModal}
          handleClose={handleCloseTrackingModal}
          order={selectedOrder}
        />
      )}

      {/* Details Modal */}
      <Dialog
        open={openDetailsModal}
        onClose={handleCloseDetailsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order Details #{selectedOrder?.orderId}</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography variant="h6" gutterBottom>
                User Info
              </Typography>
              <Typography>
                <b>Name:</b>{" "}
                {selectedOrder.userId?.name || selectedOrder.userName || "N/A"}
              </Typography>
              <Typography>
                <b>Email:</b>{" "}
                {selectedOrder.userId?.email || selectedOrder.userEmail || "N/A"}
              </Typography>
              {selectedOrder.delivery_address ? (
                  <>
                    <Typography>
                      <b>Address:</b> {selectedOrder.delivery_address.address_line || "N/A"}
                    </Typography>
                    <Typography>
                      <b>City:</b> {selectedOrder.delivery_address.city || "N/A"}
                    </Typography>
                    <Typography>
                      <b>State:</b> {selectedOrder.delivery_address.state || "N/A"}
                    </Typography>
                    <Typography>
                      <b>Pincode:</b> {selectedOrder.delivery_address.pincode || "N/A"}
                    </Typography>
                  </>
                ) : (
                  <Typography>No address available.</Typography>
                )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Product Info
              </Typography>
              <Typography>
                <b>Product Name:</b> {selectedOrder.product_details?.name || "N/A"}
              </Typography>
              <Typography>
                <b>Order ID:</b> {selectedOrder.orderId || "N/A"}
              </Typography>
              <Typography>
                <b>Price:</b> ₹{selectedOrder.totalAmt || "0"}
              </Typography>
              <Typography>
                <b>Payment Status:</b> {selectedOrder.payment_status || "N/A"}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyOrders;