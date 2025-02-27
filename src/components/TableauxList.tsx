
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
    name: "Données de processus",
    tableaux: [
      {
        id: "1",
        title: "Paramètres du processus",
        category: "Données de processus",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-12-10"
      },
      {
        id: "2",
        title: "Étalonnage de l'équipement",
        category: "Données de processus",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-12-05"
      }
    ]
  },
  {
    name: "Résultats de validation",
    tableaux: [
      {
        id: "3",
        title: "Résumé des résultats de test",
        category: "Résultats de validation",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-12-15"
      },
      {
        id: "4",
        title: "Analyse statistique",
        category: "Résultats de validation",
        url: "https://example.com/statistics.pdf",
        type: "pdf",
        date: "2023-12-18"
      }
    ]
  },
  {
    name: "Gestion de projet",
    tableaux: [
      {
        id: "5",
        title: "Calendrier du projet",
        category: "Gestion de projet",
        url: "https://docs.google.com/spreadsheets/",
        type: "sheet",
        date: "2023-11-20"
      },
      {
        id: "6",
        title: "Allocation des ressources",
        category: "Gestion de projet",
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Rechercher des feuilles de calcul et tableaux..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-2 rounded-xl"
        />
      </div>

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
    </div>
  );
};

export default TableauxList;
