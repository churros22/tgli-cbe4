
/**
 * CBE#4-Process Validation Application Configuration
 * 
 * Ce fichier contient tous les paramètres configurables pour l'application.
 * Modifiez ces valeurs pour personnaliser l'application selon vos besoins.
 */

const config = {
  // Authentification
  auth: {
    password: "cbe425", // Le mot de passe requis pour accéder à l'application
  },
  
  // Application
  appName: "CBE#4-Validation des Processus",
  
  // Configuration de l'API Google Sheets
  googleSheets: {
    // Configuration nécessaire pour l'API Google Sheets
    apiKey: "", // Votre clé API Google (à remplir)
    clientId: "", // Votre ID client OAuth (à remplir)
    scopes: "https://www.googleapis.com/auth/spreadsheets.readonly",
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    
    // Feuille des tâches (pour le tableau de bord)
    tasksSheet: {
      spreadsheetId: "", // ID de votre Google Sheet (à remplir)
      range: "Tasks!A1:Z1000", // Plage à récupérer (ajustez selon vos besoins)
    },
    
    // Feuille des documents (pour la page Documents)
    documentsSheet: {
      spreadsheetId: "", // Peut être le même que tasks ou différent
      range: "Documents!A1:Z1000", // Plage à récupérer (ajustez selon vos besoins)
    },
    
    // Feuille des tableaux (pour la page Tableaux)
    tableauxSheet: {
      spreadsheetId: "", // Peut être le même que tasks ou différent
      range: "Tableaux!A1:Z1000", // Plage à récupérer (ajustez selon vos besoins)
    },
  },
  
  // Navigation
  navigation: [
    { name: "Tableau de bord", path: "/dashboard" },
    { name: "Diagrammes", path: "/diagrammes" },
    { name: "Documents", path: "/documents" },
    { name: "Tableaux", path: "/tableaux" },
  ],
  
  // Progrès du projet (pour le graphique du tableau de bord)
  projectProgress: {
    // Données d'exemple pour le graphique de progression
    // Remplacez par des données réelles ou une intégration
    data: [
      { name: "Jan", progress: 20 },
      { name: "Fév", progress: 35 },
      { name: "Mar", progress: 50 },
      { name: "Avr", progress: 65 },
      { name: "Mai", progress: 78 },
      { name: "Juin", progress: 90 },
      { name: "Juil", progress: 95 },
    ],
    // Couleurs du graphique
    colors: {
      primary: "#1a1a1a",
      secondary: "#f0f0f0",
    },
  },

  // Données des diagrammes (pour la page Diagrammes)
  // Ce sont des liens vers des fichiers HTML locaux
  diagrammes: {
    categories: [
      {
        name: "Schémas de processus",
        items: [
          { title: "Flux de processus principal", fileName: "process-flow.html" },
          { title: "Processus de validation", fileName: "validation-process.html" },
          { title: "Contrôle qualité", fileName: "quality-control.html" },
        ]
      },
      {
        name: "Organisation",
        items: [
          { title: "Structure d'équipe", fileName: "team-structure.html" },
          { title: "Matrice de responsabilité", fileName: "responsibility-matrix.html" },
        ]
      }
    ]
  },
  
  // Configuration des tâches
  tasks: {
    // États des tâches disponibles
    statuses: [
      { id: "pending", label: "En attente" },
      { id: "in_progress", label: "En cours" },
      { id: "completed", label: "Complété" },
    ],
    
    // Catégories par défaut des tâches
    defaultCategories: [
      "Documentation",
      "Préparation",
      "Planification",
      "Gestion des risques",
      "Test",
      "Validation",
      "Revue",
    ],
    
    // Messages pour les tâches
    messages: {
      addSuccess: "Tâche ajoutée avec succès",
      updateSuccess: "Tâche mise à jour avec succès",
      deleteSuccess: "Tâche supprimée",
      addError: "Erreur lors de l'ajout de la tâche",
      updateError: "Erreur lors de la mise à jour de la tâche",
      deleteError: "Erreur lors de la suppression de la tâche",
    },
    
    // Étiquettes pour le formulaire de tâche
    labels: {
      title: "Nom de la tâche",
      startDate: "Date de début",
      dueDate: "Date limite",
      assignee: "Responsable de la tâche",
      progress: "Progression",
      status: "État",
      category: "Catégorie",
      parentTask: "Tâche parent",
      add: "Ajouter une tâche",
      edit: "Modifier la tâche",
      delete: "Supprimer",
      save: "Enregistrer",
      cancel: "Annuler",
      noTasks: "Aucune tâche pour le moment. Ajoutez votre première tâche ci-dessus.",
    },
  },
  
  // Étiquettes du tableau de bord
  dashboard: {
    title: "Tableau de bord",
    welcome: "Bienvenue sur votre tableau de bord de gestion de projet",
    progressSection: "Progression du projet",
    tasksSection: "Tâches",
    overallProgress: "Progression globale",
    tasksRemaining: "Tâches restantes",
    statistics: {
      totalTasks: "Total des tâches",
      completedTasks: "Tâches complétées",
      remainingTasks: "Tâches restantes",
      overdueTasks: "Tâches en retard",
      nextDeadline: "Prochaine échéance",
    },
  },
  
  // Information de déploiement GitHub Pages
  deployment: {
    repoName: "tgli-cbe4", // Le nom du dépôt GitHub
    branch: "gh-pages", // La branche à déployer
  },
};

export default config;
