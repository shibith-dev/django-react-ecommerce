import { createContext, useCallback, useMemo, useContext, useState, useEffect } from "react";

import { useAuth } from "./AuthContext";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "../services/cartService";

const CartContext = createContext(null)

export function CartProvider({ children }) {
    const { isAuthenticated, authloading } = useAuth()

    const [cart, setCart] = useState(null)
    const [cartLoading, setCartLoading] = useState(false)
    const [cartError, setCartError] = useState("")

    const loadCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            setCartError("")
            return null
        }
        setCartLoading(true)
        setCartError("")

        try {
            const data = await getCart()
            setCart(data)
            return data
        } catch (error) {
            setCartError(error.response?.data?.detail || "Unable to load your shopping cart.")
            throw error
        } finally {
            setCartLoading(false)
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (authloading) return

        if (!isAuthenticated) {
            setCart(null)
            setCartError("")
            setCartLoading(false)
            return
        }

        let active = true

        async function initializeCart() {
            setCartLoading(true)
            setCartError("")

            try {
                const data = await getCart()
                if (active) {
                    setCart(data)
                }
            } catch (error) {
                if (active) {
                    setCartError(error.response?.data?.detail || "Unable to load your shopping cart.")
                }
            } finally {
                if (active) {
                    setCartLoading(false);
                }
            }
        }

        initializeCart()

        return () => {
            active = false
        }
    }, [authloading, isAuthenticated])

    const addItem = useCallback(async (productId, quantity) => {
        const data = await addCartItem(productId, quantity)
        setCart(data)
        setCartError("")
        return data
    }, [])

    const updateItem = useCallback(async (itemId, quantity) => {
        const data = await updateCartItem(itemId, quantity)
        setCart(data)
        setCartError("")
        return data
    }, [])

    const removeItem = useCallback(async (itemId) => {
        await removeCartItem(itemId)
        return loadCart()
    }, [loadCart])

    const itemCount = cart?.item_count ?? 0

    const value = useMemo(() => ({cart, itemCount, cartLoading, cartError, loadCart, addItem, updateItem, removeItem}), [cart, itemCount, cartLoading, cartError, loadCart, addItem, updateItem, removeItem])


    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if(!context) {
        throw new Error("useCart must be used within CartProvider.");
    }

    return context;
}