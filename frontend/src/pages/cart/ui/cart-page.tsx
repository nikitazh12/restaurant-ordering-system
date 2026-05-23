import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@entities/cart/model/cart-store";
import { useAuthStore } from "@entities/user/model/auth-store";
import { menuItemApi } from "@entities/menu-item/api/menu-item-api";
import type { MenuItem } from "@entities/menu-item/model/types";
import { showToast } from "@shared/lib/toast";

interface CartItemWithDetails {
  id: number;
  user_id: number;
  menu_item_id: number;
  quantity: number;
  menuItem?: MenuItem;
}

export function CartPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const {
    items,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
    clearCartStateOnly,
    getTotalItems,
  } = useCartStore();
  const [cartItemsWithDetails, setCartItemsWithDetails] = useState<
    CartItemWithDetails[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Form state for order
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Cart is already loaded globally in App.tsx, no need to reload
  }, [isAuthenticated, navigate]);

  // Fetch menu item details for each cart item - memoized to prevent re-fetching
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (items.length === 0) {
        setCartItemsWithDetails([]);
        return;
      }

      setIsFetchingDetails(true);
      try {
        const itemsWithDetails = await Promise.all(
          items.map(async (cartItem) => {
            try {
              const menuItem = await menuItemApi.getMenuItemById(
                cartItem.menu_item_id,
              );
              return { ...cartItem, menuItem };
            } catch (error) {
              console.error(
                `Failed to fetch menu item ${cartItem.menu_item_id}:`,
                error,
              );
              return { ...cartItem, menuItem: undefined };
            }
          }),
        );
        setCartItemsWithDetails(itemsWithDetails);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setIsFetchingDetails(false);
      }
    };

    fetchMenuItems();
  }, [items]);

  const handleRemoveItem = useCallback(
    async (itemId: number) => {
      // Optimistic update - remove from state immediately without skeleton
      const itemToRemove = items.find((i) => i.id === itemId);
      if (itemToRemove) {
        setCartItemsWithDetails((prev) =>
          prev.filter((item) => item.id !== itemId),
        );
      }
      try {
        await removeItem(itemId);
      } catch (error) {
        console.error("Failed to remove item:", error);
        showToast("Failed to remove item", "error");
        // Rollback on error
        const fetchMenuItems = async () => {
          if (items.length === 0) {
            setCartItemsWithDetails([]);
            return;
          }
          const itemsWithDetails = await Promise.all(
            items.map(async (cartItem) => {
              try {
                const menuItem = await menuItemApi.getMenuItemById(
                  cartItem.menu_item_id,
                );
                return { ...cartItem, menuItem };
              } catch {
                return { ...cartItem, menuItem: undefined };
              }
            }),
          );
          setCartItemsWithDetails(itemsWithDetails);
        };
        fetchMenuItems();
      }
    },
    [removeItem, items],
  );

  const handleUpdateQuantity = useCallback(
    async (itemId: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        await handleRemoveItem(itemId);
        return;
      }
      // Optimistic update - update quantity in state immediately without skeleton
      setCartItemsWithDetails((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
      try {
        await updateQuantity(itemId, newQuantity);
      } catch (error) {
        console.error("Failed to update quantity:", error);
        showToast("Failed to update quantity", "error");
        // Rollback on error
        const fetchMenuItems = async () => {
          if (items.length === 0) {
            setCartItemsWithDetails([]);
            return;
          }
          const itemsWithDetails = await Promise.all(
            items.map(async (cartItem) => {
              try {
                const menuItem = await menuItemApi.getMenuItemById(
                  cartItem.menu_item_id,
                );
                return { ...cartItem, menuItem };
              } catch {
                return { ...cartItem, menuItem: undefined };
              }
            }),
          );
          setCartItemsWithDetails(itemsWithDetails);
        };
        fetchMenuItems();
      }
    },
    [updateQuantity, handleRemoveItem, items],
  );

  const handleClearCart = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }
    try {
      await clearCart();
      setCustomerName("");
      setPhone("");
      setAddress("");
      showToast("Cart cleared", "success");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      showToast("Failed to clear cart", "error");
    }
  }, [clearCart]);

  const handleCheckout = useCallback(async () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      showToast("Please fill in all delivery details", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/orders/from-cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            customer_name: customerName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            items: [],
          }),
        },
      );

      let errorData: Record<string, unknown> = {};
      if (!response.ok) {
        // Try to parse error response, but don't fail if it's not JSON
        try {
          errorData = await response.json();
        } catch {
          // If response is not JSON, use status text
        }
        const errorMessage =
          (errorData.message as string) ||
          (errorData.detail as string) ||
          `Failed to create order: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Clear cart state only (backend clears automatically after checkout)
      clearCartStateOnly();
      setCustomerName("");
      setPhone("");
      setAddress("");
      showToast("Order placed successfully!", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";
      console.error("Failed to place order:", error);
      showToast(errorMessage, "error");
    } finally {
      setIsProcessing(false);
    }
  }, [
    customerName,
    phone,
    address,
    items.length,
    accessToken,
    clearCartStateOnly,
  ]);

  const calculatedTotal = useMemo(() => {
    return cartItemsWithDetails.reduce((sum, item) => {
      return sum + (item.menuItem?.price || 0) * item.quantity;
    }, 0);
  }, [cartItemsWithDetails]);

  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);

  if (!isAuthenticated) {
    return null;
  }

  const isLoadingState = isLoading || isFetchingDetails;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Shopping Cart
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {isLoadingState ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : cartItemsWithDetails.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add some products to get started
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItemsWithDetails.map((cartItem) => (
              <div
                key={cartItem.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {cartItem.menuItem?.image ? (
                      <img
                        src={cartItem.menuItem.image}
                        alt={cartItem.menuItem.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                      {cartItem.menuItem?.name ||
                        `Item #${cartItem.menu_item_id}`}
                    </h3>
                    {cartItem.menuItem?.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                        {cartItem.menuItem.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        ${(cartItem.menuItem?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            cartItem.id,
                            cartItem.quantity - 1,
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            cartItem.id,
                            cartItem.quantity + 1,
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(cartItem.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${calculatedTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-purple-600 dark:text-purple-400">
                  ${calculatedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleClearCart}
              className="w-full mb-4 py-2 px-4 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Delivery Details Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Delivery Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Delivery Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || items.length === 0}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
