import { useState, useEffect, useRef, useCallback } from 'react';
import { uploadImage } from '../storage';
import { formatCurrency, calculateCosts, generateId } from '../utils';
import { IconClose, IconPlus, IconImage } from './Icons';
import { useToast } from './Toast';
import './RecipeModal.css';

export default function RecipeModal({ isOpen, recipe, onClose, onSave }) {
  const showToast = useToast();
  const nameInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageData, setImageData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [materials, setMaterials] = useState([{ id: generateId(), name: '', quantity: '', value: '' }]);
  const [customSalePrice, setCustomSalePrice] = useState('');
  const [dragging, setDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!recipe;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (recipe) {
        setName(recipe.name);
        setDescription(recipe.description || '');
        setImageData(recipe.image || null);
        setImageFile(null);
        setMaterials(
          recipe.materials.length > 0
            ? recipe.materials.map(m => ({ ...m, id: generateId() }))
            : [{ id: generateId(), name: '', quantity: '', value: '' }]
        );
        setCustomSalePrice(recipe.customSalePrice != null ? String(recipe.customSalePrice) : '');
      } else {
        setName('');
        setDescription('');
        setImageData(null);
        setImageFile(null);
        setMaterials([{ id: generateId(), name: '', quantity: '', value: '' }]);
        setCustomSalePrice('');
      }
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, recipe]);

  // Costs
  const parsedMaterials = materials.map(m => ({
    name: m.name,
    quantity: parseFloat(m.quantity) || 0,
    value: parseFloat(m.value) || 0,
  }));
  const costs = calculateCosts(parsedMaterials, customSalePrice !== '' ? parseFloat(customSalePrice) : null);

  // Image handling
  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Imagem muito grande. Máximo: 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  // Material handlers
  const addMaterial = () => {
    setMaterials(prev => [...prev, { id: generateId(), name: '', quantity: '', value: '' }]);
  };

  const removeMaterial = (id) => {
    setMaterials(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(m => m.id !== id);
    });
  };

  const updateMaterial = (id, field, value) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Save
  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Digite o nome da peça', 'error');
      nameInputRef.current?.focus();
      return;
    }

    setIsSaving(true);
    
    try {
      const validMaterials = parsedMaterials.filter(m => m.name.trim());
      const finalCosts = calculateCosts(validMaterials);
      const recipeId = recipe?.id || generateId();

      let finalImageUrl = imageData; // If it's an existing URL, keep it
      
      // If there's a new file, upload it
      if (imageFile) {
        showToast('Fazendo upload da imagem...', 'default');
        finalImageUrl = await uploadImage(imageFile, recipeId);
      }

      const recipeData = {
        id: recipeId,
        name: name.trim(),
        description: description.trim(),
        image: finalImageUrl,
        materials: validMaterials,
        costs: finalCosts,
        customSalePrice: customSalePrice !== '' ? parseFloat(customSalePrice) : null,
        createdAt: recipe?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(recipeData);
      showToast(isEditing ? 'Receita atualizada com sucesso!' : 'Receita criada com sucesso!', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar receita. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">{isEditing ? 'Editar Receita' : 'Nova Receita'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            <IconClose size={22} />
          </button>
        </div>

        <div className="modal-body" id="modal-body">
          {/* Image Upload */}
          <div className="form-section">
            <label className="form-label">Foto da Peça</label>
            <div
              className={`image-upload ${dragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleImageFile(e.dataTransfer.files[0]); }}
            >
              {!imageData ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    className="image-input-hidden"
                    onChange={(e) => handleImageFile(e.target.files[0])}
                  />
                  <div className="image-upload-placeholder">
                    <IconImage size={40} />
                    <span>Clique ou arraste para adicionar uma foto</span>
                  </div>
                </>
              ) : (
                <div className="image-preview">
                  <img src={imageData} alt="Preview da peça" />
                  <button
                    className="image-remove"
                    onClick={(e) => { e.stopPropagation(); setImageData(null); setImageFile(null); }}
                    aria-label="Remover imagem"
                    disabled={isSaving}
                  >
                    <IconClose size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recipe Name */}
          <div className="form-section">
            <label className="form-label" htmlFor="recipe-name">Nome da Peça</label>
            <input
              ref={nameInputRef}
              type="text"
              id="recipe-name"
              className="form-input"
              placeholder="Ex: Anel Solitário Ouro 18k"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-section">
            <label className="form-label" htmlFor="recipe-description">Descrição (opcional)</label>
            <textarea
              id="recipe-description"
              className="form-textarea"
              placeholder="Descreva brevemente a peça..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Materials */}
          <div className="form-section">
            <div className="form-section-header">
              <label className="form-label">Materiais</label>
            </div>

            <div className="materials-list" id="materials-list">
              {materials.map((mat) => (
                <div key={mat.id} className="material-row">
                  <input
                    type="text"
                    data-field="name"
                    placeholder="Material"
                    value={mat.name}
                    onChange={(e) => updateMaterial(mat.id, 'name', e.target.value)}
                    autoComplete="off"
                  />
                  <input
                    type="number"
                    data-field="quantity"
                    placeholder="Qtd"
                    value={mat.quantity}
                    onChange={(e) => updateMaterial(mat.id, 'quantity', e.target.value)}
                    min="0"
                    step="1"
                    inputMode="numeric"
                  />
                  <input
                    type="number"
                    data-field="value"
                    placeholder="Valor (R$)"
                    value={mat.value}
                    onChange={(e) => updateMaterial(mat.id, 'value', e.target.value)}
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                  />
                  <button
                    className="btn-remove-material"
                    onClick={() => removeMaterial(mat.id)}
                    aria-label="Remover material"
                    type="button"
                    disabled={materials.length <= 1}
                  >
                    <IconClose size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>

            <button className="btn-add-material" onClick={addMaterial} type="button">
              <IconPlus size={16} />
              <span>Adicionar Material</span>
            </button>
          </div>

          {/* Costs Summary */}
          <div className="costs-summary" id="costs-summary">
            <div className="cost-row">
              <span className="cost-label">Valor dos Materiais</span>
              <span className="cost-value" id="cost-materials">{formatCurrency(costs.materialTotal)}</span>
            </div>
            <div className="cost-row">
              <span className="cost-label">
                Valor do Serviço <span className="cost-hint">(25% dos materiais)</span>
              </span>
              <span className="cost-value" id="cost-service">{formatCurrency(costs.serviceValue)}</span>
            </div>
            <div className="cost-row cost-row-total">
              <span className="cost-label">Valor de Custo</span>
              <span className="cost-value" id="cost-total">{formatCurrency(costs.costTotal)}</span>
            </div>
            <div className="cost-row cost-row-sale">
              <span className="cost-label">
                Valor de Venda <span className="cost-hint">(automático = custo × 2)</span>
              </span>
              <div className="cost-sale-input-wrapper">
                <span className="cost-currency">R$</span>
                <input
                  type="number"
                  className="cost-input-sale"
                  placeholder={costs.suggestedSaleValue.toFixed(2)}
                  value={customSalePrice}
                  onChange={(e) => setCustomSalePrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button className="btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : (isEditing ? 'Atualizar Receita' : 'Salvar Receita')}
          </button>
        </div>
      </div>
    </div>
  );
}
