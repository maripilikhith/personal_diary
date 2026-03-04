import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Passwords do not match');
        }

        try {
            setError('');
            setLoading(true);
            await signup(emailRef.current.value, passwordRef.current.value);
            navigate('/');
        } catch (err) {
            console.error("Signup error:", err);
            setError(err.message || 'Failed to create an account');
        }

        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Sign Up</h2>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" ref={emailRef} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" ref={passwordRef} required />
                    </div>
                    <div className="form-group">
                        <label>Password Confirmation</label>
                        <input type="password" ref={passwordConfirmRef} required />
                    </div>
                    <button disabled={loading} className="btn w-100" type="submit">
                        Sign Up
                    </button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
}
