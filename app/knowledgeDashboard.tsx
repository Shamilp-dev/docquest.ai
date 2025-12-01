"use client";
import type { LucideIcon } from "lucide-react";
import ChatModal from "./components/ChatModal";
import HelpModal from "./components/HelpModal";
import SettingsModal from "./components/SettingsModal";
import MarkdownAnswer from "./components/MarkdownAnswer";
import React, { useState, useEffect, useRef } from "react";
import UploadSidebar from "./components/UploadSidebar";
import {
  Search,
  Upload,
  Plus,
  Filter,
  List,
  Grid,
  MoreVertical,
  Clock,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  TrendingUp,
  Settings,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Bell,
  Database,
  Zap,
  Activity,
  BarChart3,
  Calendar,
  Hash,
  Eye,
  Tag,
  ExternalLink,
  Sparkles,
  FileSearch,
  Moon,
  Sun,
  Menu,
  X,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Loader2,
  LogOut,
  Copy,
  Check,
} from "lucide-react";

type FileItem = {
  _id?: string;
  id?: number;
  filename?: string;
  name?: string;
  owner?: string;
  size?: number | string;
  date?: string;
  createdAt?: string | Date;
  deletedAt?: string | Date;
  type?: string;
  pages?: number;
  summary?: string;
  tags?: string[];
  extractedText?: string;
  text?: string;
  deleted?: boolean;
};

type Analytics = {
  documentCount: number;
  totalPages: number;
  embeddingsGenerated: number;
  avgResponseTime: number;
  topSearches: Array<{ query: string; count: number }>;
};

type Props = {
  user: { id: string; email: string; username: string; avatar?: string };
};

