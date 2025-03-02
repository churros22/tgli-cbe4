import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, FileText, FileCode, FileSpreadsheet, File, Download, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import config from '@/config';

interface Document {
  id: string;
  title: string;
  category: string;
  url: string;
  type: 'doc' | 'pdf' | 'spreadsheet' | 'code' | 'other';
  date?: string;
  description?: string;
}

interface Category {
  name: string;
  documents: Document[];
}

const DocumentList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchDocumentsFromGoogleSheets = async () => {
      try {
        setLoading(true);
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.documentsSheet.spreadsheetId;
        const range = 'Documents!A2:G100';
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents from Google Sheets');
        }
        
        const data = await response.json();
        
        if (data && data.values && data.values.length > 0) {
          const fetchedDocuments: Document[] = data.values.map((row: string[]) => ({
            id: row[0] || String(Math.random()),
            title: row[1] || 'Untitled Document',
            category: row[2] || 'Uncategorized',
            url: row[3] || '#',
            type: determineDocumentType(row[3], row[4] || 'other'),
            date: row[5] || undefined,
            description: row[6] || undefined
          }));
          
          const documentsByCategory: Record<string, Document[]> = {};
          
          fetchedDocuments.forEach(doc => {
            if (!documentsByCategory[doc.category]) {
              documentsByCategory[doc.category] = [];
            }
            documentsByCategory[doc.category].push(doc);
          });
          
          const fetchedCategories: Category[] = Object.keys(documentsByCategory).map(name => ({
            name,
            documents: documentsByCategory[name]
          }));
          
          setCategories(fetchedCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents. Please try again later.');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsFromGoogleSheets();
  }, []);

  const determineDocumentType = (url: string, explicitType: string): Document['type'] => {
    if (explicitType && ['doc', 'pdf', 'spreadsheet', 'code'].includes(explicitType)) {
      return explicitType as Document['type'];
    }
    
    if (!url) return 'other';
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('docs.google.com/document') || lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) {
      return 'doc';
    }
    if (lowerUrl.endsWith('.pdf')) {
      return 'pdf';
    }
    if (lowerUrl.includes('docs.google.com/spreadsheets') || lowerUrl.endsWith('.xlsx') || lowerUrl.endsWith('.csv')) {
      return 'spreadsheet';
    }
    if (lowerUrl.endsWith('.js') || lowerUrl.endsWith('.ts') || lowerUrl.endsWith('.py') || lowerUrl.endsWith('.html') || lowerUrl.endsWith('.css')) {
      return 'code';
    }
    
    return 'other';
  };

  const filteredCategories = categories
    .map(category => ({
      ...category,
      documents: category.documents.filter(doc => 
        (searchQuery === '' || 
         doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        (activeTab === 'all' || doc.type === activeTab)
      )
    }))
    .filter(category => category.documents.length > 0);

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'doc':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'code':
        return <FileCode className="h-10 w-10 text-purple-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return dateString;
      return format(date, 'dd MMM yyyy', { locale: undefined });
    } catch (e) {
      return dateString;
    }
  };

  const getCounts = () => {
    const counts = {
      all: 0,
      doc: 0,
      pdf: 0,
      spreadsheet: 0,
      code: 0,
      other: 0
    };
    
    categories.forEach(category => {
      category.documents.forEach(doc => {
        counts.all++;
        counts[doc.type]++;
      });
    });
    
    return counts;
  };
  
  const counts = getCounts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:space-x-4 md:justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher des documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">
            All <Badge variant="outline" className="ml-2">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="doc">
            Documents <Badge variant="outline" className="ml-2">{counts.doc}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pdf">
            PDFs <Badge variant="outline" className="ml-2">{counts.pdf}</Badge>
          </TabsTrigger>
          <TabsTrigger value="spreadsheet">
            Spreadsheets <Badge variant="outline" className="ml-2">{counts.spreadsheet}</Badge>
          </TabsTrigger>
          <TabsTrigger value="code">
            Code <Badge variant="outline" className="ml-2">{counts.code}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-8 w-8 rounded mb-3" />
                  <Skeleton className="h-5 w-2/3 rounded mb-2" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                </Card>
              ))}
            </div>
          )}
          
          {!loading && error && (
            <div className="py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-muted-foreground mt-2">Please check your internet connection and try again.</p>
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
                            className="overflow-hidden group hover:shadow-md transition-all duration-300 hover:border-primary/50"
                            onClick={() => window.open(document.url, '_blank')}
                          >
                            <div className="p-4">
                              <div className="flex flex-col items-center text-center">
                                {getDocumentIcon(document.type)}
                                <div className="mt-3">
                                  <h4 className="font-medium group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                    {document.title}
                                  </h4>
                                  {document.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {document.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-center mt-2">
                                    {document.date && (
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(document.date)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-full h-12 bg-muted/30 flex items-center justify-center border-t">
                              <Button variant="ghost" size="sm" className="text-xs gap-1">
                                <ExternalLink size={14} />
                                Open Document
                              </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentList;
