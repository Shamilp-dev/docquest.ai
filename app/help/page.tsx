'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

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
        a: "Yes! You can search using natural language or specific keywords. The AI understands both."
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
      }
    ]
  }
];

export default function HelpPage() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-white/90 mb-8">Find answers to common questions</p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto border-2 border-white rounded-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 " />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-white/60 focus:ring-2 focus:ring-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {filteredFaqs.map((category, catIdx) => (
          <div key={catIdx} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
            <div className="space-y-2">
              {category.questions.map((item, qIdx) => {
                const id = `${catIdx}-${qIdx}`;
                const isOpen = openItems.has(id);

                return (
                  <div key={qIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 text-left">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-gray-700">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 text-center border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to help you</p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}