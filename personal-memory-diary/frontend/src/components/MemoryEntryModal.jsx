import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Calendar } from 'lucide-react';

export default function MemoryEntryModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        mood: 'Neutral',
        tags: ''
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('date', formData.date);
            data.append('mood', formData.mood);

            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
            data.append('tags', JSON.stringify(tagsArray));

            files.forEach(file => {
                data.append('media', file);
            });

            await axios.post(`${API_URL}/api/memories`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to save memory. Please verify your Firebase connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>New Memory Entry</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="What made today special?"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Write your memory</label>
                        <textarea
                            name="content"
                            rows="5"
                            placeholder="Dear Diary..."
                            value={formData.content}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Mood</label>
                            <select name="mood" value={formData.mood} onChange={handleChange}>
                                <option value="Happy">Happy 😊</option>
                                <option value="Productive">Productive ⚡</option>
                                <option value="Relaxed">Relaxed 😌</option>
                                <option value="Sad">Sad 😔</option>
                                <option value="Excited">Excited 🎉</option>
                                <option value="Neutral">Neutral 😐</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                placeholder="travel, family, work"
                                value={formData.tags}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Photos / Videos (max 5)</label>
                        <div style={{
                            position: 'relative',
                            border: '2px dashed var(--border)',
                            borderRadius: '8px',
                            padding: '24px',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg)',
                            cursor: 'pointer'
                        }}>
                            <Upload size={24} color="var(--secondary)" style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                                Click to select files
                            </p>
                            <input
                                title="photo upload"
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                style={{
                                    opacity: 0,
                                    position: 'absolute',
                                    top: 0, left: 0, bottom: 0, right: 0,
                                    width: '100%',
                                    cursor: 'pointer'
                                }}
                            />
                            {files.length > 0 && (
                                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--primary)' }}>
                                    {files.length} file(s) selected
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-accent" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Memory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
