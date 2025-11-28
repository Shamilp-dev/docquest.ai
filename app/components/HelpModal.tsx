'use client';

import React, { useState } from 'react';
import { X, Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I upload documents?",
        a: "Click the Upload button in the sidebar or dashboard. You can upload PDF, DOCX, TXT, and image files. Images will be processed with OCR to extract text."
      },
      {
        q: "What file types are supported?",
        a: "We support PDF, DOCX, TXT, JPG, JPEG, PNG, and WEBP files. Maximum file size is 50MB."
      },
      {
        q: "How do I organize my documents?",
        a: "You can create folders to organize your documents. Click 'New Folder' in the sidebar, name it, and then move documents into it by dragging or using the move option."
      }
    ]
  },
  {
    category: "Search & AI",
    questions: [
      {
        q: "How does AI search work?",
        a: "Our AI uses advanced embeddings and semantic search to understand your questions in natural language and find relevant content in your documents."
      },
      {
        q: "Can I search by specific keywords?",
        a: "Yes! You can search using natural language or specific keywords. The AI understands both and will return the most relevant results."
      },
      {
        q: "What is semantic search?",
        a: "Semantic search understands the meaning and context of your query, not just exact keyword matches. It finds conceptually related content even if the exact words don't match."
      }
    ]
  },
  {
    category: "Account Management",
    questions: [
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot password?' on the login page, then answer your security question to reset your password."
      },
      {
        q: "How do I change my username?",
        a: "Go to Settings from the user dropdown or sidebar, then update your username and click Save."
      },
      {
        q: "Is my data secure?",
        a: "Yes! All data is encrypted in transit and at rest. Your documents are stored securely and only you have access to them."
      }
    ]
  },
  {
    category: "Troubleshooting",
    questions: [
      {
        q: "My document failed to upload. What should I do?",
        a: "Check that your file is under 50MB and in a supported format (PDF, DOCX, TXT, JPG, PNG). If the problem persists, try refreshing the page or contact support."
      },
      {
        q: "Search results are not relevant. How can I improve them?",
        a: "Try being more specific in your query, use complete sentences, or include key terms from the document you're looking for."
      },
      {
        q: "The app is slow. What can I do?",
        a: "Clear your browser cache, ensure you have a stable internet connection, and try closing other tabs. If issues persist, contact support."
      }
    ]
  }
];

interface HelpModalProps {
  onClose: () => void;
  onOpenChat?: () => void;
}

export default function HelpModal({ onClose, onOpenChat }: HelpModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newSet = new Set(openItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setOpenItems(newSet);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      searchQuery === '' ||
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Help Center</h2>
            <p className="text-white/90 text-sm mt-1">Find answers to common questions</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-6">
              {filteredFaqs.map((category, catIdx) => (
                <div key={catIdx}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.questions.map((item, qIdx) => {
                      const id = `${catIdx}-${qIdx}`;
                      const isOpen = openItems.has(id);

                      return (
                        <div
                          key={qIdx}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-purple-300 transition-colors"
                        >
                          <button
                            onClick={() => toggleItem(id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900 text-left text-sm">
                              {item.q}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                              <p className="text-gray-700 text-sm leading-relaxed">{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-400 text-sm mt-2">Try different keywords or browse all topics</p>
            </div>
          )}
        </div>

        {/* Footer - Contact Support */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Still need help?</p>
              <p className="text-sm text-gray-600">Our support team is here for you</p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenChat?.();
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Chat Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
