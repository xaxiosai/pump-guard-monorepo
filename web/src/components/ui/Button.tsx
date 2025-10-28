import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

const Button = ({ variant = "secondary", children, className, ...props }: ButtonProps) => {
  const baseStyles = "px-3 py-2.5 rounded font-medium transition-colors";

  const variantStyles = {
    primary: "bg-primary text-background hover:bg-primary/90",
    secondary: "border border-border-primary hover:border-white/15",
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
