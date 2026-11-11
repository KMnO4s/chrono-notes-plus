import { createContext, useContext } from "react";

export type Language = "en" | "fr";
export const DEFAULT_LANGUAGE: Language = "fr";
export const languageLocale = (language: Language) => language === "fr" ? "fr-FR" : "en-US";
export const normalizeLanguage = (value: unknown): Language => value === "en" || value === "fr" ? value : DEFAULT_LANGUAGE;

const french = {
  "Multi-Chronometer": "Multi-Chronomètre",
  "Track multiple timers simultaneously with precision": "Suivez plusieurs chronomètres simultanément avec précision",
  "Add Chronometer": "Ajouter un chronomètre",
  "Export": "Exporter",
  "Export as JSON": "Exporter en JSON",
  "Export as CSV": "Exporter en CSV",
  "Settings": "Paramètres",
  "Show Statistics": "Afficher les statistiques",
  "Expand All Statistics": "Développer toutes les statistiques",
  "Hide Statistics Buttons": "Masquer les boutons des statistiques",
  "Skip Reset Confirmation": "Désactiver la confirmation de remise à zéro",
  "Read-Only Mode": "Lecture seule",
  "Hide Edit Buttons": "Masquer les boutons de modification",
  "No chronometers yet": "Aucun chronomètre pour le moment",
  "Click \"Add Chronometer\" to create your first timer": "Ajoutez votre premier chronomètre",
  "Chronometer added": "Chronomètre ajouté",
  "New chronometer created successfully": "Le nouveau chronomètre a été créé",
  "Chronometer deleted": "Chronomètre supprimé",
  "Chronometer removed successfully": "Le chronomètre a été supprimé",
  "Order updated": "Ordre modifié",
  "Export successful": "Export réussi",
  "Chronometers exported as JSON": "Chronomètres exportés en JSON",
  "Chronometers exported as CSV": "Chronomètres exportés en CSV",
  "Connected to Standard Notes": "Connecté à Standard Notes",
  "Running in standalone mode - changes won't sync to Standard Notes": "Mode autonome : les modifications ne seront pas synchronisées avec Standard Notes",
  "Connecting to Standard Notes...": "Connexion à Standard Notes…",
  "Order": "Ordre",
  "Name": "Nom",
  "Current Time": "Temps actuel",
  "Status": "État",
  "Color": "Couleur",
  "Total Time": "Temps total",
  "Sessions": "Sessions",
  "Avg Session": "Session moyenne",
  "Last Used": "Dernière utilisation",
  "Running": "En cours",
  "Paused": "En pause",
  "Never": "Jamais",
  "Name updated": "Nom modifié",
  "Invalid format": "Format incorrect",
  "Please use HH:MM:SS format (hours can be any number)": "Utilisez le format HH:MM:SS (le nombre d’heures n’est pas limité)",
  "Invalid time": "Temps incorrect",
  "Minutes and seconds must be less than 60": "Les minutes et les secondes doivent être inférieures à 60",
  "Time updated": "Temps modifié",
  "Invalid position": "Position incorrecte",
  "Color updated": "Couleur modifiée",
  "Choose color": "Choisir une couleur",
  "Chronometer name": "Nom du chronomètre",
  "Pause": "Pause",
  "Start": "Démarrer",
  "This will reset the chronometer to 00:00:00. This action cannot be undone.": "Le chronomètre sera remis à 00:00:00. Cette action est irréversible.",
  "Cancel": "Annuler",
  "Reset": "Remettre à zéro",
  "This will permanently delete this chronometer. This action cannot be undone.": "Ce chronomètre sera définitivement supprimé. Cette action est irréversible.",
  "Delete": "Supprimer",
  "Statistics": "Statistiques",
  "Hide": "Masquer",
  "Show": "Afficher",
  "View Detailed Statistics": "Voir les statistiques détaillées",
  "Detailed session history and usage statistics": "Historique détaillé des sessions et statistiques d’utilisation",
  "Average": "Moyenne",
  "Longest Session": "Session la plus longue",
  "Shortest Session": "Session la plus courte",
  "Session History": "Historique des sessions",
  "No completed sessions yet": "Aucune session terminée pour le moment",
  "Close": "Fermer",
  "Language": "Langue",
  "Timer {number}": "Chronomètre {number}",
  "Moved {direction}": "Déplacé vers le {direction}",
  "up": "haut",
  "down": "bas",
  "Moved to position {number}": "Déplacé en position {number}",
  "Chronometer renamed to \"{name}\"": "Chronomètre renommé « {name} »",
  "Chronometer set to {time}": "Chronomètre réglé sur {time}",
  "Please enter a number between 1 and {number}": "Saisissez un nombre entre 1 et {number}",
  "Chronometer color changed to {color}": "Couleur du chronomètre : {color}",
  "Reset \"{name}\"?": "Remettre « {name} » à zéro ?",
  "Delete \"{name}\"?": "Supprimer « {name} » ?",
  "Statistics for \"{name}\"": "Statistiques de « {name} »",
  "Blue": "Bleu",
  "Green": "Vert",
  "Red": "Rouge",
  "Orange": "Orange",
  "Yellow": "Jaune",
  "Teal": "Turquoise",
  "Purple": "Violet",
  "Pink": "Rose",
  "Gray": "Gris",
  "Edit name": "Modifier le nom",
  "Edit time": "Modifier le temps",
  "Save": "Enregistrer",
  "Move up": "Déplacer vers le haut",
  "Move down": "Déplacer vers le bas",
  "Edit position": "Modifier la position",
  "Just now": "À l’instant",
  "{number}m ago": "Il y a {number} min",
  "{number}h ago": "Il y a {number} h",
  "{number}d ago": "Il y a {number} j"
} as const;
export type TranslationKey = keyof typeof french;
export const createTranslator = (language: Language) => (key: TranslationKey, values: Record<string, string | number> = {}): string => {
  const text = language === "fr" ? french[key] : key;
  const filled = text.replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
  return language === "fr" ? filled.replace(/ ([:;?!])/g, "\u00A0$1") : filled;
};
export const colon = (language: Language) => language === "fr" ? "\u00A0:" : ":";
export const LanguageContext = createContext<Language>(DEFAULT_LANGUAGE);
export const useLanguage = () => {
  const language = useContext(LanguageContext);
  return { language, locale: languageLocale(language), t: createTranslator(language), colon: colon(language) };
};

export const notePreview = (language: Language, total: number, running: number): string => {
  const fr = language === "fr";
  const base = total === 0
    ? (fr ? "Aucun chronomètre" : "No chronometers")
    : `${total} ${fr ? (total === 1 ? "chronomètre" : "chronomètres") : (total === 1 ? "chronometer" : "chronometers")}`;
  return running > 0 ? `${base} · ${running} ${fr ? "en cours" : "running"}` : base;
};
