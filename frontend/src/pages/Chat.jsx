import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import ContactList from "../components/chat/ContactList";
import Conversation from "../components/chat/Conversation";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const socket = io.connect(import.meta.env.VITE_API_BASE_URL);

const Chat = () => {
  const location = useLocation();
  const { authUser, token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [isContactsLoaded, setIsContactsLoaded] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [referencedNote, setReferencedNote] = useState(null);

  // Load contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      if (!authUser || !token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          if (data.length > 0) {
            setContacts(data);
          } else {
            // Add a dummy contact if none exist
            setContacts([
              {
                id: "dummy_support",
                name: "Notesverse Support",
                lastMessage: "Hello! How can we help you today?",
                avatar: "https://ui-avatars.com/api/?name=Notesverse+Support&background=3b82f6&color=fff",
                unreadCount: 1,
                isDummy: true
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      } finally {
        setIsContactsLoaded(true);
      }
    };

    fetchContacts();

    // Join socket room
    const joinRoom = () => {
      if (authUser) {
        socket.emit("join_room", { userId: authUser._id, userName: authUser.fullName });
      }
    };

    joinRoom();

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [authUser, token]);

  // Handle incoming messages globally for notifications/unread counts
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // If the message is from me (shouldn't happen via receive_message usually, but just in case)
      if (data.senderId === authUser?._id) return;

      setContacts((prevContacts) => {
        const contactExists = prevContacts.find(c => String(c.id) === String(data.senderId));

        if (contactExists) {
          return prevContacts.map((contact) => {
            if (String(contact.id) === String(data.senderId)) {
              const isSelected = selectedContact && String(selectedContact.id) === String(contact.id);
              return {
                ...contact,
                lastMessage: data.messageType === 'offer' ? 'Sent an offer' : (data.text || 'Sent a message'),
                avatar: data.senderProfilePicture || contact.avatar,
                unreadCount: isSelected ? 0 : (contact.unreadCount || 0) + 1,
              };
            }
            return contact;
          });
        } else {
          // Add new contact if it doesn't exist
          const newContact = {
            id: data.senderId,
            name: data.senderName || "Unknown User",
            lastMessage: data.messageType === 'offer' ? 'Sent an offer' : (data.text || 'Sent a message'),
            avatar: data.senderProfilePicture || "",
            unreadCount: 1,
          };
          return [newContact, ...prevContacts];
        }
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [authUser, selectedContact]);

  useEffect(() => {
    if (isContactsLoaded && location.state && location.state.sellerId) {
      const newContact = {
        id: String(location.state.sellerId),
        name: location.state.sellerName,
        lastMessage: "Start a conversation...",
        avatar: location.state.sellerProfilePicture || "",
        unreadCount: 0,
      };

      setContacts((prevContacts) => {
        const exists = prevContacts.find((c) => String(c.id) === newContact.id);
        if (exists) {
          return prevContacts.map(c =>
            String(c.id) === newContact.id
              ? { ...c, avatar: newContact.avatar || c.avatar }
              : c
          );
        }
        return [newContact, ...prevContacts];
      });

      setSelectedContact(newContact);

      // Set referenced note if available
      if (location.state.noteId) {
        setReferencedNote({
          noteId: location.state.noteId,
          title: location.state.noteTitle,
          thumbnailUrl: location.state.noteThumbnail,
          price: location.state.notePrice,
          currency: location.state.noteCurrency,
          subject: location.state.noteSubject,
          sellerId: location.state.sellerId,
        });
      }
    }
  }, [location.state, isContactsLoaded]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setReferencedNote(null); // Clear referenced note when switching contacts manually
    // Reset unread count for this contact
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleDeleteContact = async (contactId) => {
    // Optimistic update
    setContacts(contacts.filter(c => c.id !== contactId));
    if (selectedContact && selectedContact.id === contactId) {
      setSelectedContact(null);
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations/${contactId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Optionally revert state here if needed, but for now we'll assume success or user will refresh
    }
  };

  const handleClearAllContacts = () => {
    if (window.confirm("Are you sure you want to delete all chats?")) {
      setContacts([]);
      setSelectedContact(null);
      // TODO: Call API to delete all conversations
    }
  };

  const handleMessageSent = (message) => {
    setContacts((prevContacts) => {
      const contactId = message.recipientId;
      const contactExists = prevContacts.find(c => String(c.id) === String(contactId));

      if (contactExists) {
        return prevContacts.map(c =>
          String(c.id) === String(contactId)
            ? { ...c, lastMessage: message.messageType === 'offer' ? 'Sent an offer' : message.text }
            : c
        );
      }
      return prevContacts;
    });
  };

  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] flex relative">
      {!isConnected && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center text-xs py-1 z-50">
          Disconnected from chat server. Reconnecting...
        </div>
      )}
      <Sidebar />
      <main className="flex-1 flex pt-16 md:pt-0" style={{ height: "100vh" }}>
        <ContactList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleSelectContact}
          onDeleteContact={handleDeleteContact}
          onClearAllContacts={handleClearAllContacts}
        />
        <Conversation
          selectedContact={selectedContact}
          socket={socket}
          onBack={() => {
            setSelectedContact(null);
            // Clear location state to prevent re-selecting on re-render
            window.history.replaceState({}, document.title);
          }}
          referencedNote={referencedNote}
          clearReferencedNote={() => setReferencedNote(null)}
          onMessageSent={handleMessageSent}
        />
      </main>
    </div>
  );
};

export default Chat;
