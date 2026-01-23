import React from 'react';
import { Trash2 } from 'lucide-react';

const ContactList = ({ contacts, selectedContact, onSelectContact, onDeleteContact, onClearAllContacts }) => {
  return (
    <div className={`w-full md:w-1/3 glass-dark border-r border-white/10 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
        <h2 className="text-xl font-bold text-white tracking-wide">Chats</h2>
        {contacts.length > 0 && (
          <button
            onClick={onClearAllContacts}
            className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full"
            title="Clear All Chats"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map(contact => (
          <div
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-200 group border-b border-white/5 ${selectedContact && selectedContact.id === contact.id
                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-l-4 border-l-blue-500'
                : 'hover:bg-white/5 border-l-4 border-l-transparent'
              }`}
          >
            <div className="flex items-center overflow-hidden">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-700 mr-4 flex-shrink-0 overflow-hidden border-2 border-white/10 shadow-md">
                {contact.avatar ? (
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-gray-700 to-gray-800">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate">{contact.name}</h3>
                <p className={`text-sm truncate ${contact.unreadCount > 0 ? 'text-blue-300 font-medium' : 'text-gray-400'}`}>
                  {contact.lastMessage}
                </p>
              </div>
            </div>

            {contact.unreadCount > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center mr-2 shadow-lg animate-pulse">
                {contact.unreadCount}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete the chat with ${contact.name}?`)) {
                  onDeleteContact(contact.id);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-full"
              title="Delete Chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;


