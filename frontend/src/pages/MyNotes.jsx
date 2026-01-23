import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import NoteCard from "../components/dashboard/NoteCard";
import { useAuth } from "../context/AuthContext";

const MyNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: "",
        description: "",
        price: "",
        subject: "",
        currency: "USD",
    });

    useEffect(() => {
        const fetchMyNotes = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/my-notes`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch your notes");
                }

                setNotes(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchMyNotes();
        }
    }, [token]);

    const handleDeleteNote = async (noteId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/${noteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete note");
            }

            // Remove from state
            setNotes(notes.filter((note) => note._id !== noteId));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (noteId) => {
        const noteToEdit = notes.find((n) => n._id === noteId);
        if (noteToEdit) {
            setEditingNote(noteToEdit);
            setEditFormData({
                title: noteToEdit.title,
                description: noteToEdit.description,
                price: noteToEdit.price,
                subject: noteToEdit.subject,
                currency: noteToEdit.currency || "USD",
            });
            setIsEditModalOpen(true);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/${editingNote._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editFormData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update note");
            }

            // Update state
            setNotes(notes.map((n) => (n._id === editingNote._id ? data : n)));
            setIsEditModalOpen(false);
            setEditingNote(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-[#111827] flex">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto relative">
                <h2 className="text-3xl font-bold text-white mb-8">My Notes</h2>

                {loading && <p className="text-gray-400">Loading your notes...</p>}
                {error && <p className="text-red-400">Error: {error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {notes.map((note) => (
                            <NoteCard
                                key={note._id}
                                id={note._id}
                                title={note.title}
                                author="Me"
                                price={note.price.toFixed(2)}
                                subject={note.subject}
                                thumbnailUrl={note.thumbnailUrl}
                                sellerId={note.seller}
                                isOwner={true}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteNote}
                                sellerProfilePicture={token ? JSON.parse(atob(token.split('.')[1])).profilePicture : null} // This is a bit hacky, better to use authUser
                                currency={note.currency}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && notes.length === 0 && (
                    <p className="text-gray-400 text-lg">
                        You haven't uploaded any notes yet.
                    </p>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-[#1F2937] p-8 rounded-lg w-full max-w-md border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4">Edit Note</h3>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={editFormData.title}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full bg-[#374151] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={editFormData.subject}
                                        onChange={handleEditChange}
                                        className="mt-1 block w-full bg-[#374151] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-400">Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={editFormData.price}
                                            onChange={handleEditChange}
                                            className="mt-1 block w-full bg-[#374151] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-400">Currency</label>
                                        <select
                                            name="currency"
                                            value={editFormData.currency}
                                            onChange={handleEditChange}
                                            className="mt-1 block w-full bg-[#374151] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="JPY">JPY (¥)</option>
                                            <option value="CAD">CAD ($)</option>
                                            <option value="AUD">AUD ($)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400">Description</label>
                                    <textarea
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                        rows="3"
                                        className="mt-1 block w-full bg-[#374151] border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyNotes;
