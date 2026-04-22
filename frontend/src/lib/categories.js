import { useState } from 'react';

const DEFAULT_CATEGORIES = [
  { name: 'Restaurantes', icon: '🍽️', isCustom: false },
  { name: 'Supermercado y Hogar', icon: '🛒', isCustom: false },
  { name: 'Entretenimiento y Suscripciones', icon: '🎮', isCustom: false },
  { name: 'Educación y Cursos', icon: '📚', isCustom: false },
  { name: 'Salud y Farmacia', icon: '💊', isCustom: false },
  { name: 'Misceláneos', icon: '📦', isCustom: false }
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
