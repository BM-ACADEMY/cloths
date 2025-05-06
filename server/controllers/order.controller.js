
import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const payload = list_items.map((el) => ({
      userId: userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image,
      },
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      delivery_address: addressId,
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt,
    }));

    const generatedOrder = await OrderModel.insertMany(payload);

    // Remove from the cart
    await CartProductModel.deleteMany({ userId: userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order successfully",
      error: false,
      success: true,
      data: generatedOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmount);
  return actualPrice;
};

export async function paymentController(request, response) {
  try {
    const userId = request.userId; // auth middleware
    const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

    const user = await UserModel.findById(userId);

    const line_items = list_items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name,
          images: item.productId.image,
          metadata: {
            productId: item.productId._id,
          },
        },
        unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100,
      },
      adjustable_quantity: {
        enabled: true,
        minimum: 1,
      },
      quantity: item.quantity,
    }));

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId,
      },
      line_items: line_items,
      success_url: `${process.env.PRODUCTION_URL}/success`,
      cancel_url: `${process.env.PRODUCTION_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    return response.status(200).json(session);
  } catch (error) {
    console.log("error", error.message);
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const getOrderProductItems = async ({ lineItems, userId, addressId, paymentId, payment_status }) => {
  const productList = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      const payload = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: product.metadata.productId,
        product_details: {
          name: product.name,
          image: product.images,
        },
        paymentId: paymentId,
        payment_status: payment_status,
        delivery_address: addressId,
        subTotalAmt: Number(item.amount_total / 100),
        totalAmt: Number(item.amount_total / 100),
      };

      productList.push(payload);
    }
  }

  return productList;
};

export async function webhookStripe(request, response) {
  const event = request.body;
  const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

  console.log("event", event);

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
      const userId = session.metadata.userId;
      const orderProduct = await getOrderProductItems({
        lineItems: lineItems,
        userId: userId,
        addressId: session.metadata.addressId,
        paymentId: session.payment_intent,
        payment_status: session.payment_status,
      });

      const order = await OrderModel.insertMany(orderProduct);

      console.log(order);
      if (Boolean(order[0])) {
        await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });
        await CartProductModel.deleteMany({ userId: userId });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
}

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;

    const orderList = await OrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address")
      .populate("productId")
      .populate("userId", "name email");

    return response.json({
      message: "Order list",
      data: orderList,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllOrdersController(request, response) {
  try {
    const orderList = await OrderModel.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("delivery_address")
      .populate("productId")
      .populate("userId", "name email");

    return response.json({
      message: "All orders",
      data: orderList,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function cancelOrderController(request, response) {
  try {
    const userId = request.userId;
    const { orderId, cancellationReason } = request.body;

    if (!orderId || !cancellationReason) {
      return response.status(400).json({
        message: "Provide orderId and cancellationReason",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({ orderId, userId });

    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    if (order.isCancelled) {
      return response.status(400).json({
        message: "Order is already cancelled",
        error: true,
        success: false,
      });
    }

    if (order.tracking_status === "Shipped" || order.tracking_status === "Delivered") {
      return response.status(400).json({
        message: "Cannot cancel order that is Shipped or Delivered",
        error: true,
        success: false,
      });
    }

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderId, userId },
      {
        isCancelled: true,
        cancellationReason,
        cancellationDate: new Date(),
        tracking_status: "Cancelled",
      },
      { new: true }
    );

    return response.json({
      message: "Order cancelled successfully",
      data: updatedOrder,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function updateTrackingStatusController(request, response) {
  try {
    const userId = request.userId; // From auth middleware
    const { orderId, tracking_status } = request.body;

    if (!orderId || !tracking_status) {
      return response.status(400).json({
        message: "Provide orderId and tracking_status",
        error: true,
        success: false,
      });
    }

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered"];
    if (!validStatuses.includes(tracking_status)) {
      return response.status(400).json({
        message: "Invalid tracking status",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({ orderId, isDeleted: false });
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    if (order.isCancelled) {
      return response.status(400).json({
        message: "Cannot update tracking for cancelled order",
        error: true,
        success: false,
      });
    }

    // Prevent moving backward in tracking status
    const statusOrder = ["Pending", "Processing", "Shipped", "Delivered"];
    const currentIndex = statusOrder.indexOf(order.tracking_status);
    const newIndex = statusOrder.indexOf(tracking_status);
    if (newIndex <= currentIndex && order.tracking_status !== "Pending") {
      return response.status(400).json({
        message: "Cannot revert to a previous tracking status",
        error: true,
        success: false,
      });
    }

    // Update tracking status and add to history
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderId },
      {
        tracking_status,
        $push: {
          tracking_history: {
            status: tracking_status,
            updatedBy: userId,
          },
        },
      },
      { new: true }
    )
      .populate("delivery_address")
      .populate("productId")
      .populate("userId", "name email");

    return response.json({
      message: "Tracking status updated successfully",
      data: updatedOrder,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Failed to update tracking status",
      error: true,
      success: false,
    });
  }
}


export async function deleteOrderController(request, response) {
  try {
    const { orderId } = request.params;

    if (!orderId) {
      return response.status(400).json({
        message: "Provide orderId",
        error: true,
        success: false,
      });
    }

    const order = await OrderModel.findOne({ orderId, isDeleted: false });
    if (!order) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    if (order.tracking_status === "Delivered") {
      return response.status(400).json({
        message: "Cannot delete a delivered order",
        error: true,
        success: false,
      });
    }

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderId },
      { isDeleted: true },
      { new: true }
    );

    return response.json({
      message: "Order deleted successfully",
      data: updatedOrder,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Failed to delete order",
      error: true,
      success: false,
    });
  }
}


export async function getOrderStatsController(request, response) {
  try {
    const totalUsers = await UserModel.countDocuments({ role: "USER" });
    const totalOrders = await OrderModel.countDocuments({ isDeleted: false });
    const canceledOrders = await OrderModel.countDocuments({
      isDeleted: false,
      isCancelled: true,
    });
    const deliveredOrders = await OrderModel.countDocuments({
      isDeleted: false,
      tracking_status: "Delivered",
    });

    return response.json({
      message: "Order statistics",
      data: {
        totalUsers,
        totalOrders,
        canceledOrders,
        deliveredOrders,
        receivedOrders: totalOrders - canceledOrders - deliveredOrders, // Pending, Processing, Shipped
      },
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Failed to fetch order statistics",
      error: true,
      success: false,
    });
  }
}