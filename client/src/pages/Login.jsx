import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

export default function Login() {
    const navigate = useNavigate();

    const handleGoogleSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            // Store the decoded user info in localStorage for persistence
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userProfile', JSON.stringify({
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture
            }));
            navigate('/');
        } catch (error) {
            console.error("Token decoding failed", error);
        }
    };

    const handleGoogleError = () => {
        console.error('Login Failed');
        alert("Google Login Failed. Note: This requires a valid Google Client ID configured in main.jsx");
    };

    // Keep dummy login for testing flexibility without Client ID
    const handleDummyLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userProfile', JSON.stringify({
            name: "Guest User",
            email: "guest@example.com",
            picture: "https://ui-avatars.com/api/?name=Guest+User&background=random"
        }));
        navigate('/');
    };

    return (
        <div className="flex justify-center items-center" style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, background: 'linear-gradient(135deg, #fef9c3 0%, #dcfce7 100%)', position: 'fixed', top: 0, left: 0 }}>
            <div className="card flex flex-col items-center gap-4" style={{ padding: '3rem', minWidth: '350px', zIndex: 10 }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>DinasiMart</h1>
                <p style={{ color: 'var(--gray-500)' }}>Your daily needs, delivered.</p>

                <div style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={() => {
                            // Native Mock Authentication
                            localStorage.setItem('isAuthenticated', 'true');
                            localStorage.setItem('userProfile', JSON.stringify({
                                name: "Demo User",
                                email: "demo@example.com",
                                picture: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                            }));
                            navigate('/');
                        }}
                        className="btn flex items-center justify-center gap-3"
                        style={{
                            width: '100%',
                            fontSize: '1rem',
                            background: '#1a73e8', // Official Google Blue
                            color: '#ffffff',
                            border: '1px solid transparent',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '4px',
                            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                            fontWeight: 500,
                            fontFamily: 'Roboto, sans-serif'
                        }}>
                        <div style={{ background: '#fff', padding: '0.2rem', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                        </div>
                        Sign in with Google
                    </button>
                </div>

                <div style={{ width: '100%', textAlign: 'center', margin: '0.5rem 0', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    - OR -
                </div>

                <button onClick={handleDummyLogin} className="btn" style={{ width: '100%', fontSize: '1.1rem', background: '#f4f4f5', color: 'var(--dark)' }}>
                    Continue as Guest Worker
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>By logging in, you agree to our Terms.</p>
            </div>
        </div>
    );
}
