import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { CategoryList } from "./pages/categories/CategoryList";
import { CategoryCreate } from "./pages/categories/CategoryCreate";
import { CategoryEdit } from "./pages/categories/CategoryEdit";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
const queryClient = new QueryClient();
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/categories", element: _jsx(ProtectedRoute, { children: _jsx(CategoryList, {}) }) }), _jsx(Route, { path: "/categories/new", element: _jsx(ProtectedRoute, { children: _jsx(CategoryCreate, {}) }) }), _jsx(Route, { path: "/categories/:id/edit", element: _jsx(ProtectedRoute, { children: _jsx(CategoryEdit, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }));
}
export default App;
