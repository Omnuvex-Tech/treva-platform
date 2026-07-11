import { Component, type ReactNode, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CategoryCreate } from "./pages/categories/CategoryCreate";
import { CategoryEdit } from "./pages/categories/CategoryEdit";
import { UnitLayoutForm } from "./pages/unit-layouts/UnitLayoutForm";
import { ApartmentForm } from "./pages/resale/ApartmentForm";
import { ApartmentTypeForm } from "./pages/resale/ApartmentTypeForm";
import { OwnerForm } from "./pages/resale/OwnerForm";
import { AttributeForm } from "./pages/resale/AttributeForm";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MessageCenterProvider } from "./components/MessageCenter";

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
                <MessageCenterProvider>
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
                            path="/dashboard/resale"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/apartments"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/apartments/:id"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/apartments/create"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/apartment-types"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/owners"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/attributes"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/requests"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/room-options"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/resale/currencies"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/categories"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects/create"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects/:slug/edit"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects/:slug/config"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects/:slug/config/properties"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects/:slug/config/properties/houses/create"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/objects/:slug/config/properties/houses/:houseId/edit"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/unit-layouts"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/object-types"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/view-options"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/status-options"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/room-options"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/offplan/currencies"
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
                                    <Navigate to="/dashboard/offplan/categories" replace />
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
                                    <Navigate to="/dashboard/offplan/unit-layouts" replace />
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
                                    <Navigate to="/dashboard/offplan/room-options" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/room-options"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/room-options" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/view-options"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/offplan/view-options" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/currencies"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/offplan/currencies" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/status-options"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/offplan/status-options" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/apartments"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/apartments" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/apartments/new"
                            element={
                                <ProtectedRoute>
                                    <ApartmentForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/apartments/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <ApartmentForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/apartment-types"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/apartment-types" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/apartment-types/new"
                            element={
                                <ProtectedRoute>
                                    <ApartmentTypeForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/apartment-types/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <ApartmentTypeForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/owners"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/owners" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/owners/new"
                            element={
                                <ProtectedRoute>
                                    <OwnerForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/owners/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <OwnerForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/attributes"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/attributes" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/attributes/new"
                            element={
                                <ProtectedRoute>
                                    <AttributeForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/attributes/:id/edit"
                            element={
                                <ProtectedRoute>
                                    <AttributeForm />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/requests"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/requests" replace />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/resale/currencies"
                            element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard/resale/currencies" replace />
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
                </MessageCenterProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
