import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Plus, Book, Image as ImageIcon, MapPin, Tag, X } from 'lucide-react';
import Calendar from 'react-calendar';
import MemoryEntryModal from './MemoryEntryModal';
import MemoryDetailModal from './MemoryDetailModal';

export default function Dashboard() {
    const [memories, setMemories] = useState([]);
    const [onThisDayMemories, setOnThisDayMemories] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchData = async () => {
        try {
            setLoading(true);
            const [memoriesRes, onThisDayRes] = await Promise.all([
                axios.get(`${API_URL}/api/memories`),
                axios.get(`${API_URL}/api/memories/on-this-day`)
            ]);
            setMemories(memoriesRes.data);
            setOnThisDayMemories(onThisDayRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const isSameDay = (date1, date2) => {
        const d1 = parseDateObj(date1);
        const d2 = parseDateObj(date2);
        if (isNaN(d1) || isNaN(d2)) return false;

        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const hasMemory = memories.some(memory => isSameDay(memory.date, date));
            return hasMemory ? 'has-memory' : null;
        }
        return null;
    };

    const handleDateChange = (date) => {
        if (selectedDate && isSameDay(date, selectedDate)) {
            setSelectedDate(null); // Click again to deselect
        } else {
            setSelectedDate(date);
        }
    };

    const filteredMemories = selectedDate
        ? memories.filter(memory => isSameDay(memory.date, selectedDate))
        : memories;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Your Diary</h1>
                <button className="btn btn-accent" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Entry
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                    Loading memories...
                </div>
            ) : memories.length === 0 && onThisDayMemories.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius)',
                    border: '1px dashed var(--border)'
                }}>
                    <Book size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>No memories yet</h3>
                    <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Start documenting your life today.</p>
                    <button className="btn" onClick={() => setIsModalOpen(true)}>Write your first entry</button>
                </div>
            ) : (
                <>
                    {/* On This Day View */}
                    {onThisDayMemories.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '20px', color: 'var(--accent)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarIcon size={20} /> On this day
                            </h2>
                            <div className="memory-grid">
                                {onThisDayMemories.map(memory => (
                                    <div key={memory.id} className="memory-card" style={{ borderColor: 'var(--accent)', cursor: 'pointer' }} onClick={() => setSelectedMemory(memory)}>
                                        {memory.media && memory.media.length > 0 ? (
                                            memory.media[0].type === 'image' ? (
                                                <img src={memory.media[0].url} alt={memory.title} className="memory-media" />
                                            ) : (
                                                <video src={memory.media[0].url} className="memory-media" muted />
                                            )
                                        ) : (
                                            <div className="memory-placeholder">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}

                                        <div className="memory-content">
                                            <div className="memory-date">{formatDate(memory.date)} ({new Date().getFullYear() - new Date(memory.date).getFullYear()} years ago)</div>
                                            <h3 className="memory-card-title">{memory.title || 'Untitled Memory'}</h3>
                                            <p className="memory-excerpt">
                                                {memory.content.length > 100 ? `${memory.content.substring(0, 100)}...` : memory.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar & Memories Feed View */}
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                        {/* Selected Date Filter Sidebar */}
                        <div style={{ flex: '1 1 300px', maxWidth: '400px', order: window.innerWidth < 768 ? 1 : 2 }}>
                            <h2 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '16px' }}>Calendar</h2>
                            <Calendar
                                onChange={handleDateChange}
                                value={selectedDate}
                                tileClassName={tileClassName}
                            />
                            {selectedDate && (
                                <button
                                    className="btn btn-outline"
                                    style={{ marginTop: '16px', width: '100%' }}
                                    onClick={() => setSelectedDate(null)}
                                >
                                    <X size={16} /> Clear Selection
                                </button>
                            )}
                        </div>

                        {/* Memories Render */}
                        <div style={{ flex: '2 1 500px', order: window.innerWidth < 768 ? 2 : 1 }}>
                            <h2 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>{selectedDate ? `Memories on ${formatDate(selectedDate)}` : 'All Memories'}</span>
                                {selectedDate && <span className="tag-badge">{filteredMemories.length} entries</span>}
                            </h2>

                            {filteredMemories.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <p style={{ color: 'var(--text-light)' }}>No memories found for this date.</p>
                                </div>
                            ) : (
                                <div className="memory-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                                    {filteredMemories.map(memory => (
                                        <div key={memory.id} className="memory-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedMemory(memory)}>
                                            {memory.media && memory.media.length > 0 ? (
                                                memory.media[0].type === 'image' ? (
                                                    <img src={memory.media[0].url} alt={memory.title} className="memory-media" />
                                                ) : (
                                                    <video src={memory.media[0].url} className="memory-media" muted />
                                                )
                                            ) : (
                                                <div className="memory-placeholder">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}

                                            <div className="memory-content">
                                                <div className="memory-date">{formatDate(memory.date)}</div>
                                                <h3 className="memory-card-title">{memory.title || 'Untitled Memory'}</h3>
                                                <p className="memory-excerpt">
                                                    {memory.content.length > 100 ? `${memory.content.substring(0, 100)}...` : memory.content}
                                                </p>
                                                <div className="memory-footer">
                                                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)' }}>
                                                        {memory.mood && <span>Mood: {memory.mood}</span>}
                                                    </span>
                                                    {memory.tags && memory.tags.length > 0 && (
                                                        <span className="tag-badge">{memory.tags[0]}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {isModalOpen && (
                <MemoryEntryModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchData();
                    }}
                />
            )}

            {selectedMemory && (
                <MemoryDetailModal
                    memory={selectedMemory}
                    onClose={() => setSelectedMemory(null)}
                    onDeleteSuccess={() => {
                        setSelectedMemory(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
