import additivesData from '../data/additives.json';

interface Additive {
  e_number: string;
  name: string;
  safety: string;
  description: string;
}

export function findAdditives(identifiedStrings: string[]): Additive[] {
  const matchedAdditives: Additive[] = [];
  const lowerCaseIdentified = identifiedStrings.map(str => str.toLowerCase().trim());

  additivesData.forEach(additive => {
    const lowerCaseName = additive.name.toLowerCase().trim();
    const lowerCaseENumber = additive.e_number.toLowerCase().trim();

    // Check if the identified string is either the name or E-number
    if (lowerCaseIdentified.includes(lowerCaseName) || lowerCaseIdentified.includes(lowerCaseENumber)) {
      // Avoid adding duplicates if both name and E-number match
      if (!matchedAdditives.some(item => item.e_number === additive.e_number)) {
        matchedAdditives.push(additive);
      }
    }
  });

  return matchedAdditives;
} 