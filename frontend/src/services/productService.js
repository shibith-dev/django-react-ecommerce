import api from "./api";

export async function getProducts(params = {}) {
    const response = await api.get("/products/", { params: params });
    return response.data;
    
}

export async function getBrands() {
    const response = await api.get("/brands/");
    return response.data;
}

export async function getCategories() {
    const response = await api.get("/categories/")
    return response.data
}

export async function getProductBySlug(slug) {
    const res = await api.get(`/products/${encodeURIComponent(slug)}`)
    return res.data
}