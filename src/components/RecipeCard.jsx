import { calculateCosts, formatCurrency, formatDate } from '../utils';
import { IconImage } from './Icons';
import './RecipeCard.css';

export default function RecipeCard({ recipe, index, onClick }) {
  const costs = calculateCosts(recipe.materials, recipe.customSalePrice);

  return (
    <article
      className="recipe-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onClick(recipe)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(recipe); }}
      role="button"
      aria-label={`Ver detalhes de ${recipe.name}`}
    >
      {recipe.createdAt && (
        <span className="recipe-card-date">{formatDate(recipe.createdAt)}</span>
      )}

      <div className={`recipe-card-image ${!recipe.image ? 'recipe-card-no-image' : ''}`}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} loading="lazy" />
        ) : (
          <IconImage size={48} />
        )}
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-name">{recipe.name}</h3>
        {recipe.description && (
          <p className="recipe-card-description">{recipe.description}</p>
        )}
        <div className="recipe-card-materials">
          {recipe.materials.slice(0, 3).map((m, i) => (
            <span key={i} className="recipe-card-material-tag">{m.name}</span>
          ))}
          {recipe.materials.length > 3 && (
            <span className="recipe-card-material-tag">+{recipe.materials.length - 3}</span>
          )}
        </div>
        <div className="recipe-card-footer">
          <div>
            <div className="recipe-card-cost-label">Custo</div>
            <div className="recipe-card-cost-value">{formatCurrency(costs.costTotal)}</div>
          </div>
          <div>
            <div className="recipe-card-sale-label">Venda</div>
            <div className="recipe-card-sale-value">{formatCurrency(costs.saleValue)}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
