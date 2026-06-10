import { Link } from "react-router-dom";

export function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
                <h1 className="mb-2 text-4xl font-bold">404</h1>
                <p className="mb-6 text-white/50">Page not found</p>
                <Link
                    to="/"
                    className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/20"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
