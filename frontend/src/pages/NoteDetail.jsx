import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import PaymentModal from "../components/common/PaymentModal";
import { useAuth } from "../context/AuthContext";
import { Download } from "lucide-react";

const NoteDetail = () => {
  const { token } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { id } = useParams();

  const [sellerNotes, setSellerNotes] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/notes/${id}`;
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch note data");
        }
        setNote(data);

        // Fetch other notes by this seller
        if (data.seller && data.seller._id) {
          const sellerRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notes/seller/${data.seller._id}`);
          const sellerData = await sellerRes.json();
          if (sellerRes.ok) {
            // Filter out the current note
            setSellerNotes(sellerData.filter(n => n._id !== data._id));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, token]);

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
  };

  const symbol = note ? (currencySymbols[note.currency] || "$") : "$";

  const handleBargain = () => {
    if (note && note.seller) {
      navigate("/chat", {
        state: {
          sellerId: note.seller._id,
          sellerName: note.seller.fullName,
          sellerProfilePicture: note.seller.profilePicture,
          noteId: note._id,
          noteTitle: note.title,
          noteThumbnail: note.thumbnailUrl,
          notePrice: note.price,
          noteCurrency: note.currency,
          noteSubject: note.subject,
        },
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#111827] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-[#111827] text-red-400 flex items-center justify-center">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#111827] flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 text-white overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto pb-20">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{note?.title}</h1>
          <p className="text-lg text-gray-400 mb-6">
            Uploaded by{" "}
            <Link to={`/profile/${note?.seller?._id}`} className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors">
              {note?.seller?.fullName}
            </Link>
          </p>

          {/* Document Preview Section */}
          <div className="mb-8 group">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                Document Preview
              </h2>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                {note?.fileType?.split('/')[1]?.toUpperCase() || 'PDF'}
              </span>
            </div>
            
            <div className="relative aspect-[3/4] md:aspect-video w-full rounded-2xl overflow-hidden glass border border-white/10 group-hover:border-white/20 transition-all duration-500 bg-slate-900 flex items-center justify-center">
              {note?.thumbnailUrl ? (
                <>
                  <img 
                    src={note.thumbnailUrl} 
                    alt="Document Preview" 
                    className="w-full h-full object-contain pointer-events-none group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  {!note?.isPurchased && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent flex items-end justify-center pb-12">
                      <div className="glass px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md border border-white/20 animate-float">
                        <div className="p-1 px-2.5 bg-blue-500 rounded-full text-[10px] font-bold">PREVIEW</div>
                        <span className="text-sm font-bold text-white">Full access available after purchase</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-600 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                    <Download size={32} />
                  </div>
                  <span className="font-bold tracking-widest uppercase text-xs">Preview Loading...</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1F2937]/50 backdrop-blur-sm p-8 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              Description
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {note?.description}
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-[#1F2937] p-4 rounded-lg border border-gray-700 gap-4 sm:gap-0">
            <span className="text-3xl font-bold text-green-400">
              {symbol}{note?.price?.toFixed(2)}
            </span>
            <div className="flex w-full sm:w-auto gap-4">
              {!note?.isPurchased && (
                <button
                  onClick={handleBargain}
                  className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Bargain
                </button>
              )}
              {note?.isPurchased ? (
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-green-600/20 transition-all"
                >
                  <Download size={20} />
                  Download Note
                </a>
              ) : (
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-blue-600/20 transition-all"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>

          <PaymentModal
            isOpen={isPaymentModalOpen}
            noteId={note._id}
            noteTitle={note.title}
            price={note.price}
            currency={note.currency}
            onClose={() => setIsPaymentModalOpen(false)}
          />

          {/* More from this user section */}
          {sellerNotes.length > 0 && (
            <div className="mt-16 relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">More from {note?.seller?.fullName}</h3>
                <div className="h-px bg-gray-700 flex-1 ml-6"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                {sellerNotes.slice(0, 3).map((sellerNote) => (
                  <div key={sellerNote._id} className="bg-[#1F2937] border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all group">
                    <div className="h-40 bg-gray-800 relative">
                      {sellerNote.thumbnailUrl ? (
                        <img src={sellerNote.thumbnailUrl} alt={sellerNote.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">NoteVerse</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white truncate">{sellerNote.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {currencySymbols[sellerNote.currency] || "$"}{sellerNote.price.toFixed(2)}
                      </p>
                      <a href={`/notes/${sellerNote._id}`} className="block mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium">View Details</a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Faded Footer Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none"></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NoteDetail;
