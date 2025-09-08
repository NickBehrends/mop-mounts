// Enhanced search utilities with diacritics-insensitive matching
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();
};

export const searchInText = (text: string, query: string): boolean => {
  if (!query.trim()) return true;
  
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  return normalizedText.includes(normalizedQuery);
};

export const searchInArray = (items: string[], query: string): boolean => {
  if (!query.trim()) return true;
  
  return items.some(item => searchInText(item, query));
};

export interface SearchableMount {
  id: string;
  name: string;
  expansion: string;
  category: string;
  faction: string;
  sourceType: string;
  sourceDetail: string;
  zone?: string;
  tags?: string[];
}

export const matchesSearch = (mount: SearchableMount, query: string): boolean => {
  if (!query.trim()) return true;
  
  const searchFields = [
    mount.name,
    mount.sourceDetail,
    mount.zone || '',
  ];
  
  // Search in main text fields
  const textMatch = searchFields.some(field => searchInText(field, query));
  
  // Search in tags array
  const tagsMatch = mount.tags ? searchInArray(mount.tags, query) : false;
  
  return textMatch || tagsMatch;
};