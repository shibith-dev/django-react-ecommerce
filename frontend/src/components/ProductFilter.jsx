import React from 'react'

const fieldClass = "w-full border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-700";

function FilterField({ label, children }) {
    return (
        <label className='block'>
            <span className='mb-2 block text-xs font-medium text-stone-600'>{label}</span>
            {children}
        </label>
    )
}

const ProductFilter = ({ filters, brands, categories, onChange, onReset }) => {

    function updateField(event) {
        onChange({ ...filters, [event.target.name]: event.target.value })
    }

    return (
        <main className='space-y-5'>
            {/* Head section */}
            <div className='flex items-center justify-between'>
                <h2 className='text-sm font-medium'>Filters</h2>
                <button type='button' onClick={onReset} className='text-xs text-stone-500 underline hover:text-black'>clear all</button>
            </div>

            {/* Brand Filter */}
            <FilterField label="Brand">
                <select name='brand' value={filters.brand} onChange={updateField} className={fieldClass}>
                    <option value="">All brands</option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.slug}>{brand.name}</option>
                    ))}
                </select>
            </FilterField>

            {/* Category Filter */}
            <FilterField label="Category">
                <select name="category" value={filters.category} onChange={updateField} className={fieldClass}>
                    <option value="">All Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.slug}>{category.name}</option>
                    ))}
                </select>
            </FilterField>

            {/* Price Range Filtering */}
            <div>
                <p className='mb-2 text-xs font-medium text-stone-600'>Price range(₹)</p>
                <div className='grid grid-cols-2 gap-2'>
                    <input type="number" min="0" name='min_price' value={filters.min_price} onChange={updateField} placeholder='Minimum' className={fieldClass} />
                    <input type="number" min="0" name='max_price' value={filters.max_price} onChange={updateField} placeholder='Maximum' className={fieldClass} />
                </div>
            </div>

            {/* Filter based on watch type */}
            <FilterField label="Watch Type">
                <select name="watch_type" value={filters.watch_type} onChange={updateField} className={fieldClass}>
                    <option value="">All types</option>
                    <option value="analog">Analog</option>
                    <option value="digital">Digital</option>
                    <option value="smartwatch">Smartwatch</option>
                    <option value="hybrid">Hybrid</option>
                </select>
            </FilterField>

            {/* Filter based on Movement */}
            <select name="movement_type" value={filters.movement_type} onChange={updateField} className={fieldClass}>
                <option value="">All movements</option>
                <option value="quartz">Quartz</option>
                <option value="automatic">Automatic</option>
                <option value="mechanical">Mechanical</option>
                <option value="smart">Smart</option>
            </select>
            
            {/* Filter based on Strap material */}
            <FilterField label="Strap material">
                <select name="strap_material" value={filters.strap_material} onChange={updateField} className={fieldClass}>
                    <option value="">All materials</option>
                    <option value="stainless_steel">Stainless steel</option>
                    <option value="leather">Leather</option>
                    <option value="silicone">Silicone</option>
                    <option value="rubber">Rubber</option>
                    <option value="fabric">Fabric</option>
                    <option value="titanium">Titanium</option>
                    <option value="resin">Resin</option>
                    <option value="other">Other</option>
                </select>
            </FilterField>
        </main>
    )
}

export default ProductFilter