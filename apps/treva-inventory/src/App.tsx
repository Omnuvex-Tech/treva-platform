import { Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CategoryList } from "./pages/categories/CategoryList";
import { CategoryCreate } from "./pages/categories/CategoryCreate";
import { CategoryEdit } from "./pages/categories/CategoryEdit";
import { UnitLayoutList } from "./pages/unit-layouts/UnitLayoutList";
import { UnitLayoutForm } from "./pages/unit-layouts/UnitLayoutForm";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean; error: string }
> {
    state = { hasError: false, error: "" };
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error.message };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                    <div className="max-w-md text-center">
                        <h1 className="mb-2 text-4xl font-bold">Error</h1>
                        <p className="mb-4 text-white/50">{this.state.error}</p>
                        <a
                            href="/"
                            className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium"
                        >
                            Go Home
                        </a>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function AuthGuard({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return null;
    }
    return <>{children}</>;
}

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <AuthGuard>
                                    <Dashboard />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <AuthGuard>
                                    <CategoryList />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/categories/new"
                            element={
                                <AuthGuard>
                                    <CategoryCreate />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/categories/:id/edit"
                            element={
                                <AuthGuard>
                                    <CategoryEdit />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/unit-layouts"
                            element={
                                <AuthGuard>
                                    <UnitLayoutList />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/unit-layouts/new"
                            element={
                                <AuthGuard>
                                    <UnitLayoutForm />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/unit-layouts/:id/edit"
                            element={
                                <AuthGuard>
                                    <UnitLayoutForm />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                                    <div className="text-center">
                                        <h1 className="mb-2 text-4xl font-bold">404</h1>
                                        <p className="mb-6 text-white/50">Page not found</p>
                                        <a
                                            href="/"
                                            className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/20"
                                        >
                                            Go Home
                                        </a>
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
