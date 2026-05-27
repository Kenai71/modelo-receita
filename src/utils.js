/**
 * Formata um valor numérico como moeda brasileira (BRL).
 */
export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Formata uma data ISO para exibição curta.
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

/**
 * Gera um ID único baseado em timestamp + random.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Calcula os custos a partir de uma lista de materiais.
 * materialTotal = soma de (valor * quantidade) de cada material
 * serviceValue = 25% do materialTotal
 * costTotal = materialTotal + serviceValue
 * suggestedSaleValue = costTotal * 2
 * saleValue = customSalePrice (se existir) ou suggestedSaleValue
 */
export function calculateCosts(materials, customSalePrice = null) {
  const materialTotal = materials.reduce(
    (sum, m) => sum + (m.value || 0) * (m.quantity || 1),
    0
  );
  const serviceValue = materialTotal * 0.25;
  const costTotal = materialTotal + serviceValue;
  const suggestedSaleValue = costTotal * 2;
  const saleValue = customSalePrice !== null ? customSalePrice : suggestedSaleValue;
  return { materialTotal, serviceValue, costTotal, suggestedSaleValue, saleValue };
}
