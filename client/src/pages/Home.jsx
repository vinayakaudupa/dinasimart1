import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.data))
            .catch(err => console.error(err));

        fetch('/api/items')
            .then(res => res.json())
            .then(data => setItems(data.data))
            .catch(err => console.error(err));
    }, []);

    const getCategoryItems = (catId) => {
        return items.filter(i => i.category_id === catId).slice(0, 4); // Show top 4 items
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ padding: '2rem 1rem' }}>

                <div style={{
                    background: 'var(--brand-gradient)',
                    borderRadius: 'var(--radius)',
                    padding: '2rem',
                    marginBottom: '2rem',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome to DinasiMart</h2>
                    <p>Get your daily essentials delivered in minutes.</p>
                </div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Shop by Category</h3>

                <div className="grid" style={{
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem',
                    paddingBottom: '2rem'
                }}>
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="card"
                            style={{
                                height: 'auto',
                                padding: '1.5rem',
                                boxShadow: 'var(--shadow-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                            }}
                        >
                            <div className="flex items-center gap-3" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'var(--gray-100)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}>
                                    {cat.name[0]}
                                </div>
                                <h4 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{cat.name}</h4>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                {getCategoryItems(cat.id).map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius)',
                                            background: 'var(--gray-100)',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <img src={item.image} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.name}
                                        </p>
                                    </div>
                                ))}
                                {getCategoryItems(cat.id).length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>No items</p>}
                            </div>

                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
