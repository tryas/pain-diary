import { useState, useMemo } from "react";
import type { BodyView } from "@shared/schema";
import { getZonesForView, frontZones } from "@/data/anatomy";

// Group labels
const GROUP_LABELS: Record<string, string> = {
  head:      "Голова и шея",
  chest:     "Грудная клетка и живот",
  back:      "Спина",
  shoulder:  "Плечи и руки",
  forearm:   "Предплечье и кисть",
  hip:       "Тазобедренная область",
  thigh:     "Бедро",
  knee:      "Колено",
  shin:      "Голень",
  foot:      "Стопа и лодыжка",
  other:     "Прочее",
};

// Map zone id prefix → group key
function getGroup(id: string): string {
  const bare = id.replace(/^[a-z]+-/, "").replace(/-(r|l|prав|лев)$/, "");
  if (/head|neck|face|crown|front|temple|occ/.test(id)) return "head";
  if (/clavicle|chest|rib|sternal|sternum|breast|nipple|abdomen|groin|pubic/.test(id)) return "chest";
  if (/lumbar|sacrum|spine|scap|subscap|interscap|supscap|lats|back|neck-b/.test(id)) return "back";
  if (/shoulder|deltoid|arm-upper|arm-mid|arm-low|bicep|tricep|humer/.test(id)) return "shoulder";
  if (/elbow|forearm|wrist|hand|finger|palm|thumb/.test(id)) return "forearm";
  if (/hip|pelvis|groin|glute|inguinal/.test(id)) return "hip";
  if (/thigh/.test(id)) return "thigh";
  if (/patella|knee|popliteal/.test(id)) return "knee";
  if (/shin|calf|tibia|fibula|peroneus/.test(id)) return "shin";
  if (/foot|ankle|heel|plantar|calcaneus|toe/.test(id)) return "foot";
  return "other";
}

interface ZonePickerProps {
  view: BodyView;
  onSelect: (zoneId: string, zoneName: string) => void;
  onCancel: () => void;
}

export function ZonePicker({ view, onSelect, onCancel }: ZonePickerProps) {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // For side views — use front zones list (same zones, mapped to side view)
  // This avoids duplicate names from the sl-/sr- remapped copies
  const sourceZones = (view === "left" || view === "right") ? frontZones : getZonesForView(view);
  const zones = sourceZones;

  // Build groups
  const grouped = useMemo(() => {
    const map: Record<string, { id: string; name: string }[]> = {};
    for (const z of zones) {
      const g = getGroup(z.id);
      if (!map[g]) map[g] = [];
      map[g].push({ id: z.id, name: z.name });
    }
    // Sort zones within each group by name
    for (const g of Object.keys(map)) {
      map[g].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    }
    return map;
  }, [zones]);

  // Filtered flat list when searching
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return zones
      .filter(z => z.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [search, zones]);

  const toggleGroup = (g: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
  };

  const groupOrder = [
    "head", "chest", "back", "shoulder", "forearm",
    "hip", "thigh", "knee", "shin", "foot", "other"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full sm:max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold">Выберите место боли</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 flex-shrink-0">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoFocus
          />
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-2 pb-4">
          {searchResults ? (
            // Flat search results
            <div className="flex flex-col gap-0.5">
              {searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Ничего не найдено</p>
              )}
              {searchResults.map(z => (
                <ZoneItem key={z.id} name={z.name} onClick={() => onSelect(z.id, z.name)} />
              ))}
            </div>
          ) : (
            // Grouped accordion
            <div className="flex flex-col gap-1 mt-1">
              {groupOrder.map(gKey => {
                const items = grouped[gKey];
                if (!items || items.length === 0) return null;
                const isOpen = openGroups.has(gKey);
                return (
                  <div key={gKey} className="rounded-lg overflow-hidden border border-border/40">
                    {/* Group header */}
                    <button
                      onClick={() => toggleGroup(gKey)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/60 transition-colors text-left"
                    >
                      <span className="text-sm font-medium">{GROUP_LABELS[gKey]}</span>
                      <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
                        <span className="bg-muted px-1.5 py-0.5 rounded-full">{items.length}</span>
                        <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                      </span>
                    </button>
                    {/* Group items */}
                    {isOpen && (
                      <div className="flex flex-col gap-0.5 p-1 bg-background">
                        {items.map(z => (
                          <ZoneItem key={z.id} name={z.name} onClick={() => onSelect(z.id, z.name)} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZoneItem({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-primary/10 active:bg-primary/20 transition-colors"
    >
      {name}
    </button>
  );
}
