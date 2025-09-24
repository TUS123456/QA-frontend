import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAuth } from "../state/AuthContext";
import { api } from "../lib/api";
import {
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Input,
  Textarea,
  IconButton,
  HStack,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowForwardIcon,
  DeleteIcon,
  SearchIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
} from "@chakra-ui/icons";
import axios from "axios";
import Sidebar from "../component/sideBar";

// Define the ChatMessage type
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  isEditing?: boolean;
};

type DocumentItem = {
  id: string;
  originalName: string;
  storedName: string;
  uploadedAt?: string;
};

// function useChatStorage(conversationId: string) {
//   const key = `chat_${conversationId}`;
//   const read = useCallback((): ChatMessage[] => {
//     try {
//       const raw = localStorage.getItem(key);
//       return raw ? JSON.parse(raw) : [];
//     } catch {
//       return [];
//     }
//   }, [key]);

//   const write = useCallback(
//     (messages: ChatMessage[]) => {
//       localStorage.setItem(key, JSON.stringify(messages));
//     },
//     [key]
//   );

//   return { read, write };
// }

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Extracted MessageItem component
const MessageItem = ({
  message,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(message.isEditing || false);
  const [editContent, setEditContent] = useState(message.content);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleSaveEdit = () => {
    onEdit(message.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
      >
        <div className="font-medium mb-1 flex items-center justify-between">
          <span>{isUser ? "You" : "Assistant"}</span>
          {isUser && (
            <HStack spacing={1}>
              <IconButton
                aria-label="Edit message"
                icon={<EditIcon />}
                size="xs"
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={() => setIsEditing(true)}
              />
              <IconButton
                aria-label="Delete message"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={onOpen}
              />
            </HStack>
          )}
        </div>

        {isEditing ? (
          <VStack spacing={2} align="stretch">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              bg="transparent"
              border="1px solid"
              borderColor="whiteAlpha.300"
              rounded="md"
              p={2}
              color="white"
              _placeholder={{ color: "gray.300" }}
              rows={3}
              autoFocus
            />
            <HStack spacing={2}>
              <Button
                leftIcon={<CheckIcon />}
                size="xs"
                colorScheme="whiteAlpha"
                onClick={handleSaveEdit}
              >
                Save
              </Button>
              <Button
                leftIcon={<CloseIcon />}
                size="xs"
                colorScheme="whiteAlpha"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}

        <div className="text-xs opacity-70 mt-1">
          {new Date(message.ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Message
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  onDelete(message.id);
                  onClose();
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

// Extracted DocumentSelector component
// const DocumentSelector = ({
//   documents,
//   docId,
//   setDocId,
//   pdfFile,
//   setPdfFile,
//   uploadPdf,
//   loading,
//   deleteDocument,
// }: {
//   documents: DocumentItem[];
//   docId: string;
//   setDocId: (id: string) => void;
//   pdfFile: File | null;
//   setPdfFile: (file: File | null) => void;
//   uploadPdf: () => void;
//   loading: boolean;
//   deleteDocument: (id: string) => void;
// }) => {
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [selectedDocId, setSelectedDocId] = useState<string>("");
//   const cancelRef = useRef<HTMLButtonElement>(null);

//   const handleDeleteClick = (id: string) => {
//     setSelectedDocId(id);
//     onOpen();
//   };

//   const confirmDelete = () => {
//     deleteDocument(selectedDocId);
//     onClose();
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-md p-4 mb-6">
//       <h2 className="text-lg font-semibold text-gray-800 mb-3">
//         Select Document
//       </h2>
//       <div className="flex flex-col sm:flex-row gap-3">
//         <div className="flex-1 relative">
//           <select
//             value={docId}
//             onChange={(e) => setDocId(e.target.value)}
//             className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
//             aria-label="Select a PDF document"
//           >
//             <option value="">Choose a PDF document...</option>
//             {documents.map((doc) => (
//               <option key={doc.id} value={doc.id}>
//                 {doc.originalName}
//               </option>
//             ))}
//           </select>
//           {documents.length > 0 && (
//             <div className="absolute inset-y-0 right-8 flex items-center pr-2 pointer-events-none">
//               <AttachmentIcon color="gray.400" />
//             </div>
//           )}
//           {docId && (
//             <IconButton
//               aria-label="Delete document"
//               icon={<DeleteIcon />}
//               size="sm"
//               variant="ghost"
//               colorScheme="red"
//               position="absolute"
//               right="2"
//               top="50%"
//               transform="translateY(-50%)"
//               onClick={() => handleDeleteClick(docId)}
//             />
//           )}
//         </div>

//         <div className="flex gap-2">
//           <label className="flex-1 cursor-pointer">
//             <div className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
//               <AddIcon className="text-gray-500" />
//               <span className="text-gray-700">Choose PDF</span>
//             </div>
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={(e) => {
//                 if (e.target.files && e.target.files.length > 0)
//                   setPdfFile(e.target.files[0]);
//               }}
//               className="hidden"
//               aria-label="Upload PDF file"
//             />
//           </label>

//           <Button
//             onClick={uploadPdf}
//             isDisabled={!pdfFile}
//             isLoading={loading}
//             colorScheme="purple"
//             className="px-4 py-2 rounded-lg"
//             leftIcon={<AddIcon />}
//           >
//             Upload
//           </Button>
//         </div>
//       </div>

//       {pdfFile && (
//         <div className="mt-3 text-sm text-gray-600 flex items-center">
//           <AttachmentIcon className="h-4 w-4 mr-1 text-indigo-600" />
//           {pdfFile.name}
//         </div>
//       )}

//       <AlertDialog
//         isOpen={isOpen}
//         leastDestructiveRef={cancelRef}
//         onClose={onClose}
//       >
//         <AlertDialogOverlay>
//           <AlertDialogContent>
//             <AlertDialogHeader fontSize="lg" fontWeight="bold">
//               Delete Document
//             </AlertDialogHeader>
//             <AlertDialogBody>
//               Are you sure you want to delete this document? This will also
//               remove all associated chat history.
//             </AlertDialogBody>
//             <AlertDialogFooter>
//               <Button ref={cancelRef} onClick={onClose}>
//                 Cancel
//               </Button>
//               <Button colorScheme="red" onClick={confirmDelete} ml={3}>
//                 Delete
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialogOverlay>
//       </AlertDialog>
//     </div>
//   );
// };

export default function Chat() {
  const { user, token } = useAuth();
  const toast = useToast();
  const conversationId = useMemo(() => user?.id ?? "guest", [user]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docId, setDocId] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!docId) return;
    (async () => {
      try {
        const res = await api.get(`/messages/${conversationId}/${docId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setMessages(res.data); // expects array of ChatMessage from backend
      } catch (err) {
        console.error("Failed to fetch chat messages", err);
      }
    })();
  }, [conversationId, docId, token]);

  const fetchDocuments = useCallback(async () => {
    try {
      setDocLoading(true);
      const res = await api.get<DocumentItem[]>("/documents", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setDocuments(res.data);
    } catch (err: any) {
      toast({
        title: "Failed to fetch documents",
        description:
          err?.response?.data?.detail || err?.message || "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDocLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const send = useCallback(async () => {
    if (!input.trim()) return;

    // ✅ guard if no document selected
    if (!docId) {
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "❗ Please select a PDF or upload one before asking a question.",
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
      return;
    }

    // ✅ add user message locally + backend
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    await axios.post(
      "http://localhost:4000/api/message/store-message",
      {
        user,
        conversationId,
        docId,
        role: "user",
        content: userMsg.content,
        ts: userMsg.ts,
      },
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );

    try {
      setLoading(true);

      // ✅ ask the backend
      const res = await api.post(
        "/ask",
        { question: userMsg.content, docId },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          timeout: 30000,
        }
      );

      console.log("chat Respose======", res);

      // ✅ create bot message now — AFTER we have `res`
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.data.answer ?? "No answer received",
        ts: Date.now(),
      };

      // add to state
      setMessages((m) => [...m, botMsg]);

      // and save to backend
      await api.post(
        "/api/messages/store-message",
        {
          conversationId,
          docId,
          role: botMsg.role,
          content: botMsg.content,
          ts: botMsg.ts,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
    } catch (err: any) {
      // ✅ handle errors cleanly
      const errorMessage =
        err?.response?.data?.detail || err?.message || "Error";
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMessage,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [input, docId, token, toast]);

  const uploadPdf = useCallback(async () => {
    if (!pdfFile) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      const uploadedDocId = res.data.docId;
      setDocId(uploadedDocId);

      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `✅ Uploaded PDF: ${pdfFile.name} (docId: ${uploadedDocId})`,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
      setPdfFile(null);
      setUploadProgress(0);

      await fetchDocuments();

      toast({
        title: "Upload successful",
        description: "Your PDF has been uploaded successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      const errorMessage = `❌ Upload failed: ${err?.message}`;
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMessage,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);

      toast({
        title: "Upload failed",
        description: err?.message || "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [pdfFile, token, fetchDocuments, toast]);

  const deleteDocument = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/documents/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // Remove from documents list
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));

        // Clear docId if it's the deleted document
        if (docId === id) {
          setDocId("");
        }

        // Clear messages related to this document
        setMessages([]);

        toast({
          title: "Document deleted",
          description: "The document has been deleted successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } catch (err: any) {
        toast({
          title: "Delete failed",
          description:
            err?.response?.data?.detail || err?.message || "Unknown error",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [token, docId, toast]
  );

  const editMessage = useCallback(
    (id: string, content: string) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
      );

      api.patch(
        `/messages/${id}`,
        { content },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
    },
    [token]
  );

  const deleteMessage = useCallback(
    (id: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      // ⬇️ Tell backend
      api.delete(`/messages/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    [token]
  );

  const filteredMessages = useMemo(() => {
    if (!debouncedSearchTerm) return messages;

    const term = debouncedSearchTerm.toLowerCase();
    return messages.filter((msg) => msg.content.toLowerCase().includes(term));
  }, [messages, debouncedSearchTerm]);

  const clearChat = useCallback(() => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been cleared",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const exportChat = useCallback(() => {
    const chatData = {
      conversationId,
      document: documents.find((doc) => doc.id === docId),
      messages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat exported",
      description: "Your chat has been exported successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [conversationId, documents, docId, messages, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto flex gap-10">
        {/* Sidebar */}
        <Sidebar
          documents={documents}
          docId={docId}
          setDocId={setDocId}
          pdfFile={pdfFile}
          setPdfFile={setPdfFile}
          uploadPdf={uploadPdf}
          loading={loading}
          deleteDocument={deleteDocument}
          docLoading={docLoading} // <- pass this
        />

        {/* Chat section */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Chat header */}
          <header className="mb-2 text-center">
            <h1 className="text-3xl font-bold text-indigo-800 mb-1">
              Document Chat
            </h1>
            <p className="text-gray-600">
              Upload a PDF and ask questions about its content
            </p>
          </header>

          {/* Chat controls */}
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-3 justify-between items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl={10}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={clearChat}
                size="sm"
                variant="outline"
                colorScheme="gray"
              >
                Clear Chat
              </Button>
              <Button
                onClick={exportChat}
                size="sm"
                variant="outline"
                colorScheme="blue"
              >
                Export Chat
              </Button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-[70vh]">
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50">
              {filteredMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="text-5xl mb-4 text-indigo-200">💬</div>
                  <p className="text-lg mb-2">
                    {searchTerm
                      ? "No messages match your search"
                      : "No messages yet"}
                  </p>
                  <p className="text-center max-w-md">
                    {searchTerm
                      ? "Try a different search term"
                      : "Select a document or upload a PDF to start asking questions"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((m) => (
                    <MessageItem
                      key={m.id}
                      message={m}
                      onEdit={editMessage}
                      onDelete={deleteMessage}
                    />
                  ))}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 p-4 bg-white">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    Uploading: {uploadProgress}%
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Textarea
                  className="flex-1"
                  placeholder="Type your question here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  resize="none"
                  rows={1}
                />
                <Button
                  onClick={send}
                  isDisabled={!input.trim()}
                  isLoading={loading}
                  colorScheme="indigo"
                  className="px-6 rounded-lg self-end"
                  leftIcon={<ArrowForwardIcon />}
                >
                  Send
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
