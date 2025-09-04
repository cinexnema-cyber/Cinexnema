import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
}

export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-xnema-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-8 h-8 text-xnema-orange" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-muted-foreground mb-8">{description}</p>
          <p className="text-sm text-muted-foreground">
            Esta página será desenvolvida em breve. Continue prompting para adicionar conteúdo específico.
          </p>
        </div>
      </div>
    </Layout>
  );
}
