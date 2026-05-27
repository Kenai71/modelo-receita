import { useState, useRef } from 'react';
import { IconSearch, IconClose, IconFilter, IconPlus } from './Icons';
import './SearchFilter.css';

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [materialInput, setMaterialInput] = useState('');
  const materialInputRef = useRef(null);

  // Local filter state for the panel
  const [localPriceMin, setLocalPriceMin] = useState(filters.priceMin || '');
  const [localPriceMax, setLocalPriceMax] = useState(filters.priceMax || '');
  const [localMaterials, setLocalMaterials] = useState(filters.materials || []);
  const [localSort, setLocalSort] = useState(filters.sort || 'newest');

  const syncFromParent = () => {
    setLocalPriceMin(filters.priceMin || '');
    setLocalPriceMax(filters.priceMax || '');
    setLocalMaterials(filters.materials || []);
    setLocalSort(filters.sort || 'newest');
  };

  const togglePanel = () => {
    if (!panelOpen) syncFromParent();
    setPanelOpen(!panelOpen);
  };

  const addMaterial = () => {
    const val = materialInput.trim();
    if (val && !localMaterials.includes(val)) {
      setLocalMaterials([...localMaterials, val]);
      setMaterialInput('');
      materialInputRef.current?.focus();
    }
  };

  const removeMaterial = (idx) => {
    setLocalMaterials(localMaterials.filter((_, i) => i !== idx));
  };

  const applyFilters = () => {
    onFiltersChange({
      priceMin: localPriceMin,
      priceMax: localPriceMax,
      materials: localMaterials,
      sort: localSort,
    });
    setPanelOpen(false);
  };

  const clearFilters = () => {
    setLocalPriceMin('');
    setLocalPriceMax('');
    setLocalMaterials([]);
    setLocalSort('newest');
    onFiltersChange({ priceMin: '', priceMax: '', materials: [], sort: 'newest' });
    setPanelOpen(false);
  };

  const removeActiveFilter = (key, index) => {
    const newFilters = { ...filters };
    if (key === 'priceMin') { newFilters.priceMin = ''; setLocalPriceMin(''); }
    if (key === 'priceMax') { newFilters.priceMax = ''; setLocalPriceMax(''); }
    if (key === 'sort') { newFilters.sort = 'newest'; setLocalSort('newest'); }
    if (key === 'material') {
      newFilters.materials = filters.materials.filter((_, i) => i !== index);
      setLocalMaterials(newFilters.materials);
    }
    onFiltersChange(newFilters);
  };

  // Active filter tags
  const activeTags = [];
  if (filters.priceMin) activeTags.push({ label: `Mín: R$ ${filters.priceMin}`, key: 'priceMin' });
  if (filters.priceMax) activeTags.push({ label: `Máx: R$ ${filters.priceMax}`, key: 'priceMax' });
  if (filters.materials) {
    filters.materials.forEach((m, i) => activeTags.push({ label: m, key: 'material', index: i }));
  }
  if (filters.sort && filters.sort !== 'newest') {
    const sortLabels = { oldest: 'Mais antigo', 'name-asc': 'Nome A-Z', 'name-desc': 'Nome Z-A', 'price-asc': 'Preço ↑', 'price-desc': 'Preço ↓' };
    activeTags.push({ label: sortLabels[filters.sort], key: 'sort' });
  }

  return (
    <section className="search-section" id="search-section">
      <div className="search-container">
        {/* Search Bar */}
        <div className="search-bar" id="search-bar">
          <IconSearch />
          <input
            type="text"
            id="search-input"
            placeholder="Buscar receitas por nome, material..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="search-clear" id="search-clear" onClick={() => onSearchChange('')} aria-label="Limpar busca">
              <IconClose size={16} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="filter-controls" id="filter-controls">
          <button
            className={`filter-toggle ${panelOpen ? 'active' : ''}`}
            id="filter-toggle"
            onClick={togglePanel}
            aria-label="Abrir filtros"
          >
            <IconFilter />
            <span>Filtros</span>
          </button>

          <div className="active-filters" id="active-filters">
            {activeTags.map((tag, i) => (
              <span key={i} className="active-filter-tag">
                {tag.label}
                <button onClick={() => removeActiveFilter(tag.key, tag.index)} aria-label="Remover filtro">
                  <IconClose size={12} strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        {panelOpen && (
          <div className="filter-panel" id="filter-panel">
            <div className="filter-panel-header">
              <h3>Filtros</h3>
              <button className="filter-close" onClick={() => setPanelOpen(false)} aria-label="Fechar filtros">
                <IconClose />
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">Faixa de Valor de Venda</label>
              <div className="filter-range">
                <input
                  type="number"
                  id="filter-price-min"
                  placeholder="Mín"
                  min="0"
                  step="0.01"
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                />
                <span className="filter-range-sep">até</span>
                <input
                  type="number"
                  id="filter-price-max"
                  placeholder="Máx"
                  min="0"
                  step="0.01"
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Material</label>
              <div className="filter-tags" id="filter-material-tags">
                {localMaterials.map((mat, i) => (
                  <span key={i} className="filter-tag">
                    {mat}
                    <button onClick={() => removeMaterial(i)} aria-label="Remover">
                      <IconClose size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="filter-add-tag">
                <input
                  type="text"
                  ref={materialInputRef}
                  id="filter-material-input"
                  placeholder="Adicionar material..."
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
                />
                <button className="btn-add-filter-tag" onClick={addMaterial} aria-label="Adicionar filtro de material">
                  <IconPlus size={16} />
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Ordenar por</label>
              <select
                id="filter-sort"
                className="filter-select"
                value={localSort}
                onChange={(e) => setLocalSort(e.target.value)}
              >
                <option value="newest">Mais recente</option>
                <option value="oldest">Mais antigo</option>
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
                <option value="price-asc">Preço (menor)</option>
                <option value="price-desc">Preço (maior)</option>
              </select>
            </div>

            <div className="filter-actions">
              <button className="btn-clear-filters" onClick={clearFilters}>Limpar Filtros</button>
              <button className="btn-apply-filters" onClick={applyFilters}>Aplicar</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
