import type { BodyView } from "@shared/schema";

export interface AnatomicalZone {
  id: string;
  name: string;
  view: BodyView;
  // SVG polygon points as percentage of image width/height: [[x%,y%], ...]
  // Used both for hit-testing and rendering the highlight overlay.
  polygon: [number, number][];
  structures: AnatomicalStructure[];
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  type: "muscle" | "tendon" | "ligament" | "organ" | "nerve" | "bone" | "joint";
}

// ─── helpers ─────────────────────────────────────────────────────────────────
// Convert pixel coords to % for a given image size
// All polygons were drawn on: front=530×770, back=547×799,
// left/right reuse back image scaled to fit.
function p(pts: [number, number][], W: number, H: number): [number, number][] {
  return pts.map(([x, y]) => [
    Math.round((x / W) * 1000) / 10,
    Math.round((y / H) * 1000) / 10,
  ]);
}
const pf = (pts: [number, number][]) => p(pts, 530, 770);   // front
const pb = (pts: [number, number][]) => p(pts, 547, 799);   // back

// ─── point-in-polygon (ray-casting) ──────────────────────────────────────────
export function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// polygon area (for "smallest wins" tiebreaker)
function polyArea(poly: [number, number][]): number {
  let area = 0;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  }
  return Math.abs(area / 2);
}

