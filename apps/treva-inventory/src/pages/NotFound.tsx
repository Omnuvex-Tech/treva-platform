import { Link } from "react-router-dom";

export function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] px-6 text-[#1A1A1A]">
            <div className="text-center">
                <h1 className="mb-2 text-4xl font-bold">404</h1>
                <p className="mb-6 text-[#808191]">Page not found</p>
                <Link
                    to="/"
                    className="inline-flex rounded-lg bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
