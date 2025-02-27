
import React, { useState } from 'react';
import { ExternalLink, Search, Table, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

const mockCategories: Category[] = [
  {
    name: "Process Data",
    tableaux: [
      {
        id: "1",
        title: "Process Parameters",
        category: "Process Data",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-12-10"
      },
      {
        id: "2",
        title: "Equipment Calibration",
        category: "Process Data",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-12-05"
      }
    ]
  },
  {
    name: "Validation Results",
    tableaux: [
      {
        id: "3",
        title: "Test Results Summary",
        category: "Validation Results",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-12-15"
      },
      {
        id: "4",
        title: "Statistical Analysis",
        category: "Validation Results",
        url: "https://example.com/statistics.pdf",
        type: "pdf",
        date: "2023-12-18"
      }
    ]
  },
  {
    name: "Project Management",
    tableaux: [
      {
        id: "5",
        title: "Project Timeline",
        category: "Project Management",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-11-20"
      },
      {
        id: "6",
        title: "Resource Allocation",
        category: "Project Management",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-11-25"
      }
    ]
  }
];

const TableauxList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  
  // This function will filter tableaux based on search term
  const filteredCategories = categories.map(category => {
    return {
      ...category,
      tableaux: category.tableaux.filter(tab => 
        tab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tab.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  }).filter(category => category.tableaux.length > 0);

  const getTableauIcon = (type: string) => {
    switch (type) {
      case 'sheet':
        return <FileSpreadsheet size={20} className="text-green-500" />;
      case 'pdf':
        return <Table size={20} className="text-red-500" />;
      default:
        return <Table size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Search spreadsheets and tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-2 rounded-xl"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No tableaux found matching your search.</p>
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
                              Updated: {new Date(tableau.date).toLocaleDateString()}
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

export default TableauxList;
