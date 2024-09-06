import React from "react";
import "../(styles)/footer.css";
import github from "../../public/images/github-mark-white.png";
import Image from "next/image";

export default function Footer() {
  return (
    <footer data-testid="footer" className="footer">
      <Image
        data-testid="footer-img"
        className="frooter"
        height={25}
        width={25}
        src={github}
        alt="GitHub Logo"
      />
    </footer>
  );
}
