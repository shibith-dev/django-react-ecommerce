import React from 'react'
import { Link } from "react-router-dom";

const AuthPageLayout = ({ eyebrow = "WELCOME TO CHRONO", title, description, children }) => {
    return (
        <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-5 py-14 sm:px-8">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link
                        to="/"
                        className="text-xl font-semibold tracking-[0.2em]"
                    >
                        CHRONO
                    </Link>

                    <p className="mt-7 text-xs tracking-[0.2em] text-stone-500">
                        {eyebrow}
                    </p>

                    <h1 className="mt-3 text-3xl font-medium tracking-tight">
                        {title}
                    </h1>

                    {description && (
                        <p className="mt-3 text-sm leading-6 text-stone-600">
                            {description}
                        </p>
                    )}
                </div>

                {children}
            </div>
        </section>
    )
}

export default AuthPageLayout