// ─── FRONT VIEW ZONES (diagram 21134.png 530×770) ────────────────────────────
export const frontZones: AnatomicalZone[] = [
  // HEAD
  { id: "f-head-crown", name: "Теменная область", view: "front",
    polygon: pf([[210,22],[320,22],[325,55],[260,68],[195,55]]),
    structures: [
      { id: "frontalis", name: "Лобная мышца", type: "muscle" },
      { id: "skull-top", name: "Теменная кость", type: "bone" },
    ]},
  { id: "f-head-front", name: "Лобная область", view: "front",
    polygon: pf([[205,55],[325,55],[320,92],[240,100],[200,92]]),
    structures: [
      { id: "frontalis2", name: "Лобная мышца", type: "muscle" },
      { id: "skull-front", name: "Лобная кость", type: "bone" },
    ]},
  { id: "f-neck", name: "Шея", view: "front",
    polygon: pf([[238,100],[292,100],[288,135],[242,135]]),
    structures: [
      { id: "scm", name: "Грудино-ключично-сосцевидная мышца", type: "muscle" },
      { id: "cervical-spine", name: "Шейный отдел позвоночника", type: "bone" },
      { id: "trachea", name: "Трахея", type: "organ" },
      { id: "thyroid", name: "Щитовидная железа", type: "organ" },
    ]},

  // SHOULDERS / CHEST
  { id: "f-clavicle", name: "Область ключицы", view: "front",
    polygon: pf([[200,120],[330,120],[335,138],[200,138]]),
    structures: [
      { id: "clavicle", name: "Ключица", type: "bone" },
      { id: "ac-joint", name: "Акромиально-ключичный сустав", type: "joint" },
    ]},
  { id: "f-shoulder-r", name: "Плечевой сустав (прав.)", view: "front",
    polygon: pf([[135,125],[195,125],[200,170],[135,170]]),
    structures: [
      { id: "deltoid-r", name: "Дельтовидная мышца", type: "muscle" },
      { id: "shoulder-j-r", name: "Плечевой сустав", type: "joint" },
      { id: "rotator-r", name: "Ротаторная манжета", type: "tendon" },
    ]},
  { id: "f-shoulder-l", name: "Плечевой сустав (лев.)", view: "front",
    polygon: pf([[335,125],[395,125],[395,170],[335,170]]),
    structures: [
      { id: "deltoid-l", name: "Дельтовидная мышца", type: "muscle" },
      { id: "shoulder-j-l", name: "Плечевой сустав", type: "joint" },
      { id: "rotator-l", name: "Ротаторная манжета", type: "tendon" },
    ]},
  { id: "f-sternum", name: "Область грудины", view: "front",
    polygon: pf([[232,138],[298,138],[298,165],[232,165]]),
    structures: [
      { id: "sternum", name: "Грудина", type: "bone" },
      { id: "pec-minor", name: "Малая грудная мышца", type: "muscle" },
    ]},
  { id: "f-chest-r", name: "Область большой грудной мышцы (прав.)", view: "front",
    polygon: pf([[160,145],[238,145],[238,235],[160,235]]),
    structures: [
      { id: "pec-major-r", name: "Большая грудная мышца", type: "muscle" },
      { id: "heart", name: "Сердце", type: "organ" },
      { id: "lung-r", name: "Лёгкое", type: "organ" },
    ]},
  { id: "f-chest-l", name: "Область большой грудной мышцы (лев.)", view: "front",
    polygon: pf([[292,145],[370,145],[370,235],[292,235]]),
    structures: [
      { id: "pec-major-l", name: "Большая грудная мышца", type: "muscle" },
      { id: "lung-l", name: "Лёгкое", type: "organ" },
      { id: "ribs-l", name: "Рёбра", type: "bone" },
    ]},
  { id: "f-axilla-r", name: "Подмышечная впадина (прав.)", view: "front",
    polygon: pf([[155,165],[200,165],[200,210],[155,210]]),
    structures: [
      { id: "axillary-n-r", name: "Подмышечные лимфоузлы", type: "organ" },
      { id: "axillary-a-r", name: "Подмышечная артерия", type: "organ" },
    ]},
  { id: "f-axilla-l", name: "Подмышечная впадина (лев.)", view: "front",
    polygon: pf([[330,165],[375,165],[375,210],[330,210]]),
    structures: [
      { id: "axillary-n-l", name: "Подмышечные лимфоузлы", type: "organ" },
    ]},
  { id: "f-ribs", name: "Область рёберной дуги", view: "front",
    polygon: pf([[162,235],[368,235],[368,275],[162,275]]),
    structures: [
      { id: "ribs-arch", name: "Рёберная дуга", type: "bone" },
      { id: "intercostal", name: "Межрёберные мышцы", type: "muscle" },
      { id: "liver", name: "Печень", type: "organ" },
    ]},
  { id: "f-abdomen-side-r", name: "Боковая поверхность живота (прав.)", view: "front",
    polygon: pf([[150,255],[175,255],[175,365],[150,365]]),
    structures: [
      { id: "oblique-r", name: "Косые мышцы живота", type: "muscle" },
      { id: "kidney-r", name: "Почка", type: "organ" },
    ]},
  { id: "f-abdomen-side-l", name: "Боковая поверхность живота (лев.)", view: "front",
    polygon: pf([[355,255],[380,255],[380,365],[355,365]]),
    structures: [
      { id: "oblique-l", name: "Косые мышцы живота", type: "muscle" },
      { id: "spleen", name: "Селезёнка", type: "organ" },
    ]},
  { id: "f-abdomen", name: "Передняя поверхность живота", view: "front",
    polygon: pf([[175,255],[355,255],[355,365],[175,365]]),
    structures: [
      { id: "rectus-abd", name: "Прямая мышца живота", type: "muscle" },
      { id: "small-int", name: "Тонкий кишечник", type: "organ" },
      { id: "large-int", name: "Толстый кишечник", type: "organ" },
      { id: "bladder", name: "Мочевой пузырь", type: "organ" },
    ]},
  { id: "f-groin-r", name: "Лобковая паховая область (прав.)", view: "front",
    polygon: pf([[162,365],[262,365],[262,415],[162,415]]),
    structures: [
      { id: "inguinal-r", name: "Паховая связка", type: "ligament" },
      { id: "adductor-r", name: "Приводящие мышцы", type: "muscle" },
    ]},
  { id: "f-groin-l", name: "Лобковая паховая область (лев.)", view: "front",
    polygon: pf([[262,365],[368,365],[368,415],[262,415]]),
    structures: [
      { id: "inguinal-l", name: "Паховая связка", type: "ligament" },
      { id: "adductor-l", name: "Приводящие мышцы", type: "muscle" },
    ]},

  // UPPER ARM right (screen-left = patient right)
  { id: "f-arm-upper-r", name: "В.треть плеча (прав.)", view: "front",
    polygon: pf([[100,168],[148,168],[148,210],[100,210]]),
    structures: [
      { id: "biceps-upper-r", name: "Бицепс", type: "muscle" },
      { id: "humerus-upper-r", name: "Плечевая кость", type: "bone" },
    ]},
  { id: "f-arm-mid-r", name: "С.треть плеча (прав.)", view: "front",
    polygon: pf([[98,210],[147,210],[147,252],[98,252]]),
    structures: [
      { id: "biceps-mid-r", name: "Бицепс", type: "muscle" },
      { id: "triceps-mid-r", name: "Трицепс", type: "muscle" },
    ]},
  { id: "f-arm-lower-r", name: "Н.треть плеча (прав.)", view: "front",
    polygon: pf([[97,252],[147,252],[147,290],[97,290]]),
    structures: [
      { id: "biceps-low-r", name: "Бицепс", type: "muscle" },
      { id: "triceps-low-r", name: "Трицепс", type: "muscle" },
    ]},
  // UPPER ARM left
  { id: "f-arm-upper-l", name: "В.треть плеча (лев.)", view: "front",
    polygon: pf([[382,168],[430,168],[430,210],[382,210]]),
    structures: [
      { id: "biceps-upper-l", name: "Бицепс", type: "muscle" },
      { id: "humerus-upper-l", name: "Плечевая кость", type: "bone" },
    ]},
  { id: "f-arm-mid-l", name: "С.треть плеча (лев.)", view: "front",
    polygon: pf([[383,210],[430,210],[430,252],[383,252]]),
    structures: [
      { id: "biceps-mid-l", name: "Бицепс", type: "muscle" },
    ]},
  { id: "f-arm-lower-l", name: "Н.треть плеча (лев.)", view: "front",
    polygon: pf([[383,252],[430,252],[430,290],[383,290]]),
    structures: [
      { id: "biceps-low-l", name: "Бицепс", type: "muscle" },
    ]},

  // ELBOW
  { id: "f-elbow-r", name: "Локтевой сгиб (прав.)", view: "front",
    polygon: pf([[97,290],[148,290],[148,322],[97,322]]),
    structures: [
      { id: "elbow-j-r", name: "Локтевой сустав", type: "joint" },
      { id: "biceps-ten-r", name: "Сухожилие бицепса", type: "tendon" },
      { id: "ulnar-n-r", name: "Локтевой нерв", type: "nerve" },
    ]},
  { id: "f-elbow-l", name: "Локтевой сгиб (лев.)", view: "front",
    polygon: pf([[382,290],[432,290],[432,322],[382,322]]),
    structures: [
      { id: "elbow-j-l", name: "Локтевой сустав", type: "joint" },
      { id: "biceps-ten-l", name: "Сухожилие бицепса", type: "tendon" },
    ]},

  // FOREARM right
  { id: "f-forearm-upper-r", name: "В.треть предплечья (прав.)", view: "front",
    polygon: pf([[98,322],[146,322],[146,358],[98,358]]),
    structures: [
      { id: "brachio-r", name: "Плечелучевая мышца", type: "muscle" },
      { id: "radius-upper-r", name: "Лучевая кость", type: "bone" },
    ]},
  { id: "f-forearm-mid-r", name: "С.треть предплечья (прав.)", view: "front",
    polygon: pf([[100,358],[144,358],[144,393],[100,393]]),
    structures: [
      { id: "flexor-r", name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "ulna-r", name: "Локтевая кость", type: "bone" },
    ]},
  { id: "f-forearm-lower-r", name: "Н.треть предплечья (прав.)", view: "front",
    polygon: pf([[102,393],[142,393],[142,422],[102,422]]),
    structures: [
      { id: "ext-dig-r", name: "Разгибатель пальцев", type: "muscle" },
      { id: "radius-low-r", name: "Лучевая кость (нижн.)", type: "bone" },
    ]},
  // FOREARM left
  { id: "f-forearm-upper-l", name: "В.треть предплечья (лев.)", view: "front",
    polygon: pf([[384,322],[432,322],[432,358],[384,358]]),
    structures: [
      { id: "brachio-l", name: "Плечелучевая мышца", type: "muscle" },
    ]},
  { id: "f-forearm-mid-l", name: "С.треть предплечья (лев.)", view: "front",
    polygon: pf([[386,358],[430,358],[430,393],[386,393]]),
    structures: [
      { id: "flexor-l", name: "Лучевой сгибатель запястья", type: "muscle" },
    ]},
  { id: "f-forearm-lower-l", name: "Н.треть предплечья (лев.)", view: "front",
    polygon: pf([[388,393],[428,393],[428,422],[388,422]]),
    structures: [
      { id: "ext-dig-l", name: "Разгибатель пальцев", type: "muscle" },
    ]},

  // WRIST/HAND
  { id: "f-wrist-r", name: "Запястье (прав.)", view: "front",
    polygon: pf([[104,422],[140,422],[140,450],[104,450]]),
    structures: [
      { id: "wrist-j-r", name: "Лучезапястный сустав", type: "joint" },
      { id: "carpal-r", name: "Карпальный канал", type: "bone" },
      { id: "median-n-r", name: "Срединный нерв", type: "nerve" },
    ]},
  { id: "f-hand-r", name: "Ладонь (прав.)", view: "front",
    polygon: pf([[100,450],[144,450],[144,490],[100,490]]),
    structures: [
      { id: "palmar-r", name: "Ладонный апоневроз", type: "tendon" },
      { id: "flex-ten-r", name: "Сухожилия сгибателей", type: "tendon" },
    ]},
  { id: "f-wrist-l", name: "Запястье (лев.)", view: "front",
    polygon: pf([[390,422],[426,422],[426,450],[390,450]]),
    structures: [
      { id: "wrist-j-l", name: "Лучезапястный сустав", type: "joint" },
    ]},
  { id: "f-hand-l", name: "Ладонь (лев.)", view: "front",
    polygon: pf([[386,450],[430,450],[430,490],[386,490]]),
    structures: [
      { id: "flex-ten-l", name: "Сухожилия сгибателей", type: "tendon" },
    ]},

  // THIGH right (screen-left)
  { id: "f-thigh-upper-r", name: "В.треть бедра (прав.)", view: "front",
    polygon: pf([[158,385],[268,385],[268,428],[158,428]]),
    structures: [
      { id: "quad-upper-r", name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "femur-upper-r", name: "Бедренная кость", type: "bone" },
      { id: "femoral-a-r", name: "Бедренная артерия", type: "organ" },
    ]},
  { id: "f-thigh-mid-r", name: "С.треть бедра (прав.)", view: "front",
    polygon: pf([[160,428],[266,428],[266,468],[160,468]]),
    structures: [
      { id: "quad-mid-r", name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "vastus-lat-r", name: "Латеральная широкая мышца", type: "muscle" },
    ]},
  { id: "f-thigh-lower-r", name: "Н.треть бедра (прав.)", view: "front",
    polygon: pf([[163,468],[262,468],[262,506],[163,506]]),
    structures: [
      { id: "quad-low-r", name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "sartorius-r", name: "Портняжная мышца", type: "muscle" },
    ]},
  // THIGH left (screen-right)
  { id: "f-thigh-upper-l", name: "В.треть бедра (лев.)", view: "front",
    polygon: pf([[268,385],[378,385],[378,428],[268,428]]),
    structures: [
      { id: "quad-upper-l", name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "femur-upper-l", name: "Бедренная кость", type: "bone" },
    ]},
  { id: "f-thigh-mid-l", name: "С.треть бедра (лев.)", view: "front",
    polygon: pf([[268,428],[374,428],[374,468],[268,468]]),
    structures: [
      { id: "quad-mid-l", name: "Четырёхглавая мышца бедра", type: "muscle" },
    ]},
  { id: "f-thigh-lower-l", name: "Н.треть бедра (лев.)", view: "front",
    polygon: pf([[268,468],[370,468],[370,506],[268,506]]),
    structures: [
      { id: "quad-low-l", name: "Четырёхглавая мышца бедра", type: "muscle" },
    ]},

  // KNEE
  { id: "f-patella-r", name: "Надколенная чашечка (прав.)", view: "front",
    polygon: pf([[165,506],[262,506],[262,536],[165,536]]),
    structures: [
      { id: "patella-r", name: "Надколенник", type: "bone" },
      { id: "patellar-ten-r", name: "Связка надколенника", type: "tendon" },
      { id: "quad-ten-r", name: "Сухожилие квадрицепса", type: "tendon" },
    ]},
  { id: "f-knee-r", name: "Область коленного сустава (прав.)", view: "front",
    polygon: pf([[163,536],[262,536],[262,572],[163,572]]),
    structures: [
      { id: "knee-j-r", name: "Коленный сустав", type: "joint" },
      { id: "acl-r", name: "Передняя крестообразная связка", type: "ligament" },
      { id: "mcl-r", name: "Медиальная связка", type: "ligament" },
      { id: "meniscus-r", name: "Мениск", type: "joint" },
    ]},
  { id: "f-patella-l", name: "Надколенная чашечка (лев.)", view: "front",
    polygon: pf([[268,506],[365,506],[365,536],[268,536]]),
    structures: [
      { id: "patella-l", name: "Надколенник", type: "bone" },
      { id: "patellar-ten-l", name: "Связка надколенника", type: "tendon" },
    ]},
  { id: "f-knee-l", name: "Область коленного сустава (лев.)", view: "front",
    polygon: pf([[268,536],[367,536],[367,572],[268,572]]),
    structures: [
      { id: "knee-j-l", name: "Коленный сустав", type: "joint" },
      { id: "acl-l", name: "Передняя крестообразная связка", type: "ligament" },
      { id: "meniscus-l", name: "Мениск", type: "joint" },
    ]},

  // SHIN right
  { id: "f-shin-upper-r", name: "В.треть голени (прав.)", view: "front",
    polygon: pf([[168,572],[255,572],[255,612],[168,612]]),
    structures: [
      { id: "tibialis-r", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-upper-r", name: "Большеберцовая кость", type: "bone" },
    ]},
  { id: "f-shin-mid-r", name: "С.треть голени (прав.)", view: "front",
    polygon: pf([[172,612],[252,612],[252,652],[172,652]]),
    structures: [
      { id: "tibialis-mid-r", name: "Большеберцовая мышца", type: "muscle" },
      { id: "peroneus-r", name: "Малоберцовые мышцы", type: "muscle" },
    ]},
  { id: "f-shin-lower-r", name: "Н.треть голени (прав.)", view: "front",
    polygon: pf([[175,652],[248,652],[248,692],[175,692]]),
    structures: [
      { id: "tibialis-low-r", name: "Большеберцовая мышца", type: "muscle" },
      { id: "ankle-ten-r", name: "Сухожилия разгибателей", type: "tendon" },
    ]},
  // SHIN left
  { id: "f-shin-upper-l", name: "В.треть голени (лев.)", view: "front",
    polygon: pf([[272,572],[362,572],[362,612],[272,612]]),
    structures: [
      { id: "tibialis-l", name: "Передняя большеберцовая мышца", type: "muscle" },
    ]},
  { id: "f-shin-mid-l", name: "С.треть голени (лев.)", view: "front",
    polygon: pf([[276,612],[358,612],[358,652],[276,652]]),
    structures: [
      { id: "peroneus-l", name: "Малоберцовые мышцы", type: "muscle" },
    ]},
  { id: "f-shin-lower-l", name: "Н.треть голени (лев.)", view: "front",
    polygon: pf([[280,652],[354,652],[354,692],[280,692]]),
    structures: [
      { id: "ankle-ten-l", name: "Сухожилия разгибателей", type: "tendon" },
    ]},

  // FOOT
  { id: "f-foot-r", name: "Стопа (прав.)", view: "front",
    polygon: pf([[160,692],[262,692],[262,762],[160,762]]),
    structures: [
      { id: "ankle-j-r", name: "Голеностопный сустав", type: "joint" },
      { id: "achilles-r", name: "Ахиллово сухожилие", type: "tendon" },
      { id: "plantar-r", name: "Подошвенная фасция", type: "tendon" },
      { id: "calcaneus-r", name: "Пяточная кость", type: "bone" },
    ]},
  { id: "f-foot-l", name: "Стопа (лев.)", view: "front",
    polygon: pf([[268,692],[370,692],[370,762],[268,762]]),
    structures: [
      { id: "ankle-j-l", name: "Голеностопный сустав", type: "joint" },
      { id: "achilles-l", name: "Ахиллово сухожилие", type: "tendon" },
      { id: "calcaneus-l", name: "Пяточная кость", type: "bone" },
    ]},
  { id: "f-ankle-r", name: "Внутренняя лодыжка (прав.)", view: "front",
    polygon: pf([[248,685],[268,685],[268,715],[248,715]]),
    structures: [
      { id: "medial-mall-r", name: "Медиальная лодыжка", type: "bone" },
    ]},
  { id: "f-ankle-l", name: "Внутренняя лодыжка (лев.)", view: "front",
    polygon: pf([[264,685],[284,685],[284,715],[264,715]]),
    structures: [
      { id: "medial-mall-l", name: "Медиальная лодыжка", type: "bone" },
    ]},
];

// ─── BACK VIEW ZONES (diagram 21133.png 547×799) ─────────────────────────────
export const backZones: AnatomicalZone[] = [
  { id: "b-head-crown", name: "Теменная область", view: "back",
    polygon: pb([[215,22],[330,22],[335,60],[270,72],[210,60]]),
    structures: [{ id: "skull-b", name: "Теменная кость", type: "bone" }]},
  { id: "b-head-occ", name: "Затылочная область", view: "back",
    polygon: pb([[208,60],[335,60],[330,98],[218,98]]),
    structures: [
      { id: "occipitalis", name: "Затылочная мышца", type: "muscle" },
      { id: "suboccipital", name: "Подзатылочные мышцы", type: "muscle" },
    ]},
  { id: "b-neck", name: "Задняя поверхность шеи", view: "back",
    polygon: pb([[238,100],[308,100],[305,138],[242,138]]),
    structures: [
      { id: "trapez-upper-b", name: "Верхняя трапециевидная мышца", type: "muscle" },
      { id: "cervical-b", name: "Шейный отдел позвоночника", type: "bone" },
    ]},

  // SHOULDER GIRDLE
  { id: "b-shoulder-r", name: "Область плечевого сустава (прав.)", view: "back",
    polygon: pb([[140,128],[200,128],[205,175],[140,175]]),
    structures: [
      { id: "deltoid-post-r", name: "Задняя дельтовидная мышца", type: "muscle" },
      { id: "infraspinatus-r", name: "Подостная мышца", type: "muscle" },
    ]},
  { id: "b-shoulder-l", name: "Область плечевого сустава (лев.)", view: "back",
    polygon: pb([[345,128],[408,128],[408,175],[345,175]]),
    structures: [
      { id: "deltoid-post-l", name: "Задняя дельтовидная мышца", type: "muscle" },
      { id: "infraspinatus-l", name: "Подостная мышца", type: "muscle" },
    ]},
  { id: "b-supscap", name: "Надлопаточная область", view: "back",
    polygon: pb([[205,128],[345,128],[345,168],[205,168]]),
    structures: [
      { id: "trapez-upper-s", name: "Верхняя трапециевидная мышца", type: "muscle" },
    ]},
  { id: "b-interscap", name: "Межлопаточная область", view: "back",
    polygon: pb([[210,168],[340,168],[340,270],[210,270]]),
    structures: [
      { id: "rhomboids", name: "Ромбовидные мышцы", type: "muscle" },
      { id: "trapez-mid", name: "Средняя трапециевидная мышца", type: "muscle" },
      { id: "thoracic-spine", name: "Грудной отдел позвоночника", type: "bone" },
    ]},
  { id: "b-scap-r", name: "Лопаточная область (прав.)", view: "back",
    polygon: pb([[168,172],[228,172],[228,268],[168,268]]),
    structures: [
      { id: "scapula-r", name: "Лопатка", type: "bone" },
      { id: "infraspinatus-s-r", name: "Подостная мышца", type: "muscle" },
    ]},
  { id: "b-scap-l", name: "Лопаточная область (лев.)", view: "back",
    polygon: pb([[318,172],[378,172],[378,268],[318,268]]),
    structures: [
      { id: "scapula-l", name: "Лопатка", type: "bone" },
      { id: "infraspinatus-s-l", name: "Подостная мышца", type: "muscle" },
    ]},
  { id: "b-subscap-r", name: "Подлопаточная область (прав.)", view: "back",
    polygon: pb([[165,268],[228,268],[228,322],[165,322]]),
    structures: [
      { id: "lats-upper-r", name: "Широчайшая мышца спины", type: "muscle" },
    ]},
  { id: "b-subscap-l", name: "Подлопаточная область (лев.)", view: "back",
    polygon: pb([[318,268],[382,268],[382,322],[318,322]]),
    structures: [
      { id: "lats-upper-l", name: "Широчайшая мышца спины", type: "muscle" },
    ]},
  { id: "b-lumbar", name: "Поясничная область", view: "back",
    polygon: pb([[195,322],[352,322],[352,405],[195,405]]),
    structures: [
      { id: "erector-spinae", name: "Мышца-выпрямитель позвоночника", type: "muscle" },
      { id: "multifidus", name: "Многораздельная мышца", type: "muscle" },
      { id: "lumbar-spine", name: "Поясничный отдел позвоночника", type: "bone" },
      { id: "kidneys", name: "Почки", type: "organ" },
    ]},
  { id: "b-sacrum", name: "Область крестца", view: "back",
    polygon: pb([[218,405],[330,405],[330,445],[218,445]]),
    structures: [
      { id: "sacrum", name: "Крестец", type: "bone" },
      { id: "sciatic-n", name: "Седалищный нерв", type: "nerve" },
    ]},
  { id: "b-spine", name: "Область позвоночного столба", view: "back",
    polygon: pb([[248,138],[298,138],[298,445],[248,445]]),
    structures: [
      { id: "spine", name: "Позвоночный столб", type: "bone" },
    ]},

  // GLUTES
  { id: "b-glute-r", name: "Ягодица (прав.)", view: "back",
    polygon: pb([[168,380],[268,380],[268,498],[168,498]]),
    structures: [
      { id: "glut-max-r", name: "Большая ягодичная мышца", type: "muscle" },
      { id: "glut-med-r", name: "Средняя ягодичная мышца", type: "muscle" },
      { id: "piriformis-r", name: "Грушевидная мышца", type: "muscle" },
    ]},
  { id: "b-glute-l", name: "Ягодица (лев.)", view: "back",
    polygon: pb([[278,380],[378,380],[378,498],[278,498]]),
    structures: [
      { id: "glut-max-l", name: "Большая ягодичная мышца", type: "muscle" },
      { id: "glut-med-l", name: "Средняя ягодичная мышца", type: "muscle" },
    ]},

  // UPPER ARM back
  { id: "b-arm-upper-r", name: "В.треть плеча (прав.)", view: "back",
    polygon: pb([[95,172],[142,172],[142,212],[95,212]]),
    structures: [{ id: "triceps-upper-r", name: "Трицепс", type: "muscle" }]},
  { id: "b-arm-mid-r", name: "С.треть плеча (прав.)", view: "back",
    polygon: pb([[93,212],[141,212],[141,254],[93,254]]),
    structures: [{ id: "triceps-mid-r", name: "Трицепс", type: "muscle" }]},
  { id: "b-arm-lower-r", name: "Н.треть плеча (прав.)", view: "back",
    polygon: pb([[92,254],[140,254],[140,292],[92,292]]),
    structures: [{ id: "triceps-low-r", name: "Трицепс", type: "muscle" }]},
  { id: "b-arm-upper-l", name: "В.треть плеча (лев.)", view: "back",
    polygon: pb([[404,172],[452,172],[452,212],[404,212]]),
    structures: [{ id: "triceps-upper-l", name: "Трицепс", type: "muscle" }]},
  { id: "b-arm-mid-l", name: "С.треть плеча (лев.)", view: "back",
    polygon: pb([[406,212],[452,212],[452,254],[406,254]]),
    structures: [{ id: "triceps-mid-l", name: "Трицепс", type: "muscle" }]},
  { id: "b-arm-lower-l", name: "Н.треть плеча (лев.)", view: "back",
    polygon: pb([[406,254],[452,254],[452,292],[406,292]]),
    structures: [{ id: "triceps-low-l", name: "Трицепс", type: "muscle" }]},

  // ELBOW back
  { id: "b-elbow-r", name: "Область локтевого сустава (прав.)", view: "back",
    polygon: pb([[91,292],[140,292],[140,328],[91,328]]),
    structures: [
      { id: "olecranon-r", name: "Локтевой отросток", type: "bone" },
      { id: "triceps-ten-r", name: "Сухожилие трицепса", type: "tendon" },
    ]},
  { id: "b-elbow-l", name: "Область локтевого сустава (лев.)", view: "back",
    polygon: pb([[406,292],[454,292],[454,328],[406,328]]),
    structures: [
      { id: "olecranon-l", name: "Локтевой отросток", type: "bone" },
    ]},

  // FOREARM back
  { id: "b-forearm-upper-r", name: "В.треть предплечья (прав.)", view: "back",
    polygon: pb([[92,328],[140,328],[140,365],[92,365]]),
    structures: [{ id: "ext-carpi-r", name: "Разгибатели запястья", type: "muscle" }]},
  { id: "b-forearm-mid-r", name: "С.треть предплечья (прав.)", view: "back",
    polygon: pb([[94,365],[138,365],[138,400],[94,400]]),
    structures: [{ id: "ext-dig-b-r", name: "Разгибатель пальцев", type: "muscle" }]},
  { id: "b-forearm-lower-r", name: "Н.треть предплечья (прав.)", view: "back",
    polygon: pb([[96,400],[136,400],[136,430],[96,430]]),
    structures: [{ id: "ext-ret-r", name: "Удерживатель разгибателей", type: "tendon" }]},
  { id: "b-forearm-upper-l", name: "В.треть предплечья (лев.)", view: "back",
    polygon: pb([[406,328],[454,328],[454,365],[406,365]]),
    structures: [{ id: "ext-carpi-l", name: "Разгибатели запястья", type: "muscle" }]},
  { id: "b-forearm-mid-l", name: "С.треть предплечья (лев.)", view: "back",
    polygon: pb([[408,365],[452,365],[452,400],[408,400]]),
    structures: [{ id: "ext-dig-b-l", name: "Разгибатель пальцев", type: "muscle" }]},
  { id: "b-forearm-lower-l", name: "Н.треть предплечья (лев.)", view: "back",
    polygon: pb([[410,400],[450,400],[450,430],[410,430]]),
    structures: [{ id: "ext-ret-l", name: "Удерживатель разгибателей", type: "tendon" }]},

  // WRIST/HAND back
  { id: "b-wrist-r", name: "Запястье (прав.)", view: "back",
    polygon: pb([[98,430],[135,430],[135,458],[98,458]]),
    structures: [{ id: "wrist-b-r", name: "Лучезапястный сустав", type: "joint" }]},
  { id: "b-hand-r", name: "Тыльная сторона кисти (прав.)", view: "back",
    polygon: pb([[95,458],[138,458],[138,500],[95,500]]),
    structures: [{ id: "dorsal-r", name: "Разгибатели пальцев", type: "tendon" }]},
  { id: "b-wrist-l", name: "Запястье (лев.)", view: "back",
    polygon: pb([[412,430],[449,430],[449,458],[412,458]]),
    structures: [{ id: "wrist-b-l", name: "Лучезапястный сустав", type: "joint" }]},
  { id: "b-hand-l", name: "Тыльная сторона кисти (лев.)", view: "back",
    polygon: pb([[410,458],[452,458],[452,500],[410,500]]),
    structures: [{ id: "dorsal-l", name: "Разгибатели пальцев", type: "tendon" }]},

  // HAMSTRINGS / POSTERIOR THIGH
  { id: "b-thigh-upper-r", name: "В.треть бедра (прав.)", view: "back",
    polygon: pb([[162,498],[264,498],[264,546],[162,546]]),
    structures: [
      { id: "biceps-fem-r", name: "Двуглавая мышца бедра", type: "muscle" },
      { id: "semit-r", name: "Полусухожильная мышца", type: "muscle" },
    ]},
  { id: "b-thigh-mid-r", name: "С.треть бедра (прав.)", view: "back",
    polygon: pb([[165,546],[262,546],[262,590],[165,590]]),
    structures: [{ id: "hamstring-mid-r", name: "Мышцы задней поверхности бедра", type: "muscle" }]},
  { id: "b-thigh-lower-r", name: "Н.треть бедра (прав.)", view: "back",
    polygon: pb([[168,590],[260,590],[260,630],[168,630]]),
    structures: [{ id: "hamstring-low-r", name: "Мышцы задней поверхности бедра", type: "muscle" }]},
  { id: "b-thigh-upper-l", name: "В.треть бедра (лев.)", view: "back",
    polygon: pb([[280,498],[382,498],[382,546],[280,546]]),
    structures: [
      { id: "biceps-fem-l", name: "Двуглавая мышца бедра", type: "muscle" },
    ]},
  { id: "b-thigh-mid-l", name: "С.треть бедра (лев.)", view: "back",
    polygon: pb([[280,546],[378,546],[378,590],[280,590]]),
    structures: [{ id: "hamstring-mid-l", name: "Мышцы задней поверхности бедра", type: "muscle" }]},
  { id: "b-thigh-lower-l", name: "Н.треть бедра (лев.)", view: "back",
    polygon: pb([[280,590],[375,590],[375,630],[280,630]]),
    structures: [{ id: "hamstring-low-l", name: "Мышцы задней поверхности бедра", type: "muscle" }]},

  // POPLITEAL
  { id: "b-popliteal-r", name: "Подколенная ямка (прав.)", view: "back",
    polygon: pb([[165,630],[260,630],[260,672],[165,672]]),
    structures: [
      { id: "popliteal-r", name: "Подколенная ямка", type: "joint" },
      { id: "pcl-r", name: "Задняя крестообразная связка", type: "ligament" },
      { id: "gastroc-top-r", name: "Икроножная мышца (верх)", type: "muscle" },
    ]},
  { id: "b-popliteal-l", name: "Подколенная ямка (лев.)", view: "back",
    polygon: pb([[280,630],[375,630],[375,672],[280,672]]),
    structures: [
      { id: "popliteal-l", name: "Подколенная ямка", type: "joint" },
      { id: "gastroc-top-l", name: "Икроножная мышца (верх)", type: "muscle" },
    ]},

  // CALF
  { id: "b-calf-upper-r", name: "В.треть голени (прав.)", view: "back",
    polygon: pb([[170,672],[258,672],[258,715],[170,715]]),
    structures: [
      { id: "gastroc-r", name: "Икроножная мышца", type: "muscle" },
      { id: "soleus-r", name: "Камбаловидная мышца", type: "muscle" },
    ]},
  { id: "b-calf-mid-r", name: "С.треть голени (прав.)", view: "back",
    polygon: pb([[172,715],[254,715],[254,748],[172,748]]),
    structures: [{ id: "gastroc-mid-r", name: "Икроножная мышца", type: "muscle" }]},
  { id: "b-calf-lower-r", name: "Н.треть голени (прав.)", view: "back",
    polygon: pb([[175,748],[250,748],[250,778],[175,778]]),
    structures: [{ id: "achilles-above-r", name: "Ахиллово сухожилие", type: "tendon" }]},
  { id: "b-calf-upper-l", name: "В.треть голени (лев.)", view: "back",
    polygon: pb([[280,672],[370,672],[370,715],[280,715]]),
    structures: [{ id: "gastroc-l", name: "Икроножная мышца", type: "muscle" }]},
  { id: "b-calf-mid-l", name: "С.треть голени (лев.)", view: "back",
    polygon: pb([[282,715],[368,715],[368,748],[282,748]]),
    structures: [{ id: "gastroc-mid-l", name: "Икроножная мышца", type: "muscle" }]},
  { id: "b-calf-lower-l", name: "Н.треть голени (лев.)", view: "back",
    polygon: pb([[285,748],[365,748],[365,778],[285,778]]),
    structures: [{ id: "achilles-above-l", name: "Ахиллово сухожилие", type: "tendon" }]},

  // HEEL/FOOT
  { id: "b-heel-r", name: "Пятка (прав.)", view: "back",
    polygon: pb([[165,775],[258,775],[258,799],[165,799]]),
    structures: [
      { id: "calcaneus-b-r", name: "Пяточная кость", type: "bone" },
      { id: "achilles-ins-r", name: "Место прикрепления ахиллова сухожилия", type: "tendon" },
    ]},
  { id: "b-heel-l", name: "Пятка (лев.)", view: "back",
    polygon: pb([[285,775],[375,775],[375,799],[285,799]]),
    structures: [
      { id: "calcaneus-b-l", name: "Пяточная кость", type: "bone" },
    ]},
  { id: "b-lat-ankle-r", name: "Наружная лодыжка (прав.)", view: "back",
    polygon: pb([[148,730],[170,730],[170,770],[148,770]]),
    structures: [{ id: "lat-mall-r", name: "Латеральная лодыжка", type: "bone" }]},
  { id: "b-lat-ankle-l", name: "Наружная лодыжка (лев.)", view: "back",
    polygon: pb([[375,730],[398,730],[398,770],[375,770]]),
    structures: [{ id: "lat-mall-l", name: "Латеральная лодыжка", type: "bone" }]},
];

// ─── SIDE VIEWS — reuse front zones mapped to "left"/"right" ─────────────────
// For side views we use the same front diagram but filtered to relevant zones
export const leftZones: AnatomicalZone[] = frontZones
  .filter(z => z.id.endsWith("-r") || (!z.id.endsWith("-l") && !z.id.endsWith("-r")))
  .map(z => ({ ...z, id: z.id.replace("f-", "sl-"), view: "left" as BodyView,
    structures: z.structures.map(s => ({ ...s, id: s.id + "-sl" })) }));

export const rightZones: AnatomicalZone[] = frontZones
  .filter(z => z.id.endsWith("-l") || (!z.id.endsWith("-l") && !z.id.endsWith("-r")))
  .map(z => ({ ...z, id: z.id.replace("f-", "sr-"), view: "right" as BodyView,
    structures: z.structures.map(s => ({ ...s, id: s.id + "-sr" })) }));

export const allZones: AnatomicalZone[] = [
  ...frontZones,
  ...backZones,
  ...leftZones,
  ...rightZones,
];

export function getZonesForView(view: BodyView): AnatomicalZone[] {
  return allZones.filter(z => z.view === view);
}

// Find zone at click point (x%, y%) — uses polygon hit-testing.
// Returns smallest-area polygon that contains the point (most specific zone wins).
export function findZoneAtPoint(x: number, y: number, view: BodyView): AnatomicalZone | null {
  const zones = getZonesForView(view);
  if (!zones.length) return null;

  const hits = zones
    .filter(z => pointInPolygon(x, y, z.polygon))
    .map(z => ({ zone: z, area: polyArea(z.polygon) }));

  if (hits.length > 0) {
    hits.sort((a, b) => a.area - b.area);
    return hits[0].zone;
  }

  // Fallback: nearest centroid
  let nearest: AnatomicalZone | null = null;
  let minDist = Infinity;
  for (const z of zones) {
    const cx = z.polygon.reduce((s, p) => s + p[0], 0) / z.polygon.length;
    const cy = z.polygon.reduce((s, p) => s + p[1], 0) / z.polygon.length;
    const d = Math.hypot(x - cx, y - cy);
    if (d < minDist) { minDist = d; nearest = z; }
  }
  return nearest;
}
