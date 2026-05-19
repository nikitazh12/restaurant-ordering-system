import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@widgets/header";
import { Footer } from "@widgets/footer";
import { HomePage } from "@pages/home";
import { CatalogPage } from "@pages/catalog";
import { ProductPage } from "@pages/product";
import { LoginPage } from "@pages/login";
import { CartPage } from "@pages/cart";
import { FavoritesPage } from "@pages/favorites";
import { useAuthStore } from "@entities/user/model/auth-store";
import { useCartStore } from "@entities/cart/model/cart-store";
import { useFavoriteStore } from "@entities/favorite/model/favorite-store";


function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const loadCart = useCartStore((state) => state.loadCart);
  const loadFavorites = useFavoriteStore((state) => state.loadFavorites);


  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      loadCart();
      loadFavorites();
    }
  }, [isAuthenticated, isInitialized, loadCart, loadFavorites]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
