import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Tag, Trash2 } from 'lucide-react';

export default function MemoryDetailModal({ memory, onClose, onDeleteSuccess }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    if (!memory) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/memories/${memory.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onDeleteSuccess();
        } catch (error) {
            console.error("Failed to delete memory:", error);
            alert("Failed to delete memory. Please try again.");
            setIsDeleting(false);
        }
    };

    const parseDateObj = (dateObj) => {
        if (!dateObj) return new Date();
        if (dateObj._seconds) return new Date(dateObj._seconds * 1000);
        return new Date(dateObj);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const d = parseDateObj(dateString);
        return isNaN(d) ? 'Invalid Date' : d.toLocaleDateString(undefined, options);
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="modal-header" style={{ marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '28px', maxWidth: '85%' }}>{memory.title || 'Untitled Memory'}</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {showConfirmDelete ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', padding: '6px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--error)' }}>
                                <span style={{ fontSize: '13px', color: 'var(--error)' }}>Delete this memory?</span>
                                <button className="btn btn-accent" style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--error)' }} onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? '...' : 'Yes'}
                                </button>
                                <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setShowConfirmDelete(false)} disabled={isDeleting}>
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowConfirmDelete(true)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '4px' }}
                                title="Delete Memory"
                            >
                                <Trash2 size={24} color={'#dc2626'} />
                            </button>
                        )}
                        <button className="close-btn" onClick={onClose} disabled={isDeleting}><X size={24} /></button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-light)', fontSize: '14px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} />
                        <span>{formatDate(memory.date)}</span>
                    </div>
                    {memory.mood && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Mood: {memory.mood}</span>
                        </div>
                    )}
                    {memory.tags && memory.tags.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={16} />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {memory.tags.map(tag => (
                                    <span key={tag} className="tag-badge">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                    {memory.content}
                </div>

                {memory.media && memory.media.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--primary)' }}>Media</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            {memory.media.map((mediaItem, index) => (
                                <div key={index} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: '#edf2f7', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                    {mediaItem.type === 'image' ? (
                                        <img src={mediaItem.url} alt={`Memory media ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <video src={mediaItem.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
