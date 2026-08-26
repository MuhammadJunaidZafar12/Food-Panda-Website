import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Restaurant from "../models/restaurant.model.js";

// ─── Helper: Build cart response with calculated totals ──────────────
const buildCartResponse = async (cart) => {
  await cart.populate("items.product", "name image price isAvailable");
  await cart.populate("restaurant", "name logo deliveryFee");

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.restaurant?.deliveryFee || 0;
  const grandTotal = subtotal + deliveryFee;

  return {
    _id: cart._id,
    user: cart.user,
    restaurant: cart.restaurant,
    items: cart.items.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    })),
    subtotal,
    deliveryFee,
    grandTotal,
    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

// ─── GET CART ─────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Return an empty cart structure
      return res.status(200).json({
        success: true,
        cart: {
          _id: null,
          user: req.user._id,
          restaurant: null,
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          grandTotal: 0,
          totalItems: 0,
        },
      });
    }

    const cartData = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      cart: cartData,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart.",
    });
  }
};

// ─── ADD TO CART ──────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate quantity
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    // Fetch product from DB — do NOT trust frontend data
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This product is currently unavailable.",
      });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(product.restaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        restaurant: product.restaurant,
        items: [],
      });
    }

    // ── Restaurant conflict check ──────────────────────────────────
    if (
      cart.restaurant &&
      cart.items.length > 0 &&
      cart.restaurant.toString() !== product.restaurant.toString()
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Your cart contains items from another restaurant. Clear your current cart and add this item?",
        conflictType: "RESTAURANT_CONFLICT",
        currentRestaurant: cart.restaurant,
        newRestaurant: product.restaurant,
      });
    }

    // Set restaurant (handles first-item or empty-cart case)
    cart.restaurant = product.restaurant;

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Increase quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].subtotal =
        cart.items[existingItemIndex].price *
        cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        subtotal: product.price * quantity,
      });
    }

    await cart.save();

    const cartData = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: "Product added to cart.",
      cart: cartData,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add product to cart.",
    });
  }
};

// ─── UPDATE CART ITEM (quantity) ──────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal =
      cart.items[itemIndex].price * quantity;

    await cart.save();

    const cartData = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: "Cart item updated.",
      cart: cartData,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item.",
    });
  }
};

// ─── REMOVE FROM CART ────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    cart.items.splice(itemIndex, 1);

    // If cart is empty, clear restaurant reference
    if (cart.items.length === 0) {
      cart.restaurant = null;
    }

    await cart.save();

    const cartData = await buildCartResponse(cart);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart.",
      cart: cartData,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove product from cart.",
    });
  }
};

// ─── CLEAR CART ──────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty.",
        cart: {
          _id: null,
          user: req.user._id,
          restaurant: null,
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          grandTotal: 0,
          totalItems: 0,
        },
      });
    }

    cart.items = [];
    cart.restaurant = null;
    cart.totalAmount = 0;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      cart: {
        _id: cart._id,
        user: cart.user,
        restaurant: null,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        grandTotal: 0,
        totalItems: 0,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart.",
    });
  }
};
