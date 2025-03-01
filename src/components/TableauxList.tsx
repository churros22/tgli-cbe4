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
        const range = 'Tableaux!A1:H100'; // Adjust based on your sheet structure
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tableaux from Google Sheets');
        }
        
        const data = await response.json();
        
        // Process the data from Google Sheets
        if (data && data.values && data.values.length > 0) {
          // Transform the raw data into Tableau objects
          const tableaux: Tableau[] = data.values.map((row: string[]) => ({
            id: row[0] || String(Math.random()),
            title: row[1] || 'Untitled Tableau',
            category: row[2] || 'Uncategorized',
            url: row[3] || '#',
            type: (row[4] || 'other') as 'sheet' | 'pdf' | 'other',
            date: row[5] || undefined
          }));
          
          // Group tableaux by category
          const categoriesMap: Record<string, Tableau[]> = {};
          
          tableaux.forEach(tableau => {
            if (!categoriesMap[tableau.category]) {
              categoriesMap[tableau.category] = [];
            }
            categoriesMap[tableau.category].push(tableau);
          });
          
          // Convert the map to an array of Category objects
          const categoriesArray: Category[] = Object.keys(categoriesMap).map(name => ({
            name,
            tableaux: categoriesMap[name]
          }));
          
          setCategories(categoriesArray);
        } else {
          // If no data is returned, set an empty array
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching tableaux:', error);
        setError('Failed to load tableaux. Please try again later.');
        // Fallback to empty categories
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTableauxFromGoogleSheets();
  }, []);

  // Filter categories based on search query
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
        return <FileSpreadsheet size={20} className="text-green-500 opacity-80" />;
      case 'pdf':
        return <FileSpreadsheet size={20} className="text-red-500 opacity-80" />;
      default:
        return <Table size={20} className="text-primary opacity-80" />;
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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Rechercher un tableau..."
          className="pl-10 py-5"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chargement des tableaux...</p>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="py-8 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && !error && categories.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Aucun tableau disponible.</p>
        </div>
      )}
      
      {/* Tableaux List */}
      {!loading && !error && (
        <>
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Aucun tableau trouvé correspondant à votre recherche.</p>
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
