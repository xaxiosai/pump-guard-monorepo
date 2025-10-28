import { Shield, Zap, Eye, Code } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Rug Pull Detection",
      description: "Identify suspicious wallet patterns and fresh wallet concentrations",
    },
    {
      icon: Zap,
      title: "Real-Time Analysis",
      description: "Instant risk scoring for pump.fun and Pumpswap tokens",
    },
    {
      icon: Eye,
      title: "Clear Metrics",
      description: "Easy-to-understand risk scores for every token",
    },
    {
      icon: Code,
      title: "Open Source",
      description: "Fully transparent and auditable by the community",
    },
  ];

  return (
    <section className="px-content py-8 border-b border-border-primary">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Scan tokens the <i className="text-primary">smart way</i>
          </h2>
          <p className="text-foreground/70 text-lg max-w-2xl">
            Detect manipulation patterns and make informed decisions before you trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col gap-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6  text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
