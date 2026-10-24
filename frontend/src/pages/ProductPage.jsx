import React from 'react'
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from 'lucide-react';

import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import { getProducts, getBrands, getCategories } from '../services/productService';

const initialFilters = {
    brand: "",
    category: "",
    min_price: "",
    max_price: "",
    watch_type: "",
    movement_type: "",
    strap_material: "",
};

const fieldClass = "border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-700";

const ProductPage = () => {
    const [products, setProducts] = useState([])
    const [brands, setBrands] = useState([])
    const [categories, setCategories] = useState([])

    // States for UI feedback
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Search States
    const [searchInput, setSearchInput] = useState("")
    const [search, setSearch] = useState("")

    // Filter States
    const [filters, setFilters] = useState(initialFilters)
    const [filterError, setFilterError] = useState("")
    const [showFilter, setShowFilter] = useState(false)

    // Order States
    const [ordering, setOrdering] = useState("name")

    // pagination states
    const [page, setPage] = useState(1)
    const [count, setCount] = useState(0)
    const [next, setNext] = useState(null)
    const [previous, setPrevious] = useState(null)
    const pageSize = 12
    const totalPages = Math.ceil(count / pageSize)

    // Load filter options once :
    useEffect(() => {
        let active = true

        async function loadOptions() {
            try {
                const [brandData, CategoryData] = await Promise.all([getBrands(), getCategories()])
                if (active) {
                    setBrands(Array.isArray(brandData) ? brandData : [])
                    setCategories(Array.isArray(CategoryData) ? CategoryData : [])
                }
            } catch (error) {
                if (active) {
                    setFilterError("Brand or category filters could not be loaded.")
                }
            }
        }

        loadOptions()

        return () => {
            active = false
        }
    }, [])

    // The Debounce timmer
    useEffect(() => {
        // Wait 300ms after the user stops typing to update the 'search' state
        const timer = setTimeout(() => {
            setSearch(searchInput.trim())
        }, 300)

        // If the user types again before 300ms, clear the old timer and start over
        return () => clearTimeout(timer);
    }, [searchInput])

    // Fetch the current page whenever filters, search, or ordering change.
    useEffect(() => {
        let active = true

        async function loadProducts() {
            setLoading(true)
            setError("")

            const min_price = filters.min_price === "" ? null : Number(filters.min_price)
            const max_price = filters.max_price === "" ? null : Number(filters.max_price)

            if (min_price < 0 || isNaN(min_price)) {
                setError("Minimum price cannot be negative.")
                setProducts([])
                setCount(0)
                setNext(null)
                setPrevious(null)
                setLoading(false)
                return
            }

            if (max_price < 0 || isNaN(max_price)) {
                setError("Maximum price cannot be negative.")
                setProducts([])
                setCount(0)
                setNext(null)
                setPrevious(null)
                setLoading(false)
                return
            }

            if (min_price !== null && max_price !== null && min_price > max_price) {
                setError("Minimum price cannot exceed maximum price.")
                setProducts([]);
                setCount(0);
                setNext(null);
                setPrevious(null);
                setLoading(false);
                return;
            }

            const params = {
                page,
                page_size: pageSize,
                ordering,
            }

            if (search) params.search = search

            for (const key in filters) {
                if (filters[key] !== "") {
                    params[key] = filters[key]
                }
            }

            try {
                const data = await getProducts(params)
                if (!active) return
                setProducts(data.results ?? [])
                setCount(data.count ?? 0)
                setNext(data.next ?? null)
                setPrevious(data.previous ?? null)
            } catch (error) {
                if (!active) return
                setError("We couldn't load the watches. Please try again.")
                setProducts([])
                setCount(0)
                setNext(null)
                setPrevious(null)
            } finally {
                if (active) setLoading(false)
            }
        }
        loadProducts()

        return () => {
            active = false
        }
    }, [search, filters, ordering, page])

    function handleFiltersChange(updateFilters) {
        setFilters(updateFilters)
        setPage(1)
    }

    function resetFilters() {
        setFilters(initialFilters);
        setSearchInput("");
        setSearch("");
        setOrdering("name");
        setPage(1);
    }

    return (
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
            <div className="mb-10">
                <p className="text-xs tracking-[0.2em] text-stone-500">
                    THE CHRONO COLLECTION
                </p>
                <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
                    All watches
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">
                    Find a watch that fits your style, from everyday
                    essentials to timeless classics.
                </p>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex min-w-0 flex-1 items-center gap-3 border border-stone-300 bg-white px-3 sm:max-w-md">
                    <Search size={18} className="shrink-0 text-stone-500" />
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        placeholder="Search watches..."
                        className="w-full py-3 text-sm outline-none"
                    />
                </label>

                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowFilter(!showFilter)} className="inline-flex items-center justify-center gap-2 border border-stone-300 px-4 py-3 text-sm lg:hidden">
                        <SlidersHorizontal size={16} />
                        {showFilter ? "Hide filters" : "Filters"}
                    </button>

                    <label className="flex items-center gap-2 text-sm">
                        <span className="hidden text-stone-500 sm:inline">
                            Sort by
                        </span>
                        <select
                            value={ordering}
                            onChange={(event) => {
                                setOrdering(event.target.value);
                                setPage(1);
                            }}
                            className={fieldClass}>
                            <option value="name">Name: A–Z</option>
                            <option value="-name">Name: Z–A</option>
                            <option value="price">Price: low to high</option>
                            <option value="-price">Price: high to low</option>
                            <option value="-created_at">Newest</option>
                        </select>
                    </label>
                </div>
            </div>

            {filterError && (<p role="status" className="mb-5 text-sm text-amber-800">{filterError}</p>)}

            <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
                <aside className={`${showFilter ? "block" : "hidden"} lg:block`}>
                    <ProductFilter filters={filters} brands={brands} categories={categories} onChange={handleFiltersChange} onReset={resetFilters}/>
                </aside>

                <div className="min-w-0">
                    <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm text-stone-500" aria-live="polite">
                            {loading ? "Loading watches..." : `${count} ${count === 1 ? "watch" : "watches"}`}
                        </p>
                    </div>

                    {error && (
                        <div role="alert" className="border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                            <p>{error}</p>
                            <button type="button" onClick={() => setPage((current) => current)} className="mt-3 underline">
                                Try again by changing a filter or reloading the page.
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }, (_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="aspect-[4/5] bg-stone-200" />
                                    <div className="mt-4 h-3 w-1/3 bg-stone-200" />
                                    <div className="mt-3 h-4 w-2/3 bg-stone-200" />
                                    <div className="mt-3 h-3 w-1/4 bg-stone-200" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div className="border border-stone-200 px-6 py-16 text-center">
                            <h2 className="text-xl font-medium">No watches found</h2>
                            <p className="mt-3 text-sm text-stone-500">Try another search or clear your filters.</p>
                            <button type="button" onClick={resetFilters} className="mt-6 border border-stone-300 px-5 py-3 text-sm hover:border-stone-700">
                                Clear filters
                            </button>
                        </div>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product}/>
                            ))}
                        </div>
                    )}

                    {!loading && !error && totalPages > 1 && (
                        <nav className="mt-12 flex items-center justify-center gap-6">
                            <button type="button" disabled={!previous} onClick={() => setPage((current) => current - 1)} className="border border-stone-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">
                                Previous
                            </button>

                            <span className="text-sm text-stone-600">
                                Page {page} of {totalPages}
                            </span>

                            <button type="button" disabled={!next} onClick={() => setPage((current) => current + 1)} className="border border-stone-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40">
                                Next
                            </button>
                        </nav>
                    )}
                </div>
            </div>
        </section>
    )
}

export default ProductPage
