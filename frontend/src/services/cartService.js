import api from "./api";

export async function getCart() {
    const res = await api.get("/cart/")
    return res.data
}

export async function addCartItem(product_id, quantity) {
    const res = await api.post("/cart/items/", { product_id, quantity })
    return res.data
}

export async function updateCartItem(itemId, quantity) {
    const res = await api.patch(`/cart/items/${itemId}/`, { quantity })
    return res.data
}

export async function removeCartItem(itemId) {
    const res = await api.delete(`/cart/items/${itemId}/`)
    return res.data
}