
import React from 'react';
import { ExternalLink, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import config from '@/config';
import { cn } from '@/lib/utils';

interface DiagramItem {
  title: string;
  fileName: string;
}

interface DiagramCategory {
  name: string;
  items: DiagramItem[];
}

const DiagramList: React.FC = () => {
  const { categories } = config.diagrammes;

  const openDiagram = (fileName: string) => {
    // Open the diagram in a new tab
    window.open(`/diagrams/${fileName}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {categories.map((category: DiagramCategory, index: number) => (
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
            {category.items.map((item: DiagramItem) => (
              <Card 
                key={item.title}
                className="overflow-hidden group hover:shadow-md transition-all duration-300 cursor-pointer border"
                onClick={() => openDiagram(item.fileName)}
              >
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <File 
                      size={20}
                      className="text-primary opacity-80"
                    />
                    <div>
                      <h4 className="font-medium group-hover:text-primary transition-colors duration-300">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.fileName}</p>
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
  );
};

export default DiagramList;
