import { useState } from 'react';

const DEFAULT_CATEGORIES = [
  { name: 'Transporte', icon: '🚌', isCustom: false },
  { name: 'Alimentación', icon: '🍔', isCustom: false },
  { name: 'Mercado', icon: '🛒', isCustom: false },
  { name: 'Entretenimiento', icon: '🎮', isCustom: false },
  { name: 'Educación', icon: '📚', isCustom: false },
  { name: 'Salud', icon: '💊', isCustom: false },
  { name: 'Otro', icon: '📦', isCustom: false }
];

export function getCategories() {
  const saved = localStorage.getItem('pc_custom_categories');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing categories', e);
    }
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories) {
  localStorage.setItem('pc_custom_categories', JSON.stringify(categories));
}

export function useCategories() {
  const [categories, setCategories] = useState(getCategories());

  const addCategory = (name, icon) => {
    if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
        return false; // Ya existe
    }
    const newCats = [...categories, { name, icon: icon || '📁', isCustom: true }];
    setCategories(newCats);
    saveCategories(newCats);
    return true;
  };

  const removeCategory = (name) => {
    const newCats = categories.filter(c => c.name !== name);
    setCategories(newCats);
    saveCategories(newCats);
  };

  return { categories, addCategory, removeCategory };
}
