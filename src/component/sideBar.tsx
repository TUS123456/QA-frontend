import React, { useRef, useState } from "react";
import {
  Box,
  VStack,
  Button,
  Divider,
  Heading,
  IconButton,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, AttachmentIcon } from "@chakra-ui/icons";

export type DocumentItem = {
  id: string;
  originalName: string;
  storedName: string;
  uploadedAt?: string;
};

interface SidebarProps {
  documents: DocumentItem[];
  docId: string;
  setDocId: (id: string) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  uploadPdf: () => void;
  loading: boolean;
  deleteDocument: (id: string) => void;
  docLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  docId,
  setDocId,
  pdfFile,
  setPdfFile,
  uploadPdf,
  loading,
  deleteDocument,
  docLoading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>("");

  const handleDeleteClick = (id: string) => {
    setSelectedDocId(id);
    onOpen();
  };

  const confirmDelete = () => {
    deleteDocument(selectedDocId);
    onClose();
  };

  return (
    <Box
      bg="white"
      shadow="md"
      w={{ base: "full", md: "280px" }}
      minH="80vh"
      p={4}
      rounded="lg"
    >
      <Heading size="md" mb={4} color="purple.700">
        Documents
      </Heading>

      {docLoading ? (
        <Box textAlign="center" py={6}>
          <Spinner color="purple.500" />
        </Box>
      ) : (
        <VStack align="stretch" spacing={2} mb={4}>
          {documents.map((doc) => (
            <Box
              key={doc.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bg={doc.id === docId ? "purple.100" : "gray.50"}
              px={3}
              py={1}
              rounded="md"
              cursor="pointer"
              _hover={{ bg: "purple.50" }}
              onClick={() => setDocId(doc.id)}
            >
              <span className="truncate">{doc.originalName}</span>
              <IconButton
                aria-label="Delete document"
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(doc.id);
                }}
              />
            </Box>
          ))}
        </VStack>
      )}

      <Divider mb={4} />

      {/* Upload PDF */}
      <label>
        <Button
          as="span"
          leftIcon={<AddIcon />}
          colorScheme="purple"
          size="sm"
          w="full"
          mb={2}
        >
          Choose PDF
        </Button>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files?.length) setPdfFile(e.target.files[0]);
          }}
          style={{ display: "none" }}
        />
      </label>

      <Button
        onClick={uploadPdf}
        isDisabled={!pdfFile}
        isLoading={loading}
        colorScheme="purple"
        size="sm"
        w="full"
      >
        Upload
      </Button>

      {/* Delete confirmation dialog */}
      {isOpen && (
        <div>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <Box p={4} bg="white" rounded="md" shadow="md">
              <Heading size="sm" mb={2}>
                Delete Document
              </Heading>
              <p>Are you sure you want to delete this document?</p>
              <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDelete}>
                  Delete
                </Button>
              </Box>
            </Box>
          </div>
        </div>
      )}
    </Box>
  );
};

export default Sidebar;
