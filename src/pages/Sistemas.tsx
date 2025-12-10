import { PageHeader } from "@/components/ui/page-header";
import SistemasContent from "@/components/governanca/SistemasContent";

export default function Sistemas() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistemas"
        description="Gerencie os sistemas da organização"
      />
      <SistemasContent />
    </div>
  );
}
