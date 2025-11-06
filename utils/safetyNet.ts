const SAFETY_KEYWORDS = [
  'suicide', 'kill myself', 'hopeless', 'end my life',
  'can\'t go on', 'no reason to live', 'want to die', 'hurting myself'
];

export const checkSafetyKeywords = (text: string): boolean => {
  if (!text) return false;
  const lowercasedText = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => lowercasedText.includes(keyword));
};
