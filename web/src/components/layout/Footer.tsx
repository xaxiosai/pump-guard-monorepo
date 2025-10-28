import { SiX, SiTelegram } from "react-icons/si";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row items-center justify-between px-content py-6 gap-y-4">
      <p className="text-sm">
        © 2025 Pump Guard. All rights reserved.
      </p>

      <div className="flex items-center gap-x-3">
        <Link to="https://x.com/xaxiosai_new" target="_blank">
          <Button variant="secondary">
            <SiX />
          </Button>
        </Link>
        <Link to="https://t.me/xaxiosaiportal" target="_blank">
          <Button variant="secondary">
            <SiTelegram />
          </Button>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
