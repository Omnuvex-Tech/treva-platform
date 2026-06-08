export function App() {
    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">Treva Inventory</div>
                <nav className="nav">
                    <a href="#dashboard">Dashboard</a>
                    <a href="#products">Products</a>
                    <a href="#stock">Stock</a>
                    <a href="#suppliers">Suppliers</a>
                    <a href="#settings">Settings</a>
                </nav>
            </aside>
            <main className="main">
                <header className="topbar">
                    <div>
                        <div className="title">Dashboard</div>
                        <div className="subtitle">
                            Inventory management admin panel scaffold
                        </div>
                    </div>
                </header>
                <section className="content">
                    <div className="cards">
                        <div className="card">
                            <div className="cardTitle">Total Products</div>
                            <div className="cardValue">—</div>
                        </div>
                        <div className="card">
                            <div className="cardTitle">Low Stock</div>
                            <div className="cardValue">—</div>
                        </div>
                        <div className="card">
                            <div className="cardTitle">Suppliers</div>
                            <div className="cardValue">—</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
