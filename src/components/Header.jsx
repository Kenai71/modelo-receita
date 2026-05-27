import { IconLogo, IconPlus } from './Icons';
import './Header.css';

export default function Header({ onNewRecipe }) {
  return (
    <header className="header" id="header">
      <div className="header-inner">
        <div className="logo" id="logo">
          <IconLogo />
          <span className="logo-text">
            Joias<span className="logo-accent">Receita</span>
          </span>
        </div>
        <button className="btn-new-recipe" id="btn-new-recipe" onClick={onNewRecipe} aria-label="Criar nova receita">
          <IconPlus size={18} />
          <span>Nova Receita</span>
        </button>
      </div>
    </header>
  );
}
