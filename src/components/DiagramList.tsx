
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, FileSpreadsheet, Activity, FolderTree } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import config from '@/config';

interface DiagramProps {
  title: string;
  fileName: string;
}

interface CategoryProps {
  name: string;
  items: DiagramProps[];
}

const DiagramList = () => {
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramProps | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter diagrams based on search query
  const filteredCategories = config.diagrammes.categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  // Get all flattened diagrams for the "All" tab
  const allDiagrams = config.diagrammes.categories.flatMap(category => category.items)
    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handle diagram selection
  const handleDiagramClick = (diagram: DiagramProps) => {
    setSelectedDiagram(diagram);
  };

  // Get diagrams to display based on selected category
  const getDiagramsToDisplay = () => {
    if (selectedCategory === 'all') {
      return allDiagrams;
    } else {
      const category = config.diagrammes.categories.find(c => c.name === selectedCategory);
      return category ? category.items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) : [];
    }
  };

  // Group diagrams by subcategory within the selected category
  const getGroupedDiagrams = () => {
    const diagrams = getDiagramsToDisplay();
    
    // For the "all" category, group by the main category names
    if (selectedCategory === 'all') {
      const grouped: Record<string, DiagramProps[]> = {};
      
      diagrams.forEach(diagram => {
        // Find which category this diagram belongs to
        for (const category of config.diagrammes.categories) {
          if (category.items.some(item => item.fileName === diagram.fileName)) {
            if (!grouped[category.name]) {
              grouped[category.name] = [];
            }
            grouped[category.name].push(diagram);
            break;
          }
        }
      });
      
      return grouped;
    }
    
    // For specific categories, we can try to group by pattern in the title
    const grouped: Record<string, DiagramProps[]> = {};
    
    diagrams.forEach(diagram => {
      // Extract potential grouping info from title
      let group = "Autres";
      
      // Try to identify groups based on names like "ADLA Yacine 3"
      const matches = diagram.title.match(/(.+?)\s+(\d+)$/);
      if (matches && matches.length >= 3) {
        group = `Chapitre ${matches[2]}`;
      } else if (diagram.title.toLowerCase().includes('flux')) {
        group = "Flux de procédé";
      } else if (diagram.title.toLowerCase().includes('spc')) {
        group = "SPC";
      } else if (diagram.title.toLowerCase().includes('sampling')) {
        group = "Échantillonnage";
      }
      
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(diagram);
    });
    
    return grouped;
  };

  // Get icon based on filename pattern
  const getDiagramIcon = (fileName: string) => {
    if (fileName.includes('flux')) return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
    if (fileName.includes('spc')) return <Activity className="h-5 w-5 text-green-500" />;
    return <FileText className="h-5 w-5 text-amber-500" />;
  };

  const groupedDiagrams = getGroupedDiagrams();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher des diagrammes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card className="border-primary/20 h-full">
            <CardHeader className="pb-3">
              <CardTitle>Diagrammes</CardTitle>
              <CardDescription>
                Sélectionnez une catégorie ci-dessous
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="px-4">
                <TabsList className="mb-4 w-full flex flex-wrap justify-start">
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  {config.diagrammes.categories.map((category) => (
                    <TabsTrigger key={category.name} value={category.name}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <ScrollArea className="h-[calc(100vh-380px)] px-4 pb-4">
                {Object.entries(groupedDiagrams).length > 0 ? (
                  Object.entries(groupedDiagrams).map(([group, diagrams]) => (
                    <div key={group} className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">{group}</h3>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {diagrams.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {diagrams.map((diagram, index) => (
                          <Card 
                            key={index}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedDiagram?.fileName === diagram.fileName 
                                ? 'border-primary bg-primary/5' 
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => handleDiagramClick(diagram)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                {getDiagramIcon(diagram.fileName)}
                                <div className="flex-1 overflow-hidden">
                                  <h3 className="font-medium text-sm truncate">{diagram.title}</h3>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Aucun diagramme trouvé pour cette recherche.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedDiagram ? (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    {getDiagramIcon(selectedDiagram.fileName)}
                    {selectedDiagram.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow relative p-0">
                  <div className="absolute inset-0 overflow-hidden">
                    <iframe 
                      src={selectedDiagram.fileName}
                      className="w-full h-full border-0"
                      title={selectedDiagram.title}
                      sandbox="allow-same-origin allow-scripts"
                    ></iframe>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center p-6">
                  <Activity className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Sélectionnez un diagramme</h3>
                  <p className="text-muted-foreground max-w-md">
                    Choisissez un diagramme dans la liste pour le visualiser ici. Vous pouvez rechercher ou filtrer par catégorie.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiagramList;
