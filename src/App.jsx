import { useState, useCallback, useMemo, useEffect } from 'react';
import { loadRecipes, saveRecipe, deleteRecipe } from './storage';
import { calculateCosts } from './utils';
import { ToastProvider, useToast } from './components/Toast';
import Header from './components/Header';
import SearchFilter from './components/SearchFilter';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import DetailModal from './components/DetailModal';
import './App.css';

function AppContent() {
  const showToast = useToast();

  // State
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '', materials: [], sort: 'newest' });

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [detailRecipe, setDetailRecipe] = useState(null);

  // Fetch initial data
  useEffect(() => {
    async function fetchRecipes() {
      const data = await loadRecipes();
      setRecipes(data);
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Handlers
  const handleSaveRecipe = useCallback(async (recipeData) => {
    try {
      await saveRecipe(recipeData);
      setRecipes(prev => {
        const idx = prev.findIndex(r => r.id === recipeData.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = recipeData;
          return updated;
        }
        return [recipeData, ...prev];
      });
      setEditingRecipe(null);
    } catch (error) {
      showToast('Erro ao salvar no banco de dados', 'error');
    }
  }, [showToast]);

  const handleDeleteRecipe = useCallback(async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta receita?')) return;
    try {
      await deleteRecipe(id);
      setRecipes(prev => prev.filter(r => r.id !== id));
      setDetailRecipe(null);
      showToast('Receita excluída', 'default');
    } catch (error) {
      showToast('Erro ao excluir no banco de dados', 'error');
    }
  }, [showToast]);

  const handleEditFromDetail = useCallback((recipe) => {
    setDetailRecipe(null);
    setTimeout(() => {
      setEditingRecipe(recipe);
    }, 300);
  }, []);

  // Filtering & sorting
  const filteredRecipes = useMemo(() => {
    let results = [...recipes];
    const query = searchQuery.trim().toLowerCase();

    // Text search
    if (query) {
      results = results.filter(r => {
        const nameMatch = r.name.toLowerCase().includes(query);
        const descMatch = (r.description || '').toLowerCase().includes(query);
        const matMatch = r.materials.some(m => m.name.toLowerCase().includes(query));
        return nameMatch || descMatch || matMatch;
      });
    }

    // Price filter
    const minPrice = parseFloat(filters.priceMin);
    const maxPrice = parseFloat(filters.priceMax);
    if (!isNaN(minPrice)) {
      results = results.filter(r => calculateCosts(r.materials, r.customSalePrice).saleValue >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      results = results.filter(r => calculateCosts(r.materials, r.customSalePrice).saleValue <= maxPrice);
    }

    // Material filter
    if (filters.materials && filters.materials.length > 0) {
      results = results.filter(r =>
        filters.materials.some(f =>
          r.materials.some(m => m.name.toLowerCase().includes(f.toLowerCase()))
        )
      );
    }

    // Sorting
    switch (filters.sort) {
      case 'oldest':
        results.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'name-asc':
        results.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        break;
      case 'name-desc':
        results.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
        break;
      case 'price-asc':
        results.sort((a, b) => calculateCosts(a.materials, a.customSalePrice).saleValue - calculateCosts(b.materials, b.customSalePrice).saleValue);
        break;
      case 'price-desc':
        results.sort((a, b) => calculateCosts(b.materials, b.customSalePrice).saleValue - calculateCosts(a.materials, a.customSalePrice).saleValue);
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return results;
  }, [recipes, searchQuery, filters]);

  const hasRecipes = recipes.length > 0;
  const hasResults = filteredRecipes.length > 0;

  return (
    <>
      <Header onNewRecipe={() => setCreateModalOpen(true)} />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <main className="main" id="main">
        {loading ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'pulse 1.5s infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <h2>Carregando receitas...</h2>
            <p>Conectando ao Firebase</p>
          </div>
        ) : (
          <>
            {hasResults && (
              <div className="recipes-grid" id="recipes-grid">
                {filteredRecipes.map((recipe, i) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={i}
                    onClick={setDetailRecipe}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!hasRecipes && (
              <div className="empty-state" id="empty-state">
                <svg className="empty-icon" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="8" y="8" width="64" height="64" rx="12" />
                  <path d="M28 40h24M40 28v24" strokeLinecap="round" strokeWidth="2" />
                  <circle cx="40" cy="40" r="20" strokeDasharray="4 4" />
                </svg>
                <h2>Nenhuma receita ainda</h2>
                <p>Crie sua primeira receita de joia clicando no botão acima.</p>
              </div>
            )}

            {/* No Results */}
            {hasRecipes && !hasResults && (
              <div className="no-results" id="no-results">
                <svg className="empty-icon" viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="35" cy="35" r="20" />
                  <line x1="50" y1="50" x2="65" y2="65" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="28" y1="35" x2="42" y2="35" strokeLinecap="round" strokeWidth="2" />
                </svg>
                <h2>Nenhum resultado encontrado</h2>
                <p>Tente buscar com outros termos ou ajuste os filtros.</p>
              </div>
            )}
          </>
        )}
      </main>


      {/* Create Modal */}
      <RecipeModal
        isOpen={createModalOpen}
        recipe={null}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveRecipe}
      />

      {/* Edit Modal */}
      <RecipeModal
        isOpen={!!editingRecipe}
        recipe={editingRecipe}
        onClose={() => setEditingRecipe(null)}
        onSave={handleSaveRecipe}
      />

      {/* Detail Modal */}
      <DetailModal
        isOpen={!!detailRecipe}
        recipe={detailRecipe}
        onClose={() => setDetailRecipe(null)}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteRecipe}
      />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
