import { create } from "zustand";
import axios from "../lib/axios";

import { toast } from "react-hot-toast";
import { Percent } from "lucide-react";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response.data.message || "An error occured");
    }
  },

  addtoCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });
      toast.success("Added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item.id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "An error occured");
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subTotal;

    if (coupon) {
      const discount = subTotal * (coupon.discountPercentage / 100);
      total = subTotal - discount;
    }

    set({ subTotal, total }); //it always update the cart
  },
}));
