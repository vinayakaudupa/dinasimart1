import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (data.message === 'success') {
                setCartItems(data.data);
                const count = data.data.reduce((acc, item) => acc + item.quantity, 0);
                setTotalItems(count);
            }
        } catch (err) {
            console.error("Failed to fetch cart", err);
        }
    };

    const addToCart = async (itemId, shopId, price, quantity = 1) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, shopId, price, quantity })
            });
            const data = await res.json();
            if (data.message) {
                fetchCart();
            }
        } catch (err) {
            console.error("Failed to add to cart", err);
        }
    };

    const updateQuantity = async (id, quantity) => {
        try {
            const res = await fetch('/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, quantity })
            });
            const data = await res.json();
            if (data.message) {
                fetchCart();
            }
        } catch (err) {
            console.error("Failed to update cart", err);
        }
    };

    const clearCart = async () => {
        try {
            const res = await fetch('/api/cart/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.message === 'cleared') {
                setCartItems([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error("Failed to clear cart", err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider value={{ cartItems, totalItems, addToCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
