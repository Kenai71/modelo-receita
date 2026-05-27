import { useEffect } from 'react';
import { calculateCosts, formatCurrency } from '../utils';
import { IconClose, IconEdit, IconTrash, IconImage } from './Icons';
import './DetailModal.css';

export default function DetailModal({ isOpen, recipe, onClose, onEdit, onDelete }) {
  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

  const costs = calculateCosts(recipe.materials, recipe.customSalePrice);

  return (
    <div className="modal-overlay" id="detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-detail" id="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div className="modal-header">
          <h2 id="detail-title">Detalhes da Receita</h2>
          <div className="detail-header-actions">
            <button className="btn-icon" onClick={() => onEdit(recipe)} aria-label="Editar receita" title="Editar">
              <IconEdit />
            </button>
            <button className="btn-icon btn-icon-danger" onClick={() => onDelete(recipe.id)} aria-label="Excluir receita" title="Excluir">
              <IconTrash />
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
              <IconClose size={22} />
            </button>
          </div>
        </div>

        <div className="modal-body" id="detail-body">
          {/* Image */}
          <div className="detail-image">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.name} />
            ) : (
              <div className="detail-no-image">
                <IconImage size={48} />
              </div>
            )}
          </div>

          {/* Info */}
          <h2 className="detail-name">{recipe.name}</h2>
          {recipe.description && <p className="detail-description">{recipe.description}</p>}

          {/* Materials Table */}
          {recipe.materials.length > 0 && (
            <>
              <h3 className="detail-section-title">Materiais</h3>
              <table className="detail-materials-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Qtd</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.materials.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.quantity || 1}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(m.value)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(m.value * (m.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Costs */}
          <div className="detail-costs">
            <div className="costs-summary">
              <div className="cost-row">
                <span className="cost-label">Valor dos Materiais</span>
                <span className="cost-value">{formatCurrency(costs.materialTotal)}</span>
              </div>
              <div className="cost-row">
                <span className="cost-label">
                  Valor do Serviço <span className="cost-hint">(25%)</span>
                </span>
                <span className="cost-value">{formatCurrency(costs.serviceValue)}</span>
              </div>
              <div className="cost-row cost-row-total">
                <span className="cost-label">Valor de Custo</span>
                <span className="cost-value">{formatCurrency(costs.costTotal)}</span>
              </div>
              <div className="cost-row cost-row-sale">
                <span className="cost-label">
                  Valor de Venda <span className="cost-hint">(custo × 2)</span>
                </span>
                <span className="cost-value cost-value-sale">{formatCurrency(costs.saleValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
