import { Esqueleto } from "@/components/ui/basicos";
import { Pagina } from "@/components/ui/pagina";

export default function Carregando() {
  return (
    <Pagina>
      <Esqueleto className="mb-2 h-8 w-56" />
      <Esqueleto className="mb-6 h-4 w-80 max-w-full" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Esqueleto key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Esqueleto className="mt-4 h-72 rounded-2xl" />
    </Pagina>
  );
}
