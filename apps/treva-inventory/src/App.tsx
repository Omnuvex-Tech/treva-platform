import { Component, type ReactNode, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CategoryList } from "./pages/categories/CategoryList";
import { CategoryCreate } from "./pages/categories/CategoryCreate";
import { CategoryEdit } from "./pages/categories/CategoryEdit";
import { UnitLayoutList } from "./pages/unit-layouts/UnitLayoutList";
import { UnitLayoutForm } from "./pages/unit-layouts/UnitLayoutForm";
import { RoomOptionList } from "./pages/room-options/RoomOptionList";
import { ProtectedRoute } from "./components/ProtectedRoute";

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

function AuthEventBridge() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handler = () => {
            if (location.pathname !== "/login") {
                navigate("/login", { replace: true });
            }
        };

        window.addEventListener("treva-inventory:unauthorized", handler);
        return () => {
            window.removeEventListener("treva-inventory:unauthorized", handler);
        };
    }, [location.pathname, navigate]);

    return null;
}

function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <AuthEventBridge />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <ProtectedRoute>
                                    <CategoryList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/categories/new"
                            element={
                                <ProtectedRoute>
                                    <CategoryCreate />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/categories/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <CategoryEdit />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/unit-layouts"
                            element={
                                <ProtectedRoute>
                                    <UnitLayoutList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/unit-layouts/new"
                            element={
                                <ProtectedRoute>
                                    <UnitLayoutForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/unit-layouts/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <UnitLayoutForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/room-options"
                            element={
                                <ProtectedRoute>
                                    <RoomOptionList />
                                </ProtectedRoute>
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
