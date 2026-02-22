import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
    const { totalItems, cartItems } = useCart();
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    }, []);

    return (
        <nav className="card" style={{
            position: 'sticky', top: 0, zIndex: 100, borderRadius: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 2rem', borderBottom: '1px solid var(--gray-200)'
        }}>
            <div className="flex items-center gap-4" style={{ flex: 1 }}>
                <h1 style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
                    DinasiMart
                </h1>
                <div style={{ flex: 1, maxWidth: '600px', marginLeft: '2rem' }}>
                    <SearchBar />
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                        {localStorage.getItem('userProfile') && (
                            <img
                                src={JSON.parse(localStorage.getItem('userProfile')).picture}
                                alt="Profile"
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        )}
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')).name.split(' ')[0] : 'User'}
                        </span>
                        <button className="btn" style={{ fontWeight: 500, fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} onClick={async () => {
                            try {
                                if (cartItems.length > 0) {
                                    await clearCart(); // Fix: Use destructured clearCart directly
                                }
                            } catch (e) {
                                console.error("Error clearing cart on logout", e);
                            } finally {
                                localStorage.removeItem('isAuthenticated');
                                localStorage.removeItem('userProfile');
                                window.location.reload();
                            }
                        }}>Logout</button>
                    </div>
                ) : (
                    <button className="btn" style={{ fontWeight: 500 }} onClick={() => window.location.href = '/login'}>Login</button>
                )}
                <button
                    className="btn btn-primary flex items-center gap-2"
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => window.location.href = '/cart'}
                >
                    <ShoppingCart size={20} />
                    <div className="flex flex-col items-start" style={{ lineHeight: 1 }}>
                        <span style={{ fontSize: '0.8rem' }}>{totalItems} items</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{totalPrice}</span>
                    </div>
                </button>
            </div>
        </nav>
    );
}