const KnowledgeDashboard: React.FC<Props> = ({ user }) => {
  const [viewMode, setViewMode] = useState("list");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [dbFiles, setDbFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [mongoConfigured, setMongoConfigured] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  //chatmodal
  const [showChat, setShowChat] = useState(false);
  //right sidebar
  // Add these NEW state variables for upload panel
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [chosenFile, setChosenFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null as any);

  const [notificationCount, setNotificationCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [deletedFiles, setDeletedFiles] = useState<FileItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    documentCount: 0,
    totalPages: 0,
    embeddingsGenerated: 0,
    avgResponseTime: 0,
    topSearches: [],
  });
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userAvatar, setUserAvatar] = useState(user.avatar || "");
  const [userName, setUserName] = useState(user.username);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  // Sync avatar when user prop changes
  useEffect(() => {
    if (user.avatar && user.avatar !== userAvatar) {
      setUserAvatar(user.avatar);
    }
    if (user.username && user.username !== userName) {
      setUserName(user.username);
    }
  }, [user.avatar, user.username]);

  const getRealId = (file: FileItem): string => {
    if (!file) return "";
    if (typeof file._id === "string") return file._id;
    if (
      typeof file._id === "object" &&
      file._id !== null &&
      "$oid" in file._id
    ) {
      return (file._id as { $oid: string }).$oid;
    }
    if (file.id) return file.id.toString();
    return "";
  };

  const handleProfileUpdate = (updatedUser: { username: string; avatar: string }) => {
    setUserName(updatedUser.username);
    setUserAvatar(updatedUser.avatar);
  };

  type MenuItem = { name: string; icon: LucideIcon };

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: Grid },
    { name: "Recent files", icon: Clock },
    { name: "Documents", icon: FileText },
    { name: "Image", icon: Image },
    { name: "Deleted files", icon: Trash2 },
  ];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);
  const [showSingleDeleteConfirm, setShowSingleDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [showFileMenu, setShowFileMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress("Uploading file...");
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    // Set uploading state IMMEDIATELY
    setIsUploading(true);
    setUploadFile(file);
    setUploadProgress("Uploading file...");

    // Wrapper function with timeout protection
    const handleUploadWithTimeout = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 110000); // 110 second timeout

      try {
        const formData = new FormData();
        formData.append("file", file);

        // For images, add special message about OCR processing
        if (file.type.startsWith("image/")) {
          setUploadProgress(
            "Processing image with OCR... This may take up to 60 seconds"
          );
        }

        const uploadPromise = fetch("/api/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        // Race between upload and 2-minute timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Upload timeout after 2 minutes")),
            120000
          )
        );

        const upload = (await Promise.race([
          uploadPromise,
          timeoutPromise,
        ])) as Response;
        clearTimeout(timeoutId);

        if (!upload.ok) {
          const errorText = await upload.text();
          console.error("Upload failed:", upload.status, errorText);
          throw new Error(`Upload failed: ${upload.status} ${errorText}`);
        }

        const result = await upload.json();
        console.log("UPLOAD SUCCESS:", result);

        // First hide the loading interface
        setIsUploading(false);
        setUploadProgress("");

        // Then show success popup immediately
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 2500);

        // Refresh data
        fetchFiles();
        fetchAnalytics();

        // Reset upload panel state
        setChosenFile(null);
        setShowUploadPanel(false);
      } finally {
        // Final cleanup
        setUploadFile(null);
        clearTimeout(timeoutId);
      }
    };

    try {
      await handleUploadWithTimeout();
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        "Upload failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      // Reset state on error
      setIsUploading(false);
      setUploadFile(null);
      setUploadProgress("");
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) {
        const errorData = await res.json();
        if (
          res.status === 503 &&
          errorData.error === "MongoDB not configured"
        ) {
          setMongoConfigured(false);
          setDbFiles([]);
          setLoadingFiles(false);
          return;
        }
        console.error("MongoDB error:", errorData);
        setMongoConfigured(false);
        setDbFiles([]);
        setLoadingFiles(false);
        return;
      }
      const data = await res.json();
      setDbFiles(data.documents || []);
      setMongoConfigured(true);
    } catch (error) {
      console.error("Error loading documents:", error);
      setMongoConfigured(false);
      setDbFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchDeletedFiles = async () => {
    try {
      const res = await fetch("/api/documents/deleted");
      if (res.ok) {
        const data = await res.json();
        setDeletedFiles(data.documents || []);
      }
    } catch (error) {
      console.error("Error loading deleted files:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  useEffect(() => {
    const fetchNotifs = async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotificationCount(data.unreadCount || 0);
        if (data.messages) {
          setNotifications(data.messages);
        }
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchDeletedFiles();
    fetchAnalytics();
  }, []);

  const askQuestion = async (query: string) => {
    if (!query.trim()) {
      setQaAnswer(null);
      return;
    }

    setIsAnswering(true);
    setQaAnswer(null);
    setCopiedAnswer(false); // Reset copy state
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get answer");
      }

      const data = await res.json();
      setQaAnswer(data.answer || "No answer found.");
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      }

      // Refresh analytics after search
      fetchAnalytics();
    } catch (error) {
      console.error("QA error:", error);
      setQaAnswer(
        "Error: " +
          (error instanceof Error ? error.message : "Failed to get answer")
      );
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!qaAnswer) return;
    
    try {
      await navigator.clipboard.writeText(qaAnswer);
      setCopiedAnswer(true);
      setTimeout(() => setCopiedAnswer(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDeleteSingleFile = async (fileId: string) => {
    setShowFileMenu(null);
    setMenuPosition(null);
    setFileToDelete(fileId);
    setShowSingleDeleteConfirm(true);
  };

  const confirmDeleteSingleFile = async () => {
    if (!fileToDelete) return;
    setShowSingleDeleteConfirm(false);

    try {
      const response = await fetch(`/api/documents/${fileToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file ${fileToDelete}`);
      }

      await fetchFiles();
      await fetchDeletedFiles();
      setFileToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        "Failed to delete file: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      setFileToDelete(null);
    }
  };

  const handleRestoreSingleFile = async (fileId: string) => {
    setShowFileMenu(null);

    try {
      const response = await fetch(`/api/documents/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });

      if (!response.ok) {
        throw new Error(`Failed to restore file ${fileId}`);
      }

      await fetchFiles();
      await fetchDeletedFiles();
    } catch (error) {
      console.error("Restore error:", error);
      alert(
        "Failed to restore file: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSelected = async () => {
    setShowDeleteConfirm(false);

    try {
      for (const fileId of selectedFiles) {
        const response = await fetch(`/api/documents/${fileId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete file ${fileId}`);
        }
      }

      setSelectedFiles(new Set());
      await fetchFiles();
      await fetchDeletedFiles();
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        "Failed to delete files: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleRestoreSelected = async () => {
    if (selectedFiles.size === 0) return;

    try {
      for (const fileId of selectedFiles) {
        const response = await fetch(`/api/documents/${fileId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore" }),
        });

        if (!response.ok) {
          throw new Error(`Failed to restore file ${fileId}`);
        }
      }

      setSelectedFiles(new Set());
      await fetchFiles();
      await fetchDeletedFiles();
    } catch (error) {
      console.error("Restore error:", error);
      alert(
        "Failed to restore files: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleEmptyTrash = async () => {
    setShowEmptyTrashConfirm(true);
  };

  const confirmEmptyTrash = async () => {
    setShowEmptyTrashConfirm(false);

    try {
      const response = await fetch("/api/documents/deleted", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to empty trash");
      }

      await fetchDeletedFiles();
      setSelectedFiles(new Set());
    } catch (error) {
      console.error("Empty trash error:", error);
      alert("Failed to empty trash");
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const getFilteredFiles = () => {
    switch (activeMenuItem) {
      case "Recent files":
        return [...dbFiles]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10);

      case "Documents":
        return dbFiles.filter((f) => {
          const type = (f.type || "").toLowerCase();
          return ["pdf", "doc", "docx", "txt"].includes(type);
        });

      case "Image":
        return dbFiles.filter((f) => {
          const type = (f.type || "").toLowerCase();
          return ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(type);
        });

      case "Deleted files":
        return deletedFiles;

      default:
        return dbFiles;
    }
  };

  const displayFiles = getFilteredFiles();

  const searchInsights = [
    {
      label: "Indexed Documents",
      value: (analytics.documentCount || 0).toLocaleString(),
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Total Pages",
      value: (analytics.totalPages || 0).toLocaleString(),
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Embeddings Generated",
      value: (analytics.embeddingsGenerated || 0).toLocaleString(),
      icon: Sparkles,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Avg Response Time",
      value:
        analytics.avgResponseTime > 0
          ? `${analytics.avgResponseTime.toFixed(2)}s`
          : "0s",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  <style jsx global>{`
    @font-face {
      font-family: "Ruigslay";
      src: url("/fonts/ruigslay.regular.otf") format("opentype");
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
  `}</style>;

  return (
    <div className={darkMode ? "dark" : ""}>
      <style>{`
        .dark { color-scheme: dark; }
        .dark .bg-gray-50 { background-color: rgb(17 24 39); }
        .dark .bg-white { background-color: rgb(31 41 55); }
        .dark .bg-gray-100 { background-color: rgb(55 65 81); }
        .dark .text-gray-900 { color: rgb(243 244 246); }
        .dark .text-gray-600 { color: rgb(156 163 175); }
        .dark .text-gray-700 { color: rgb(209 213 219); }
        .dark .text-gray-800 { color: rgb(229 231 235); }
        .dark .text-gray-500 { color: rgb(107 114 128); }
        .dark .border-gray-200 { border-color: rgb(55 65 81); }
        .dark .border-gray-300 { border-color: rgb(75 85 99); }
        .dark input { color: rgb(243 244 246); background-color: rgb(31 41 55); }
        .dark .bg-purple-50 { background-color: rgb(76 29 149); }
        .dark .bg-wite { background-color: rgb(30 58 138); }
        .dark .bg-wite { background-color: rgb(67 56 202); }
        .dark .bg-green-50 { background-color: rgb(20 83 45); }
        .dark .bg-emerald-50 { background-color: rgb(6 78 59); }
        .dark .text-purple-900 { color: rgb(243 232 255); }
        .dark .border-purple-200 { border-color: rgb(107 33 168); }
        .dark .border-purple-100 { border-color: rgb(88 28 135); }
        .dark .border-green-100 { border-color: rgb(34 197 94); }
        .dark .hover\\:bg-gray-50:hover { background-color: rgb(55 65 81); }
        .dark .hover\\:bg-gray-100:hover { background-color: rgb(75 85 99); }
        .dark .sidebar-dark button:not(.active-menu-item),
        .dark .sidebar-dark button:not(.active-menu-item) * {
          color: rgb(243 244 246) !important;
        }
        .dark .sidebar-dark .active-menu-item,
        .dark .sidebar-dark .active-menu-item * {
          color: white !important;
        }
        .dark .sidebar-dark button:hover {
          background-color: rgb(55 65 81) !important;
        }
        .dark .animated-border {
          background: rgb(31 41 55);
        }
        
        @media (max-width: 768px) {
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        @keyframes thinking-dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }
        .thinking-animation::after {
          content: '';
          animation: thinking-dots 1.5s infinite;
        }
        
        @keyframes border-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animated-border {
          position: relative;
          background: white;
        }
        
        .animated-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          padding: 2px;
          background: linear-gradient(90deg, #f61f35ff, #3b82f6, #ffffffff, #a855f7);
          background-size: 300% 300%;
          animation: border-flow 3s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        
        .animated-border-focus::before {
          background: linear-gradient(90deg, #a855f7, #3b82f6, #ec4899, #8b5cf6, #a855f7);
          background-size: 400% 400%;
          animation: border-flow 2s ease infinite;
        }
      `}</style>

      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Upload Loading Overlay */}
        {isUploading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-lg">
            <div className="bg-white backdrop-blur-2xl rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[300px] border-2 border-purple-500">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <p className="text-lg font-semibold text-gray-900">
                {uploadProgress || "Processing file..."}
              </p>
              <p className="text-sm text-gray-600 text-center">
                Extracting text and generating embeddings
              </p>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-lg">
            <div className="bg-white backdrop-blur-2xl rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 border-2 border-green-500 min-w-[300px]">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-xl font-semibold text-green-700">Success!</p>
              <p className="text-base font-normal text-gray-700 text-center">
                Document uploaded successfully!
              </p>
            </div>
          </div>
        )}

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0  bg-black/10 backdrop-blur-lg z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          sidebar-dark
          ${sidebarCollapsed && !mobileSidebarOpen ? "w-20" : "w-64"} 
          bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ease-in-out flex-shrink-0
          fixed lg:relative inset-y-0 left-0 z-50 px-1
          ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="p-3.5 border-b border-gray-200 flex items-center justify-between">
            <div className={`flex items-center gap-2 transition-opacity duration-300 ${
              !sidebarCollapsed || mobileSidebarOpen ? "opacity-100" : "opacity-0"
            }`}>
              {!sidebarCollapsed || mobileSidebarOpen ? (
                <>
                  <div className="w-10 h-10 p-1 rounded-xl">
                    <img
                      src="/docquest-folder.png"
                      alt="DocQuest Logo"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                  <span className="font-semibold text-gray-900 text-lg whitespace-nowrap">
                    docQuest.ai
                  </span>
                </>
              ) : null}
            </div>
            {sidebarCollapsed && !mobileSidebarOpen ? (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (mobileSidebarOpen) {
                    setMobileSidebarOpen(false);
                    setSidebarCollapsed(true); // Reset to collapsed state when closing mobile sidebar
                  } else {
                    setSidebarCollapsed(true);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600 lg:hidden" />
                <Menu className="w-5 h-5 text-gray-600 hidden lg:block" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden py-4 hide-scrollbar">
            <div className={`px-7 mb-3 transition-opacity duration-300 ${
              (!sidebarCollapsed || mobileSidebarOpen) ? "opacity-100" : "opacity-0 h-0"
            }`}>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menu
                </span>
              )}
            </div>
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMenuItem(item.name)}
                className={`w-full flex items-center gap-3 rounded-lg transition-all duration-300 cursor-pointer
    ${sidebarCollapsed && !mobileSidebarOpen ? "justify-center px-0 mx-0 py-2.5" : "px-4 py-2.5 mx-2"}
    ${
      activeMenuItem === item.name
        ? "bg-purple-50 text-purple-700 active-menu-item"
        : "text-gray-600 hover:bg-gray-50"
    }
  `}
                title={sidebarCollapsed && !mobileSidebarOpen ? item.name : ""}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  (!sidebarCollapsed || mobileSidebarOpen) ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"
                }`}>
                  {item.name}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className={`mb-2 transition-opacity duration-300 ${
              (!sidebarCollapsed || mobileSidebarOpen) ? "opacity-100" : "opacity-0 h-0"
            }`}>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other
                </span>
              )}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className={`w-full flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 ${
                sidebarCollapsed && !mobileSidebarOpen ? "justify-center" : ""
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap transition-all duration-300 ${
                (!sidebarCollapsed || mobileSidebarOpen) ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"
              }`}>
                Settings
              </span>
            </button>

            <button
              onClick={() => setShowChat(true)}
              className={`w-full flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 ${
                sidebarCollapsed && !mobileSidebarOpen ? "justify-center" : ""
              }`}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap transition-all duration-300 ${
                (!sidebarCollapsed || mobileSidebarOpen) ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"
              }`}>
                Chat & Support
              </span>
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className={`w-full flex items-center gap-3 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-all duration-300 ${
                sidebarCollapsed && !mobileSidebarOpen ? "justify-center" : ""
              }`}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm whitespace-nowrap transition-all duration-300 ${
                (!sidebarCollapsed || mobileSidebarOpen) ? "opacity-100 max-w-full" : "opacity-0 max-w-0 overflow-hidden"
              }`}>
                Help Center
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0 ">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(true);
                    setSidebarCollapsed(false); // Ensure it's expanded when opening mobile sidebar
                  }}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                <label className="cursor-pointer hidden sm:block">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                  />
                </label>
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowNotifications(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">
                            Notifications
                          </h3>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notif, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setShowNotifications(false);
                                  setShowChat(true);
                                }}
                                className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      New message from Admin
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {notif.text}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(
                                        notif.timestamp
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 cursor-pointer group relative">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden xl:flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {userName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="p-2">
                      <button
                        onClick={() => setShowSettings(true)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar Section */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 px-4 lg:px-8 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-black mb-2">
                  Ask AI Anything About Your Documents
                </h2>
                <p className="text-sm text-gray-600">
                  Powered by advanced AI • Search through{" "}
                  {dbFiles.length.toLocaleString()} documents instantly
                </p>
              </div>

              <div
                className={`relative animated-border ${
                  searchFocused ? "animated-border-focus" : ""
                } rounded-xl`}
              >
                <div className="relative bg-white rounded-xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setSearchFocused(false), 200)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isAnswering) {
                        askQuestion(searchQuery);
                      }
                    }}
                    placeholder="Ask me anything... (e.g., 'What are the Q3 revenue figures?')"
                    className="w-full pl-12 pr-32 py-4 bg-white text-gray-900 text-sm rounded-xl focus:outline-none"
                  />
                  {isAnswering && (
                    <div className="absolute right-24 top-1/2 -translate-y-1/2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => askQuestion(searchQuery)}
                    disabled={!searchQuery.trim() || isAnswering}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {isAnswering ? "Thinking..." : "Ask AI"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="flex h-full">
              {/* Main Content */}
              <div className="flex-1 p-4 lg:p-8 min-w-0 overflow-y-auto">
                {isAnswering && !qaAnswer && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center animate-pulse">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 font-medium thinking-animation">
                            AI is thinking
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Analyzing documents and generating answer...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {qaAnswer && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-purple-900 mb-3">
                            AI Answer
                          </h3>
                          <MarkdownAnswer content={qaAnswer} />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={handleCopyAnswer}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                            title={copiedAnswer ? "Copied!" : "Copy answer"}
                          >
                            {copiedAnswer ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600 hover:text-gray-900" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setQaAnswer(null);
                              setSearchResults([]);
                              setSearchQuery("");
                            }}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                            title="Close"
                          >
                            <X className="w-4 h-4 text-gray-600 hover:text-gray-900" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="mb-8 ">
                    <div className="flex items-center justify-between mb-4 ">
                      <h2 className="text-base font-semibold text-gray-900">
                        {qaAnswer
                          ? "Source Documents"
                          : `Search Results (${searchResults.length})`}
                      </h2>
                      <button
                        onClick={() => {
                          setSearchResults([]);
                          setQaAnswer(null);
                          setSearchQuery("");
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-3">
                      {searchResults.map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-200 cursor-pointer transition-all"
                          onClick={() => setSelectedFile(doc)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {doc.filename}
                              </p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {(
                                  doc.extractedText ||
                                  doc.text ||
                                  ""
                                ).substring(0, 200)}
                                ...
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4  ">
                    <h2 className="text-base font-semibold text-gray-900">
                      {activeMenuItem === "Dashboard"
                        ? `All files (${displayFiles.length})`
                        : `${activeMenuItem} (${displayFiles.length})`}
                    </h2>
                    <div className="flex items-center gap-2">
                      {activeMenuItem === "Deleted files" &&
                        deletedFiles.length > 0 && (
                          <button
                            onClick={handleEmptyTrash}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Empty Trash
                          </button>
                        )}
                      {selectedFiles.size > 0 &&
                        activeMenuItem === "Deleted files" && (
                          <button
                            onClick={handleRestoreSelected}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Restore ({selectedFiles.size})
                          </button>
                        )}
                      {selectedFiles.size > 0 &&
                        activeMenuItem !== "Deleted files" && (
                          <button
                            onClick={handleDeleteSelected}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedFiles.size})
                          </button>
                        )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-auto">
                    {loadingFiles ? (
                      <div className="p-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm text-gray-500">
                          Loading documents...
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left w-12">
                                <input
                                  type="checkbox"
                                  className="rounded"
                                  checked={
                                    selectedFiles.size ===
                                      displayFiles.length &&
                                    displayFiles.length > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      const ids = displayFiles
                                        .map((f) => getRealId(f))
                                        .filter(Boolean);
                                      setSelectedFiles(new Set(ids));
                                    } else {
                                      setSelectedFiles(new Set());
                                    }
                                  }}
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                                Owner
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                                Size
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                                Date
                              </th>
                              <th className="px-4 py-3 w-12"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {!mongoConfigured ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-6 py-8 text-center"
                                >
                                  <p className="text-sm text-amber-600 font-medium">
                                    MongoDB not configured
                                  </p>
                                </td>
                              </tr>
                            ) : displayFiles.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-6 py-12 text-center"
                                >
                                  <p className="text-sm text-gray-500">
                                    {activeMenuItem === "Deleted files"
                                      ? "No deleted files. Deleted files will appear here."
                                      : "No documents found. Upload a file to get started."}
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              displayFiles.map((file, idx) => {
                                const fileId = getRealId(file);
                                const safeKey = fileId || `file-${idx}`;
                                return (
                                  <tr
                                    key={safeKey}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setSelectedFile(file)}
                                  >
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        className="rounded"
                                        checked={selectedFiles.has(fileId)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          toggleFileSelection(fileId);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                          {[
                                            "jpg",
                                            "jpeg",
                                            "png",
                                            "webp",
                                            "gif",
                                          ].includes(file.type || "") ? (
                                            <Image className="w-4 h-4 text-purple-600" />
                                          ) : (
                                            <FileText className="w-4 h-4 text-purple-600" />
                                          )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                                          {file.filename || file.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                      {file.owner || "Unknown"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                      {typeof file.size === "number"
                                        ? Math.round(
                                            (file.size / 1024 / 1024) * 100
                                          ) /
                                            100 +
                                          " MB"
                                        : file.size || "0 MB"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                      {activeMenuItem === "Deleted files" &&
                                      file.deletedAt
                                        ? new Date(
                                            file.deletedAt
                                          ).toLocaleDateString()
                                        : file.createdAt
                                        ? new Date(
                                            file.createdAt
                                          ).toLocaleDateString()
                                        : file.date || "N/A"}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const rect =
                                              e.currentTarget.getBoundingClientRect();
                                            setMenuPosition({
                                              top: rect.bottom + window.scrollY,
                                              left:
                                                rect.left +
                                                window.scrollX -
                                                150, // 150px to align to the right
                                            });
                                            setShowFileMenu(
                                              showFileMenu === fileId
                                                ? null
                                                : fileId
                                            );
                                          }}
                                          className="hover:bg-gray-100 rounded p-1"
                                        >
                                          <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Upload System */}
              <UploadSidebar
                showUploadPanel={showUploadPanel}
                setShowUploadPanel={setShowUploadPanel}
                chosenFile={chosenFile}
                setChosenFile={setChosenFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                fileInputRef={fileInputRef}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                analytics={analytics}
                handleUpload={handleUpload}
                getRealId={getRealId}
              />
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40 drop-shadow-lg">
          {/* Chat Button */}
          <button
            onClick={() => setShowChat(true)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 cursor-pointer"
            title="Chat Support"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Upload Button (Mobile Only) */}
          <label className="lg:hidden w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-110 cursor-pointer">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
            />
            <Upload className="w-6 h-6" />
          </label>
        </div>

        {/* Chat Modal */}
        {showChat && <ChatModal onClose={() => setShowChat(false)} />}

        {/* Help Modal */}
        {showHelp && (
          <HelpModal
            onClose={() => setShowHelp(false)}
            onOpenChat={() => {
              setShowHelp(false);
              setShowChat(true);
            }}
          />
        )}
        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            user={user}
            darkMode={darkMode}
            onClose={() => setShowSettings(false)}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {/* Mobile Insights Modal */}
        {showInsights && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowInsights(false)}
            />
            <div className="absolute left-0 right-0 bottom-0 bg-white shadow-xl overflow-y-auto rounded-t-3xl max-h-[85vh] animate-slide-up">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-6 pt-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Search Insights
                  </h3>
                  <button
                    onClick={() => setShowInsights(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {searchInsights.map((stat, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4">
                      <div
                        className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}
                      >
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-semibold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-black">
                        Indexing Status
                      </h4>
                      <p className="text-xs text-gray-600">
                        All systems operational
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {analytics.topSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Top Searches
                      </h4>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                      {analytics.topSearches.map((search, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 mb-1.5 break-words">
                              {search.query}
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    (search.count /
                                      (analytics.topSearches[0]?.count || 1)) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-gray-500 flex-shrink-0 mt-0.5">
                            {search.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File Menu Dropdown - Rendered outside table to avoid overflow issues */}
        {showFileMenu && menuPosition && (
          <>
            <div
              className="fixed inset-0 z-[50]"
              onClick={(e) => {
                e.stopPropagation();
                setShowFileMenu(null);
                setMenuPosition(null);
              }}
            />
            <div
              className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[51] py-1"
              style={{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {activeMenuItem === "Deleted files" ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestoreSingleFile(showFileMenu);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          "Permanently delete this file? This cannot be undone."
                        )
                      ) {
                        handleDeleteSingleFile(showFileMenu);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Forever
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const file = displayFiles.find(
                        (f) => getRealId(f) === showFileMenu
                      );
                      if (file) setSelectedFile(file);
                      setShowFileMenu(null);
                      setMenuPosition(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (showFileMenu) {
                        window.open(
                          `/api/documents/${showFileMenu}/view`,
                          "_blank"
                        );
                        setShowFileMenu(null);
                        setMenuPosition(null);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Document
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSingleFile(showFileMenu);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Move to Trash
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* Single File Delete Confirmation Modal */}
        {showSingleDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-2xl p-6 max-w-md w-full mx-4`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Move to Trash?
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Are you sure you want to move this file to trash? You can
                    restore it later from the Deleted files section.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSingleDeleteConfirm(false);
                    setFileToDelete(null);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSingleFile}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-2xl p-6 max-w-md w-full mx-4`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Move to Trash?
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Are you sure you want to move {selectedFiles.size} file(s)
                    to trash? You can restore them later from the Deleted files
                    section.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSelected}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty Trash Confirmation Modal */}
        {showEmptyTrashConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-2xl p-6 max-w-md w-full mx-4`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Permanently Delete All Files?
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    This will permanently delete all files in trash. This action
                    cannot be undone and files will be lost forever.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmptyTrashConfirm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEmptyTrash}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-2xl p-6 max-w-md w-full mx-4`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Confirm Logout
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Are you sure you want to log out? You will need to log in
                    again to access your documents.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    handleLogout();
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDashboard;
