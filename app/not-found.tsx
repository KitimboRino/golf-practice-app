import Link from "next/link";
import { Icon } from "@/components/Icon";

// 404: the ball has rolled past the white stakes.
export default function NotFound() {
  return (
    <div className="notfound">
      <svg className="notfound-art" viewBox="0 0 320 120" aria-hidden="true">
        <line x1="0" y1="96" x2="320" y2="96" className="nf-ground" />
        {[40, 110, 180].map((x) => (
          <g key={x}>
            <rect x={x} y="40" width="9" height="56" rx="2" className="nf-stake" />
            <rect x={x} y="40" width="9" height="10" rx="2" className="nf-cap" />
          </g>
        ))}
        <circle cx="268" cy="88" r="8" className="nf-ball" />
      </svg>
      <span className="notfound-word">RangeCard</span>
      <h1 className="notfound-h">Out of bounds.</h1>
      <p className="notfound-p">
        That page isn&apos;t part of RangeCard. Take a drop and head back to the range.
      </p>
      <Link href="/" className="notfound-cta">
        <Icon name="arrow_back" size={18} />
        Back to your plan
      </Link>
    </div>
  );
}
