const STORAGE_KEY = 'joias-receita-data';

/**
 * Carrega receitas do localStorage.
 */
export function loadRecipes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.warn('Falha ao carregar receitas do localStorage');
    return [];
  }
}

/**
 * Salva receitas no localStorage.
 */
export function saveRecipes(recipes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.warn('Falha ao salvar receitas:', e);
  }
}
