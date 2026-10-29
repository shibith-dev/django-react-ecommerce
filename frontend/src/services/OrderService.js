import api from "./api"

export async function getOrders() {
    const res = await api.get("/orders/")
    return res.data
}

export async function getOrderById(orderId) {
    const res = await api.get(`/orders/${orderId}/`)
    return res.data
}

export async function createOrder(shippingDetails) {
    const res = await api.post("/orders/", shippingDetails)
    return res.data
}

export async function cancelOrder(orderId) {
    const res = await api.post(`/orders/${orderId}/cancel/`)
    return res.data
}