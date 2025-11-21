import { useState, useEffect } from 'react';
import { Upload, FileText, ChevronLeft, Download } from 'lucide-react';
import { api } from './services/api';
import './App.css';

interface Document {
  id: number;
  filename: string;
  date: string;
  status: 'processing' | 'completed';
  bookmarks: Bookmark[];
}

interface Bookmark {
  page: number;
  label: string;
  category: 'medical_radiology' | 'photos' | 'estimate' | 'other';
}

function App() {
  const [currentView, setCurrentView] = useState<'documents' | 'upload' | 'detail'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocId, setCurrentDocId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
  const loadDocuments = async () => {
    try {
      const docs = await api.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };
  loadDocuments();
  }, []);
  


const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
        const newDoc = await api.uploadFile(file);

        const docWithBookmarks: Document = {
            ...newDoc,
            bookmarks: [],
        };

        setDocuments((prev) => [...prev, docWithBookmarks]);
        setCurrentView("documents");
        setIsUploading(false);

        setTimeout(async () => {
            try {
                const result = await api.processDocument(newDoc.id);
                setDocuments((prev) =>
                    prev.map((doc) =>
                        doc.id === newDoc.id
                            ? {
                                  ...doc,
                                  status: "completed",
                                  bookmarks: result.bookmarks,
                              }
                            : doc
                    )
                );
            } catch (error) {
                console.error("Processing failed:", error);
            }
        }, 3000);

        event.target.value = "";
    } catch (error) {
        console.error("Upload failed:", error);
        setIsUploading(false);
        alert("Failed to upload file. Please try again.");
    }
};

  const viewDetails = (docId: number) => {
    setCurrentDocId(docId);
    setCurrentView('detail');
  };

  const currentDoc = documents.find(d => d.id === currentDocId);

  const getCategoryColor = (category: string) => {
    const colors = {
      medical_radiology: 'bg-blue-100 text-blue-700',
      photos: 'bg-purple-100 text-purple-700',
      estimate: 'bg-green-100 text-green-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
      <div className="app">
          <header className="header">
              <h1>BookSmart AI</h1>
          </header>

          <nav className="nav">
              <div
                  className={`nav-item ${
                      currentView === "documents" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("documents")}
              >
                  Documents
              </div>
              <div
                  className={`nav-item ${
                      currentView === "upload" ? "active" : ""
                  }`}
                  onClick={() => setCurrentView("upload")}
              >
                  Upload
              </div>
          </nav>

          <div
              style={{
                  background: "#fff3cd",
                  border: "1px solid #ffc107",
                  padding: "0.75rem 2rem",
                  textAlign: "center",
                  fontSize: "0.9rem",
                  color: "#856404",
              }}
          >
              ⚠️ Demo purposes only. Do not upload confidential documents.
          </div>

          <div className="container">
              {/* Documents View */}
              {currentView === "documents" && (
                  <div className="view">
                      <h2>Documents</h2>
                      <div className="table-container">
                          <table>
                              <thead>
                                  <tr>
                                      <th>Filename</th>
                                      <th>Date Uploaded</th>
                                      <th>Status</th>
                                      <th>Bookmarks</th>
                                      <th>Actions</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {documents.length === 0 ? (
                                      <tr>
                                          <td colSpan={5}>
                                              <div className="empty-state">
                                                  <FileText size={64} />
                                                  <div>
                                                      No documents uploaded yet
                                                  </div>
                                              </div>
                                          </td>
                                      </tr>
                                  ) : (
                                      documents.map((doc) => (
                                          <tr key={doc.id}>
                                              <td>{doc.filename}</td>
                                              <td>{doc.date}</td>
                                              <td>
                                                  <span
                                                      className={`status ${doc.status}`}
                                                  >
                                                      {doc.status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                          doc.status.slice(1)}
                                                  </span>
                                              </td>
                                              <td>
                                                  {doc.status === "completed"
                                                      ? doc.bookmarks.length
                                                      : "—"}
                                              </td>
                                              <td>
                                                  {doc.status ===
                                                  "completed" ? (
                                                      <button
                                                          className="btn btn-secondary"
                                                          onClick={() =>
                                                              viewDetails(
                                                                  doc.id
                                                              )
                                                          }
                                                      >
                                                          View Details
                                                      </button>
                                                  ) : (
                                                      <span
                                                          style={{
                                                              color: "#9aa5b1",
                                                          }}
                                                      >
                                                          Processing...
                                                      </span>
                                                  )}
                                              </td>
                                          </tr>
                                      ))
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Upload View */}
              {currentView === "upload" && (
                  <div className="view">
                      <h2>Upload Document</h2>
                      {isUploading ? (
                          <div
                              style={{
                                  textAlign: "center",
                                  padding: "4rem",
                                  background: "white",
                                  borderRadius: "8px",
                              }}
                          >
                              <div
                                  style={{
                                      fontSize: "3rem",
                                      marginBottom: "1rem",
                                  }}
                              >
                                  ⏳
                              </div>
                              <div
                                  style={{
                                      fontSize: "1.1rem",
                                      color: "#5a6c7d",
                                  }}
                              >
                                  Uploading and analyzing...
                              </div>
                          </div>
                      ) : (
                          <label className="upload-box">
                              <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleFileUpload}
                                  style={{ display: "none" }}
                              />
                              <Upload size={48} />
                              <div className="upload-text">
                                  Drop PDF file here or click to browse
                              </div>
                              <div className="upload-subtext">
                                  Upload any PDF - resumes, reports, papers,
                                  manuals
                              </div>
                          </label>
                      )}
                  </div>
              )}

              {/* Detail View */}
              {currentView === "detail" && currentDoc && (
                  <div className="view">
                      <div
                          className="back-link"
                          onClick={() => setCurrentView("documents")}
                      >
                          <ChevronLeft size={20} />
                          Back to Documents
                      </div>
                      <div className="detail-header">
                          <h2>{currentDoc.filename}</h2>
                          <div className="detail-info">
                              <div className="detail-info-item">
                                  <label>Status</label>
                                  <div>
                                      <span
                                          className={`status ${currentDoc.status}`}
                                      >
                                          {currentDoc.status
                                              .charAt(0)
                                              .toUpperCase() +
                                              currentDoc.status.slice(1)}
                                      </span>
                                  </div>
                              </div>
                              <div className="detail-info-item">
                                  <label>Date Uploaded</label>
                                  <div>{currentDoc.date}</div>
                              </div>
                              <div className="detail-info-item">
                                  <label>Bookmarks Detected</label>
                                  <div>{currentDoc.bookmarks.length}</div>
                              </div>
                          </div>
                          <button
                              className="btn btn-primary"
                              onClick={async () => {
                                  if (currentDoc) {
                                      try {
                                          const url = await api.getDownloadUrl(
                                              currentDoc.id
                                          );
                                          window.open(url, "_blank");
                                      } catch (error) {
                                          console.error(
                                              "Download failed:",
                                              error
                                          );
                                          alert("Failed to download PDF");
                                      }
                                  }
                              }}
                          >
                              <Download
                                  size={16}
                                  style={{ marginRight: "0.5rem" }}
                              />
                              Download Processed PDF
                          </button>
                      </div>

                      <div className="table-container">
                          <table>
                              <thead>
                                  <tr>
                                      <th>Page</th>
                                      <th>Label</th>
                                      <th>Category</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {currentDoc.bookmarks.map((bookmark, idx) => (
                                      <tr key={idx}>
                                          <td>{bookmark.page}</td>
                                          <td>{bookmark.label}</td>
                                          <td>
                                              <span
                                                  className={`category-badge ${getCategoryColor(
                                                      bookmark.category
                                                  )}`}
                                              >
                                                  {getCategoryLabel(
                                                      bookmark.category
                                                  )}
                                              </span>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
          <footer
              style={{
                  background: "#2c3e50",
                  color: "white",
                  padding: "1.5rem 2rem",
                  textAlign: "center",
                  marginTop: "auto",
                  fontSize: "0.9rem",
              }}
          >
              <div style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                  BookSmart AI - AI-Powered PDF Bookmark Generator
              </div>
              <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                  React • TypeScript • Node.js • PostgreSQL • AWS S3 • Google
                  Gemini AI
              </div>
          </footer>
      </div>
  );
}

export default App;