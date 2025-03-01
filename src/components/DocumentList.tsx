import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, FileText, FileQuestion, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import config from '@/config';

// This is a placeholder component that will be replaced with actual data from Google Sheets
// For now, we'll use mock data

interface Document {
  id: string;
  title: string;
  category: string;
  url: string;
  type: 'doc' | 'pdf' | 'other';
  date?: string;
}

interface Category {
  name: string;
  documents: Document[];
}

const mockCategories: Category[] = [
  {
    name: "Validation Documents",
    documents: [
      {
        id: "1",
        title: "Validation Master Plan",
        category: "Validation Documents",
        url: "https://docs.google.com/document/",
        type: "doc",
        date: "2023-11-12"
      },
      {
        id: "2",
        title: "Risk Assessment",
        category: "Validation Documents",
        url: "https://docs.google.com/document/",
        type: "doc",
        date: "2023-11-20"
      },
      {
        id: "3",
        title: "Validation Protocol",
        category: "Validation Documents",
        url: "https://example.com/protocol.pdf",
        type: "pdf",
        date: "2023-12-05"
      }
    ]
  },
  {
    name: "Technical Documentation",
    documents: [
      {
        id: "4",
        title: "Equipment Specifications",
        category: "Technical Documentation",
        url: "https://docs.google.com/document/",
        type: "doc",
        date: "2023-10-18"
      },
      {
        id: "5",
        title: "Process Flow Diagram",
        category: "Technical Documentation",
        url: "https://example.com/diagram.pdf",
        type: "pdf",
        date: "2023-10-30"
      }
    ]
  },
  {
    name: "Reports",
    documents: [
      {
        id: "6",
        title: "Validation Report",
        category: "Reports",
        url: "https://docs.google.com/document/",
        type: "doc",
        date: "2023-12-15"
      },
      {
        id: "7",
        title: "Deviation Report",
        category: "Reports",
        url: "https://example.com/deviation.pdf",
        type: "pdf",
        date: "2023-12-10"
      }
    ]
  }
];

const DocumentList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentsFromGoogleSheets = async () => {
      try {
        setLoading(true);
        // Construct the Google Sheets API URL with your API key and spreadsheet ID
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.documentsSheet.spreadsheetId;
        const range = 'Documents!A2:F100'; // Adjust based on your sheet structure
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents from Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          // Transform the raw data into Document objects
          const fetchedDocuments: Document[] = data.values.map((row: string[]) => ({
            id: row[0] || String(Math.random()),
            title: row[1] || 'Untitled Document',
            category: row[2] || 'Uncategorized',
            url: row[3] || '#',
            type: (row[4] || 'other') as 'doc' | 'pdf' | 'other',
            date: row[5] || undefined
          }));
          
          // Group documents by category
          const documentsByCategory: Record<string, Document[]> = {};
          
          fetchedDocuments.forEach(doc => {
            if (!documentsByCategory[doc.category]) {
              documentsByCategory[doc.category] = [];
            }
            documentsByCategory[doc.category].push(doc);
          });
          
          // Convert to categories array
          const fetchedCategories: Category[] = Object.keys(documentsByCategory).map(name => ({
            name,
            documents: documentsByCategory[name]
          }));
          
          setCategories(fetchedCategories);
        } else {
          // If no data is returned, set an empty array
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents. Please try again later.');
        // Fallback to empty categories array
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsFromGoogleSheets();
  }, []);

  // Filter documents based on search query
  const filteredCategories = categories.map(category => ({
    ...category,
    documents: category.documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.documents.length > 0);

  // Helper function to get the appropriate icon based on document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'pdf':
        return <File className="h-5 w-5 text-red-500" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher des documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>
      
      {loading && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chargement des documents...</p>
        </div>
      )}
      
      {!loading && error && (
        <div className="py-8 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Aucun document trouvé.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category, index) => (
                <div 
                  key={category.name}
                  className={cn(
                    "animate-fade-in", 
                    { "animation-delay-100": index === 0 },
                    { "animation-delay-200": index === 1 },
                    { "animation-delay-300": index === 2 }
                  )}
                >
                  <h3 className="text-xl font-medium mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.documents.map((document) => (
                      <Card 
                        key={document.id}
                        className="overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer border"
                        onClick={() => window.open(document.url, '_blank')}
                      >
                        <div className="p-4 flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getDocumentIcon(document.type)}
                            <div>
                              <h4 className="font-medium group-hover:text-primary transition-colors duration-300">
                                {document.title}
                              </h4>
                              {document.date && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Mis à jour: {formatDate(document.date)}
                                </p>
                              )}
                            </div>
                          </div>
                          <ExternalLink 
                            size={16} 
                            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;
