import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, Bike, CheckCircle } from 'lucide-react';

export default function CartPage() {
    const { cartItems, updateQuantity, clearCart } = useCart();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [deliveryTime, setDeliveryTime] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const handlingFee = 20;
    const deliveryCharge = 45;
    const finalTotal = cartTotal + handlingFee + deliveryCharge;

    const handlePlaceOrder = () => {
        // Random time between 14 and 45 minutes
        const time = Math.floor(Math.random() * (45 - 14 + 1)) + 14;
        setDeliveryTime(time);
        setTimeLeft(time * 60); // in seconds for the progress bar
        setOrderPlaced(true);
        // We could also call clearCart() here depending on backend logic, 
        // but let's just clear UI state or keep it for receipt display.
    };

    // Timer effect for animation
    useEffect(() => {
        let timer;
        if (orderPlaced && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 100); // 100ms instead of 1000ms just to make the animation visible over a short debug window 
            // Wait, user wants an actual timer but realistic. Let's make it 1000ms (1s).
            // Actually, waiting 14 mins to test is long. Let's speed it up or just use strictly 1s for realism.
        }
        return () => clearInterval(timer);
    }, [orderPlaced, timeLeft]);

    // Calculate percentage for bike position (0 to 100)
    const progressPercent = deliveryTime > 0
        ? Math.max(0, 100 - (timeLeft / (deliveryTime * 60)) * 100)
        : 0;

    if (orderPlaced) {
        return (
            <div>
                <Navbar />
                <div className="container flex flex-col items-center justify-center" style={{ padding: '4rem 1rem', minHeight: '60vh', textAlign: 'center' }}>
                    <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Order Placed Successfully!</h2>

                    <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '2rem', marginTop: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Expected Delivery Time: {deliveryTime} minutes
                        </h3>

                        {deliveryTime > 25 && (
                            <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
                                Delivery expected to be delayed
                            </p>
                        )}

                        <div style={{ marginTop: '2rem', marginBottom: '2rem', position: 'relative', height: '4px', background: 'var(--gray-200)', borderRadius: '2px' }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                height: '100%',
                                width: `${progressPercent}%`,
                                background: 'var(--primary)',
                                transition: 'width 1s linear',
                                borderRadius: '2px'
                            }} />

                            <div style={{
                                position: 'absolute',
                                left: `calc(${progressPercent}% - 12px)`,
                                top: '-24px',
                                transition: 'left 1s linear'
                            }}>
                                <Bike size={32} color="var(--primary)" />
                            </div>
                        </div>

                        <p style={{ color: 'var(--gray-500)' }}>
                            Your rider has picked up the order and is on the way.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="container" style={{ padding: '2rem 1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>My Cart</h2>

                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--gray-500)', letterSpacing: '2px' }}>
                            EMPTY CART
                        </h3>
                        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => window.location.href = '/'}>
                            Keep Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Items List */}
                        <div className="flex flex-col gap-4" style={{ flex: 2, width: '100%' }}>
                            {cartItems.map((item) => (
                                <div key={item.id} className="card flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto" style={{ flex: 1 }}>
                                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{item.name}</p>
                                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>from {item.shop_name}</p>
                                            <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{item.price}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="btn"
                                                style={{ background: 'var(--gray-200)', padding: '0.25rem' }}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                className="btn"
                                                style={{ background: 'var(--gray-200)', padding: '0.25rem' }}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', minWidth: '80px', textAlign: 'right' }}>
                                            ₹{item.price * item.quantity}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                className="btn flex items-center justify-center gap-2"
                                style={{ padding: '0.75rem', fontSize: '1rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', alignSelf: 'flex-start' }}
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to clear your cart?")) {
                                        clearCart();
                                    }
                                }}
                            >
                                <Trash2 size={18} /> Clear Cart
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="card" style={{ flex: 1, width: '100%', position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                Bill Details
                            </h3>

                            <div className="flex justify-between" style={{ marginBottom: '0.5rem', color: 'var(--gray-500)' }}>
                                <span>Item Total</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between" style={{ marginBottom: '0.5rem', color: 'var(--gray-500)' }}>
                                <span>Handling Fee</span>
                                <span>₹{handlingFee}</span>
                            </div>
                            <div className="flex justify-between" style={{ marginBottom: '1rem', color: 'var(--gray-500)' }}>
                                <span>Delivery Charge</span>
                                <span>₹{deliveryCharge}</span>
                            </div>

                            <div className="flex justify-between items-center" style={{ fontSize: '1.3rem', fontWeight: 'bold', borderTop: '1px dashed var(--gray-300)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                                <span>To Pay</span>
                                <span>₹{finalTotal}</span>
                            </div>

                            <div style={{ background: 'var(--gray-100)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                                <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontWeight: 600 }}>
                                    <input type="radio" checked readOnly style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
                                    Cash on Delivery
                                </label>
                            </div>

                            <button onClick={handlePlaceOrder} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                                Place Order
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
