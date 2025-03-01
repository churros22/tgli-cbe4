import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Table, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import config from '@/config';

// This is a placeholder component that will be replaced with actual data from Google Sheets
// For now, we'll use mock data

interface Tableau {
  id: string;
  title: string;
  category: string;
  url: string;
  type: 'sheet' | 'pdf' | 'other';
  date?: string;
}

interface Category {
  name: string;
  tableaux: Tableau[];
}

const TableauxList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTableauxFromGoogleSheets = async () => {
      try {
        setLoading(true);
        // Construct the Google Sheets API URL with your API key and spreadsheet ID
        const apiKey = config.googleSheets.apiKey;
        const sheetId = config.googleSheets.tableauxSheet.spreadsheetId;
        const range = 'Tableaux!A2:F100'; // Adjust based on your sheet structure
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tableaux from Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          // Transform the raw data into Tableau objects
          const fetchedTableaux: Tableau[] = data.values.map((row: string[]) => ({
            id: row[0] || String(Math.random()),
            title: row[1] || 'Untitled Tableau',
            category: row[2] || 'Uncategorized',
            url: row[3] || '#',
            type: (row[4] || 'sheet') as 'sheet' | 'pdf' | 'other',
            date: row[5] || undefined
          }));
          
          // Group tableaux by category
          const tableauxByCategory: Record<string, Tableau[]> = {};
          
          fetchedTableaux.forEach(tableau => {
            if (!tableauxByCategory[tableau.category]) {
              tableauxByCategory[tableau.category] = [];
            }
            tableauxByCategory[tableau.category].push(tableau);
          });
          
          // Convert to categories array
          const fetchedCategories: Category[] = Object.keys(tableauxByCategory).map(name => ({
            name,
            tableaux: tableauxByCategory[name]
          }));
          
          setCategories(fetchedCategories);
        } else {
          // If no data is returned, set an empty array
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching tableaux:', error);
        setError('Failed to load tableaux. Please try again later.');
        // Fallback to empty categories array
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTableauxFromGoogleSheets();
  }, []);

  // Filter tableaux based on search query
  const filteredCategories = categories.map(category => ({
    ...category,
    tableaux: category.tableaux.filter(tableau => 
      tableau.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tableau.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tableaux.length > 0);

  // Helper function to get the appropriate icon based on tableau type
  const getTableauIcon = (type: string) => {
    switch (type) {
      case 'sheet':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      default:
        return <Table className="h-5 w-5 text-gray-500" />;
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
          placeholder="Rechercher des tableaux..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>
      
      {loading && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chargement des tableaux...</p>
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
              <p className="text-muted-foreground">Aucun tableau trouvé.</p>
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
                    {category.tableaux.map((tableau) => (
                      <Card 
                        key={tableau.id}
                        className="overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer border"
                        onClick={() => window.open(tableau.url, '_blank')}
                      >
                        <div className="p-4 flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getTableauIcon(tableau.type)}
                            <div>
                              <h4 className="font-medium group-hover:text-primary transition-colors duration-300">
                                {tableau.title}
                              </h4>
                              {tableau.date && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Mis à jour: {formatDate(tableau.date)}
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

export default TableauxList;
