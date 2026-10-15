import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="ALGORIX — início">
      <BrandMark />
      <span>
        ALGORIX<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
