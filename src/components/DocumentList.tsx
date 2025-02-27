
import React, { useState } from 'react';
import { ExternalLink, Search, FileText, FileQuestion } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  
  // This function will filter documents based on search term
  const filteredCategories = categories.map(category => {
    return {
      ...category,
      documents: category.documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }).filter(category => category.documents.length > 0);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return <FileText size={20} className="text-blue-500" />;
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      default:
        return <FileQuestion size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-2 rounded-xl"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No documents found matching your search.</p>
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
                              Updated: {new Date(document.date).toLocaleDateString()}
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
    </div>
  );
};

export default DocumentList;
