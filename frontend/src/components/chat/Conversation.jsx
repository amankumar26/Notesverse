import React, { useState, useEffect, useRef } from "react";
import { Send, Trash2, CheckSquare, X, Check, ArrowLeft, Reply } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Conversation = ({ selectedContact, socket, onBack, referencedNote, clearReferencedNote }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const { authUser, token } = useAuth();
  const messagesEndRef = useRef(null);

  // Drop Price Modal State
  const [isDropPriceModalOpen, setIsDropPriceModalOpen] = useState(false);
  const [selectedNoteForDrop, setSelectedNoteForDrop] = useState(null);
  const [dropPriceValue, setDropPriceValue] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const [swipedMessageId, setSwipedMessageId] = useState(null);
  const isScrollingRef = useRef(false);

  // Image Modal State
  const [selectedImage, setSelectedImage] = useState(null);

  // User Profile Modal State
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUserProfileData(data);
        setIsUserProfileModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const handleProfilePicClick = (imageUrl) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
    }
  };

  const handleUserNameClick = () => {
    if (selectedContact) {
      fetchUserProfile(selectedContact.id);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Check if user is near bottom before forcing scroll
      const container = messagesEndRef.current.parentElement;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom || messageList.length === 0) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  // Load messages from API when selectedContact changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !authUser || !token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/messages/${selectedContact.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const formattedMessages = data.map((msg) => ({
            id: msg._id,
            text: msg.text,
            sender: msg.senderId === authUser._id ? "me" : "them",
            time: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            senderId: msg.senderId,
            recipientId: msg.recipientId,
            senderProfilePicture:
              msg.senderId === authUser._id
                ? authUser.profilePicture
                : selectedContact.avatar,
            referencedNote: msg.referencedNote,
            messageType: msg.messageType,
            replyTo: msg.replyTo,
          }));
          setMessageList(formattedMessages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (selectedContact) {
      fetchMessages();
      // Reset selection mode when contact changes
      setIsSelectionMode(false);
      setSelectedMessageIds([]);
      setReplyingTo(null);
      setCurrentMessage(""); // Clear input field
    }
  }, [selectedContact, authUser, token]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      if (selectedContact && String(data.senderId) === String(selectedContact.id)) {
        const incomingMessage = {
          id: data._id || Date.now(), // Fallback ID if missing
          text: data.text,
          sender: "them",
          time: data.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
          senderId: data.senderId,
          recipientId: data.recipientId,
          senderProfilePicture: data.senderProfilePicture || selectedContact.avatar,
          referencedNote: data.referencedNote,
          messageType: data.messageType,
          replyTo: data.replyTo,
        };
        setMessageList((prev) => [...prev, incomingMessage]);
      }
    };

    if (socket) {
      socket.on("receive_message", handleReceiveMessage);
    }

    return () => {
      if (socket) {
        socket.off("receive_message", handleReceiveMessage);
      }
    };
  }, [selectedContact, socket]);


  const sendMessage = async (type = "text", customPayload = {}, textOverride = null) => {
    if ((currentMessage !== "" || type === "offer" || textOverride) && selectedContact && authUser) {
      try {
        const payload = {
          recipientId: selectedContact.id,
          text: textOverride || (type === "text" ? currentMessage : ""),
          referencedNote: customPayload.referencedNote || referencedNote,
          messageType: type,
          replyTo: replyingTo ? replyingTo.id : null,
        };

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          const newMessage = {
            id: data._id,
            text: data.text,
            sender: "me",
            time: new Date(data.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            senderId: authUser._id,
            senderName: authUser.fullName,
            senderProfilePicture: authUser.profilePicture,
            recipientId: selectedContact.id,
            referencedNote: data.referencedNote,
            messageType: data.messageType,
            replyTo: data.replyTo,
          };

          setMessageList((list) => [...list, newMessage]);
          if (type === "text") setCurrentMessage("");
          setReplyingTo(null);
          if (clearReferencedNote && type === "text") clearReferencedNote();

          // Emit socket event for real-time updates
          socket.emit("send_message", newMessage);

          if (onMessageSent) {
            onMessageSent(newMessage);
          }
        }
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  const handleNoteClick = (note) => {
    // Only open modal if I am the seller of this note
    if (note && authUser._id === note.sellerId) {
      setSelectedNoteForDrop(note);
      setDropPriceValue(note.price); // Default to current price
      setIsDropPriceModalOpen(true);
    }
  };

  const handleDropPriceSubmit = async () => {
    if (!selectedNoteForDrop || !dropPriceValue) return;

    const discountNote = {
      ...selectedNoteForDrop,
      originalPrice: selectedNoteForDrop.price,
      discountedPrice: parseFloat(dropPriceValue),
    };

    await sendMessage("offer", { referencedNote: discountNote });
    setIsDropPriceModalOpen(false);
    setSelectedNoteForDrop(null);
    setDropPriceValue("");
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMessageIds([]);
  };

  const toggleMessageSelection = (id) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const selectAllMessages = () => {
    if (selectedMessageIds.length === messageList.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(messageList.map((msg) => msg.id));
    }
  };

  const deleteSelectedMessages = async () => {
    // Optimistic update
    const idsToDelete = [...selectedMessageIds];
    setMessageList((prev) => prev.filter((msg) => !idsToDelete.includes(msg.id)));
    setSelectedMessageIds([]);
    setIsSelectionMode(false);

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/messages`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messageIds: idsToDelete }),
      });
    } catch (error) {
      console.error("Failed to delete messages:", error);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    // Focus input
    const input = document.querySelector('input[type="text"]');
    if (input) input.focus();
  };

  const handleTouchStart = (e, messageId) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    touchMoveRef.current = null;
    isScrollingRef.current = false;
  };

  const handleTouchMove = (e, messageId) => {
    if (!touchStartRef.current) return;

    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;

    touchMoveRef.current = { x: currentX, y: currentY };

    const diffX = currentX - touchStartRef.current.x;
    const diffY = Math.abs(currentY - touchStartRef.current.y);

    // If vertical scroll is detected, mark as scrolling and ignore swipe
    if (diffY > Math.abs(diffX)) {
      isScrollingRef.current = true;
      return;
    }

    if (isScrollingRef.current) return;

    // Only allow swiping right and limit the distance
    if (diffX > 0 && diffX < 100) {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          element.style.transform = `translateX(${diffX}px)`;
        });
      }
    }
  };

  const handleTouchEnd = (e, message) => {
    if (!touchStartRef.current || !touchMoveRef.current || isScrollingRef.current) {
      // Reset if we were scrolling or didn't move enough
      if (isScrollingRef.current) {
        const element = document.getElementById(`message-${message.id}`);
        if (element) element.style.transform = 'translateX(0)';
      }
      return;
    }

    const diffX = touchMoveRef.current.x - touchStartRef.current.x;

    const element = document.getElementById(`message-${message.id}`);
    if (element) {
      element.style.transform = 'translateX(0)';
      element.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        element.style.transition = '';
      }, 300);
    }

    if (diffX > 50) { // Threshold for swipe
      handleReply(message);
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
    isScrollingRef.current = false;
  };

  const scrollToMessage = (messageId) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a temporary highlight
      element.classList.add("ring-2", "ring-blue-500", "ring-offset-2", "ring-offset-[#111827]");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-blue-500", "ring-offset-2", "ring-offset-[#111827]");
      }, 2000);
    }
  };

  if (!selectedContact) {
    return (
      <div className="w-full md:w-2/3 flex flex-col items-center justify-center h-full text-gray-400">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Send size={40} className="text-gray-600" />
        </div>
        <p className="text-lg">Select a contact to start chatting</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-2/3 flex flex-col h-full relative">
      {/* Drop Price Modal */}
      {isDropPriceModalOpen && selectedNoteForDrop && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1F2937] border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-white mb-4">Drop Price</h3>

            <div className="flex items-center space-x-4 mb-6 bg-gray-800 p-3 rounded-lg">
              {selectedNoteForDrop.thumbnailUrl && (
                <img src={selectedNoteForDrop.thumbnailUrl} alt="Note" className="w-16 h-16 object-cover rounded-md" />
              )}
              <div>
                <p className="font-bold text-white truncate max-w-[150px]">{selectedNoteForDrop.title}</p>
                <p className="text-sm text-gray-400">by {authUser.fullName}</p>
                <p className="text-green-400 font-bold mt-1">
                  {selectedNoteForDrop.currency === 'INR' ? '₹' : '$'}{selectedNoteForDrop.price}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">New Price (Discounted)</label>
              <input
                type="number"
                value={dropPriceValue}
                onChange={(e) => setDropPriceValue(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter new price"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDropPriceModalOpen(false)}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDropPriceSubmit}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
              >
                Drop Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal (Lightbox) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <img src={selectedImage} alt="Full Size" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 rounded-full p-2 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {isUserProfileModalOpen && userProfileData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setIsUserProfileModalOpen(false)}>
          <div className="bg-[#1F2937] border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsUserProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-xl mb-4 cursor-pointer" onClick={() => handleProfilePicClick(userProfileData.profilePicture)}>
                {userProfileData.profilePicture ? (
                  <img src={userProfileData.profilePicture} alt={userProfileData.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br from-gray-700 to-gray-800">
                    {userProfileData.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white text-center">{userProfileData.fullName}</h3>
              <p className="text-blue-400 text-sm font-medium mt-1">{userProfileData.college || "University Student"}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {userProfileData.bio || "No bio available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 glass border-b border-white/10 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="md:hidden mr-4 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div
            className="w-10 h-10 rounded-full bg-gray-700 mr-4 overflow-hidden border-2 border-white/20 shadow-md cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => handleProfilePicClick(selectedContact.avatar)}
          >
            {selectedContact.avatar ? (
              <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-gray-700 to-gray-800">
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2
            className="text-xl font-bold text-white tracking-wide cursor-pointer hover:text-blue-400 transition-colors"
            onClick={handleUserNameClick}
          >
            {selectedContact.name}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {isSelectionMode ? (
            <>
              <button
                onClick={deleteSelectedMessages}
                disabled={selectedMessageIds.length === 0}
                className={`p-2 rounded-full transition-all ${selectedMessageIds.length > 0 ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-600 cursor-not-allowed'}`}
                title="Delete Selected"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={selectAllMessages}
                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full transition-all"
                title="Select All"
              >
                {selectedMessageIds.length === messageList.length && messageList.length > 0 ? <Check size={20} /> : <CheckSquare size={20} />}
              </button>
              <button
                onClick={toggleSelectionMode}
                className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-all"
                title="Cancel Selection"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSelectionMode}
              className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-all"
              title="Select Messages"
            >
              <CheckSquare size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {messageList.map((message) => (
          <div
            key={message.id}
            id={`message-${message.id}`}
            onClick={() => isSelectionMode && toggleMessageSelection(message.id)}
            onTouchStart={(e) => !isSelectionMode && handleTouchStart(e, message.id)}
            onTouchMove={(e) => !isSelectionMode && handleTouchMove(e, message.id)}
            onTouchEnd={(e) => !isSelectionMode && handleTouchEnd(e, message)}
            className={`flex items-end mb-4 animate-fade-in group relative ${message.sender === "me" ? "justify-end" : "justify-start"
              } ${isSelectionMode ? "cursor-pointer" : ""}`}
          >
            {isSelectionMode && message.sender !== "me" && (
              <div className={`mr-3 mb-2 w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedMessageIds.includes(message.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                {selectedMessageIds.includes(message.id) && <Check size={14} className="text-white" />}
              </div>
            )}

            {/* Avatar for 'them' */}
            {message.sender !== "me" && (
              <div className="w-8 h-8 rounded-full bg-gray-700 mr-2 flex-shrink-0 overflow-hidden border border-white/10 shadow-sm">
                {selectedContact.avatar ? (
                  <img src={selectedContact.avatar} alt="Sender" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-gray-700 to-gray-800">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}

            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-3xl shadow-md backdrop-blur-sm ${message.sender === "me"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                : "glass border border-white/10 text-white rounded-bl-none"
                } ${isSelectionMode && selectedMessageIds.includes(message.id) ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111827]' : ''}`}
            >
              {/* Replied Message Context */}
              {message.replyTo && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToMessage(message.replyTo._id || message.replyTo.id);
                  }}
                  className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-gray-400 text-xs text-gray-300 cursor-pointer hover:bg-black/30 transition-colors"
                >
                  <p className="font-bold text-blue-300 mb-1">
                    {message.replyTo.senderId === authUser._id ? "You" : selectedContact.name}
                  </p>
                  <p className="truncate">
                    {message.replyTo.messageType === 'offer' ? 'Special Offer' : (message.replyTo.text || "Media")}
                  </p>
                </div>
              )}

              {/* Referenced Note Display in Message */}
              {message.referencedNote && message.messageType !== 'offer' && (
                <div
                  onClick={() => !isSelectionMode && handleNoteClick(message.referencedNote)}
                  className={`mb-2 p-2 bg-black/20 rounded-lg flex items-center space-x-3 border-l-4 border-blue-400 ${!isSelectionMode && authUser._id === message.referencedNote.sellerId ? 'cursor-pointer hover:bg-black/30 transition-colors' : ''}`}
                >
                  {message.referencedNote.thumbnailUrl && (
                    <img src={message.referencedNote.thumbnailUrl} alt="Note" className="w-10 h-10 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-blue-200">{message.referencedNote.title}</p>
                    <p className="text-xs text-gray-300">
                      {message.referencedNote.currency === 'INR' ? '₹' : '$'}
                      {message.referencedNote.discountedPrice || message.referencedNote.price}
                    </p>
                  </div>
                </div>
              )}

              {/* Offer Message Display */}
              {message.messageType === 'offer' && message.referencedNote && (
                <div className="mb-1">
                  <div className="p-3 bg-white/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl animate-bounce">🎉</span>
                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Special Offer</span>
                      </div>
                      <span className="text-xs text-gray-400">{message.time}</span>
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      {message.referencedNote.thumbnailUrl && (
                        <img src={message.referencedNote.thumbnailUrl} alt="Note" className="w-12 h-12 object-cover rounded-md" />
                      )}
                      <div>
                        <p className="font-bold text-sm text-white truncate max-w-[150px]">{message.referencedNote.title}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 line-through">
                            {message.referencedNote.currency === 'INR' ? '₹' : '$'}{message.referencedNote.originalPrice || message.referencedNote.price}
                          </span>
                          <span className="text-sm font-bold text-green-400">
                            {message.referencedNote.currency === 'INR' ? '₹' : '$'}{message.referencedNote.discountedPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Only show 'Accept' button to the buyer (recipient of the offer) */}
                    {message.sender !== "me" && (
                      <button
                        onClick={() => sendMessage("text", { referencedNote: message.referencedNote }, "I accept this offer!")}
                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition-colors"
                      >
                        Accept Offer
                      </button>
                    )}
                  </div>
                </div>
              )}

              {message.text}
              <div className={`text-[10px] mt-1 text-right ${message.sender === "me" ? "text-blue-100/70" : "text-gray-400"}`}>
                {message.time}
              </div>
            </div>

            {/* Desktop Reply Button */}
            {!isSelectionMode && (
              <button
                onClick={() => handleReply(message)}
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-white absolute top-1/2 -translate-y-1/2 ${message.sender === "me" ? "-left-8" : "-right-8"}`}
                title="Reply"
              >
                <Reply size={16} />
              </button>
            )}

            {/* Avatar for 'me' */}
            {message.sender === "me" && (
              <div className="w-8 h-8 rounded-full bg-gray-700 ml-2 flex-shrink-0 overflow-hidden border border-white/10 shadow-sm">
                {authUser.profilePicture ? (
                  <img src={authUser.profilePicture} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-gray-700 to-gray-800">
                    {authUser.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}

            {isSelectionMode && message.sender === "me" && (
              <div className={`ml-3 mb-2 w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedMessageIds.includes(message.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
                {selectedMessageIds.includes(message.id) && <Check size={14} className="text-white" />}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {
        !isSelectionMode && (
          <div className="p-4 glass border-t border-white/10 z-10">
            {/* Referenced Note Preview */}
            {referencedNote && (
              <div className="mb-2 p-2 bg-[#1F2937] rounded-lg flex items-center justify-between border border-gray-700">
                <div className="flex items-center space-x-3">
                  {referencedNote.thumbnailUrl && (
                    <img src={referencedNote.thumbnailUrl} alt="Note" className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">Replying to: {referencedNote.title}</p>
                    <p className="text-xs text-blue-400">
                      {referencedNote.currency === 'INR' ? '₹' : '$'}
                      {referencedNote.discountedPrice || referencedNote.price}
                    </p>
                  </div>
                </div>
                <button onClick={clearReferencedNote} className="text-gray-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Replying To Preview */}
            {replyingTo && (
              <div className="mb-2 p-2 bg-[#1F2937] rounded-lg flex items-center justify-between border border-gray-700 border-l-4 border-l-blue-500">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-bold text-blue-400">
                    Replying to {replyingTo.sender === "me" ? "yourself" : selectedContact.name}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {replyingTo.messageType === 'offer' ? 'Special Offer' : (replyingTo.text || "Media")}
                  </p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white p-1">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={currentMessage}
                onChange={(event) => {
                  setCurrentMessage(event.target.value);
                }}
                onKeyPress={(event) => {
                  event.key === "Enter" && sendMessage();
                }}
                placeholder="Type your message..."
                className="w-full bg-black/20 border border-white/10 rounded-full py-3 pl-5 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all backdrop-blur-sm"
              />
              <button
                onClick={() => sendMessage("text")}
                className="absolute inset-y-0 right-1 flex items-center justify-center w-12 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )
      }
      {
        isSelectionMode && (
          <div className="p-4 glass border-t border-white/10 flex justify-between items-center text-gray-300 z-10">
            <span>{selectedMessageIds.length} selected</span>
            <button onClick={deleteSelectedMessages} disabled={selectedMessageIds.length === 0} className="text-red-400 hover:text-red-300 disabled:text-gray-600 transition-colors">Delete Selected</button>
          </div>
        )
      }
    </div >
  );
};

export default Conversation;
