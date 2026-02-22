import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        if (query.length > 0) {
            const fetchSuggestions = async () => {
                try {
                    const res = await fetch(`/api/search?q=${query}`);
                    const data = await res.json();
                    if (data.message === 'success') {
                        setSuggestions(data.data);
                        setIsOpen(true);
                    }
                } catch (err) {
                    console.error(err);
                }
            };

            const debounce = setTimeout(fetchSuggestions, 300);
            return () => clearTimeout(debounce);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query]);

    const handleSelect = (id) => {
        navigate(`/product/${id}`);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div className="flex items-center" style={{
                background: 'var(--gray-100)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-200)'
            }}>
                <Search size={20} color="var(--gray-500)" />
                <input
                    className="input"
                    style={{ border: 'none', background: 'transparent', padding: '0 0.5rem' }}
                    placeholder="Search 'milk'..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                />
            </div>

            {isOpen && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className="flex items-center gap-4"
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--gray-100)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div>
                                <p style={{ fontWeight: 500 }}>{item.name}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>In {item.category_id}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
