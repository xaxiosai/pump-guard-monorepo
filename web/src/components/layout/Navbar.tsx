import { Link } from "react-router-dom";
import { SiGithub, SiGitbook } from "react-icons/si";
import Button from "~/components/ui/Button";

const Navbar = () => {
  return (
    <div className="flex items-center gap-x-2 px-content py-6 border-b border-border-primary">
      <Link to="/" className="flex items-center gap-x-2">
        <img
          src="/img/pump-guard-logo.png"
          alt="Pump Guard Logo"
          className="max-w-8"
        />
        <h1 className="hidden md:block text-primary font-semibold text-xl mt-1.5 opacity-90">
          Pump Guard
        </h1>
      </Link>

      <div className="flex items-center gap-x-3 ml-auto">
        <Link to="https://docs.pumpguard.xaxios.com" target="_blank">
          <Button variant="secondary">
            <SiGitbook className="text-base" />
          </Button>
        </Link>
        <Link to="https://github.com/xaxiosai/pump-guard-monorepo" target="_blank">
          <Button variant="primary">
            <SiGithub className="text-base" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
