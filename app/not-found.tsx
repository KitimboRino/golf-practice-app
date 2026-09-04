import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="notfound">
      <span className="notfound-mark">
        <Icon name="sports_golf" size={30} fill />
      </span>
      <h1 className="notfound-h">Out of bounds</h1>
      <p className="notfound-p">
        That page isn&apos;t part of RangeCard. Let&apos;s get you back on the range.
      </p>
      <Link href="/" className="notfound-cta">
        <Icon name="arrow_back" size={18} />
        Back to your plan
      </Link>
    </div>
  );
}
