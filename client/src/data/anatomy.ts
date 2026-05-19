import type { BodyView } from "@shared/schema";

export interface AnatomicalZone {
  id: string;
  name: string;
  view: BodyView;
  // Bounding box as percentage of image width/height: [x1, y1, x2, y2]
  bbox: [number, number, number, number];
  structures: AnatomicalStructure[];
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  type: "muscle" | "tendon" | "ligament" | "organ" | "nerve" | "bone" | "joint";
}

// ==================== FRONT VIEW ====================
// Image: 424×865 px.
//
// Calibration anchors (verified visually with overlay):
//   Shorts bottom (leg split start): y=510px = 59.0%
//   Foot bottom:                     y=858px = 99.2%
//   Total leg length:                348px   = 40.2%
//
// Zone Y-ranges derived from medical diagram 21134.png proportions
// mapped onto the 59%–99% leg region.
//
// NOTE: patient's RIGHT side = LEFT side of screen (standard front view).
// screen-LEFT  = patient RIGHT (pr)
// screen-RIGHT = patient LEFT  (pl)

export const frontZones: AnatomicalZone[] = [
  // ── Head & neck ──────────────────────────────────────
  {
    id: "front-head", name: "Голова", view: "front",
    bbox: [40, 4, 60, 20],
    structures: [
      { id: "frontalis",  name: "Лобная мышца",    type: "muscle" },
      { id: "temporalis", name: "Височная мышца",   type: "muscle" },
      { id: "skull",      name: "Кости черепа",     type: "bone"   },
    ],
  },
  {
    id: "front-neck", name: "Шея", view: "front",
    bbox: [41, 17, 59, 23],
    structures: [
      { id: "scm",            name: "Грудино-ключично-сосцевидная мышца", type: "muscle" },
      { id: "cervical-spine", name: "Шейный отдел позвоночника",          type: "bone"   },
      { id: "trachea",        name: "Трахея",                              type: "organ"  },
      { id: "thyroid",        name: "Щитовидная железа",                   type: "organ"  },
    ],
  },

  // ── Shoulders ────────────────────────────────────────
  {
    id: "front-shoulder-right", name: "Правый плечевой сустав", view: "front",
    bbox: [19, 22, 36, 36],
    structures: [
      { id: "deltoid-r",      name: "Дельтовидная мышца",          type: "muscle" },
      { id: "shoulder-jr",    name: "Плечевой сустав",              type: "joint"  },
      { id: "rotator-cuff-r", name: "Ротаторная манжета",           type: "tendon" },
      { id: "ac-joint-r",     name: "Акромиально-ключичный сустав", type: "joint"  },
    ],
  },
  {
    id: "front-shoulder-left", name: "Левый плечевой сустав", view: "front",
    bbox: [64, 22, 81, 36],
    structures: [
      { id: "deltoid",      name: "Дельтовидная мышца",          type: "muscle" },
      { id: "shoulder-j",   name: "Плечевой сустав",              type: "joint"  },
      { id: "rotator-cuff", name: "Ротаторная манжета",           type: "tendon" },
      { id: "ac-joint",     name: "Акромиально-ключичный сустав", type: "joint"  },
    ],
  },

  // ── Upper arms ───────────────────────────────────────
  {
    id: "front-upper-arm-right", name: "Правое плечо (В.треть)", view: "front",
    bbox: [19, 35, 34, 45],
    structures: [
      { id: "biceps-r",  name: "Бицепс",         type: "muscle" },
      { id: "triceps-r", name: "Трицепс",         type: "muscle" },
      { id: "humerus-r", name: "Плечевая кость",  type: "bone"   },
    ],
  },
  {
    id: "front-upper-arm-mid-right", name: "Правое плечо (С.треть)", view: "front",
    bbox: [19, 44, 34, 51],
    structures: [
      { id: "biceps-mid-r",  name: "Бицепс",        type: "muscle" },
      { id: "humerus-mid-r", name: "Плечевая кость", type: "bone"   },
    ],
  },
  {
    id: "front-upper-arm-low-right", name: "Правое плечо (Н.треть)", view: "front",
    bbox: [19, 50, 34, 57],
    structures: [
      { id: "biceps-low-r",  name: "Бицепс",        type: "muscle" },
      { id: "humerus-low-r", name: "Плечевая кость", type: "bone"   },
    ],
  },
  {
    id: "front-upper-arm-left", name: "Левое плечо (В.треть)", view: "front",
    bbox: [66, 35, 81, 45],
    structures: [
      { id: "biceps",  name: "Бицепс",        type: "muscle" },
      { id: "triceps", name: "Трицепс",        type: "muscle" },
      { id: "humerus", name: "Плечевая кость", type: "bone"   },
    ],
  },
  {
    id: "front-upper-arm-mid-left", name: "Левое плечо (С.треть)", view: "front",
    bbox: [66, 44, 81, 51],
    structures: [
      { id: "biceps-mid",  name: "Бицепс",        type: "muscle" },
      { id: "humerus-mid", name: "Плечевая кость", type: "bone"   },
    ],
  },
  {
    id: "front-upper-arm-low-left", name: "Левое плечо (Н.треть)", view: "front",
    bbox: [66, 50, 81, 57],
    structures: [
      { id: "biceps-low",  name: "Бицепс",        type: "muscle" },
      { id: "humerus-low", name: "Плечевая кость", type: "bone"   },
    ],
  },

  // ── Elbows ───────────────────────────────────────────
  {
    id: "front-elbow-right", name: "Правый локтевой сгиб", view: "front",
    bbox: [19, 56, 34, 63],
    structures: [
      { id: "elbow-j-r",     name: "Локтевой сустав",       type: "joint"  },
      { id: "biceps-ten-r",  name: "Сухожилие бицепса",     type: "tendon" },
      { id: "epicondyle-r",  name: "Латеральный надмыщелок", type: "bone"   },
      { id: "ulnar-nerve-r", name: "Локтевой нерв",          type: "nerve"  },
    ],
  },
  {
    id: "front-elbow-left", name: "Левый локтевой сгиб", view: "front",
    bbox: [66, 56, 81, 63],
    structures: [
      { id: "elbow-j",     name: "Локтевой сустав",       type: "joint"  },
      { id: "biceps-ten",  name: "Сухожилие бицепса",     type: "tendon" },
      { id: "epicondyle",  name: "Латеральный надмыщелок", type: "bone"   },
      { id: "ulnar-nerve", name: "Локтевой нерв",          type: "nerve"  },
    ],
  },

  // ── Forearms ─────────────────────────────────────────
  {
    id: "front-forearm-upper-right", name: "Правое предплечье (В.треть)", view: "front",
    bbox: [19, 62, 34, 67],
    structures: [
      { id: "brachiorad-r", name: "Плечелучевая мышца",        type: "muscle" },
      { id: "radius-r",     name: "Лучевая кость",              type: "bone"   },
    ],
  },
  {
    id: "front-forearm-mid-right", name: "Правое предплечье (С.треть)", view: "front",
    bbox: [19, 66, 34, 71],
    structures: [
      { id: "flexor-c-r", name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "ulna-r",     name: "Локтевая кость",             type: "bone"   },
    ],
  },
  {
    id: "front-forearm-lower-right", name: "Правое предплечье (Н.треть)", view: "front",
    bbox: [19, 70, 34, 75],
    structures: [
      { id: "ext-dig-r", name: "Разгибатель пальцев",         type: "muscle" },
      { id: "radius-l-r", name: "Лучевая кость (нижняя)",     type: "bone"   },
    ],
  },
  {
    id: "front-forearm-upper-left", name: "Левое предплечье (В.треть)", view: "front",
    bbox: [66, 62, 81, 67],
    structures: [
      { id: "brachiorad", name: "Плечелучевая мышца",        type: "muscle" },
      { id: "radius",     name: "Лучевая кость",              type: "bone"   },
    ],
  },
  {
    id: "front-forearm-mid-left", name: "Левое предплечье (С.треть)", view: "front",
    bbox: [66, 66, 81, 71],
    structures: [
      { id: "flexor-c", name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "ulna",     name: "Локтевая кость",             type: "bone"   },
    ],
  },
  {
    id: "front-forearm-lower-left", name: "Левое предплечье (Н.треть)", view: "front",
    bbox: [66, 70, 81, 75],
    structures: [
      { id: "ext-dig",  name: "Разгибатель пальцев",         type: "muscle" },
      { id: "radius-l", name: "Лучевая кость (нижняя)",      type: "bone"   },
    ],
  },

  // ── Wrists / hands ───────────────────────────────────
  {
    id: "front-wrist-hand-right", name: "Правое запястье / кисть", view: "front",
    bbox: [18, 74, 34, 87],
    structures: [
      { id: "wrist-j-r",  name: "Лучезапястный сустав", type: "joint"  },
      { id: "carpal-r",   name: "Карпальный канал",      type: "bone"   },
      { id: "median-n-r", name: "Срединный нерв",        type: "nerve"  },
      { id: "flex-ten-r", name: "Сухожилия сгибателей",  type: "tendon" },
    ],
  },
  {
    id: "front-wrist-hand-left", name: "Левое запястье / кисть", view: "front",
    bbox: [66, 74, 82, 87],
    structures: [
      { id: "wrist-j",  name: "Лучезапястный сустав", type: "joint"  },
      { id: "carpal",   name: "Карпальный канал",      type: "bone"   },
      { id: "median-n", name: "Срединный нерв",        type: "nerve"  },
      { id: "flex-ten", name: "Сухожилия сгибателей",  type: "tendon" },
    ],
  },

  // ── Torso ────────────────────────────────────────────
  {
    id: "front-chest", name: "Грудная клетка", view: "front",
    bbox: [27, 22, 73, 44],
    structures: [
      { id: "pec-major",   name: "Большая грудная мышца",  type: "muscle" },
      { id: "heart",       name: "Сердце",                  type: "organ"  },
      { id: "lungs",       name: "Лёгкие",                  type: "organ"  },
      { id: "sternum",     name: "Грудина",                  type: "bone"   },
      { id: "ribs",        name: "Рёбра",                    type: "bone"   },
      { id: "intercostal", name: "Межрёберные мышцы",        type: "muscle" },
    ],
  },
  {
    id: "front-abdomen-upper", name: "Верхний живот", view: "front",
    bbox: [27, 43, 73, 53],
    structures: [
      { id: "rectus-upper", name: "Прямая мышца живота (верх)", type: "muscle" },
      { id: "stomach",      name: "Желудок",                     type: "organ"  },
      { id: "liver",        name: "Печень",                      type: "organ"  },
      { id: "gallbladder",  name: "Желчный пузырь",              type: "organ"  },
      { id: "pancreas",     name: "Поджелудочная железа",        type: "organ"  },
      { id: "spleen",       name: "Селезёнка",                   type: "organ"  },
    ],
  },
  {
    id: "front-abdomen-lower", name: "Нижний живот", view: "front",
    bbox: [27, 52, 73, 59],
    structures: [
      { id: "rectus-lower",    name: "Прямая мышца живота (низ)", type: "muscle" },
      { id: "small-intestine", name: "Тонкий кишечник",           type: "organ"  },
      { id: "large-intestine", name: "Толстый кишечник",          type: "organ"  },
      { id: "appendix",        name: "Аппендикс",                 type: "organ"  },
      { id: "bladder",         name: "Мочевой пузырь",            type: "organ"  },
    ],
  },

  // ── Groin / pelvis ────────────────────────────────────
  // Legs split at y≈59%; groin spans both sides
  {
    id: "front-groin", name: "Таз / Пах", view: "front",
    bbox: [27, 53, 73, 61],
    structures: [
      { id: "iliac-crest",  name: "Гребень подвздошной кости", type: "bone"     },
      { id: "inguinal-lig", name: "Паховая связка",             type: "ligament" },
      { id: "adductors",    name: "Приводящие мышцы бедра",     type: "muscle"   },
    ],
  },

  // ══════════════════════════════════════════════════════
  // LEG ZONES — calibrated from photo anchor points:
  //   Legs start: y=59% (bottom of shorts)
  //   Foot bottom: y=99%
  //   Total leg height: 40%
  //
  // Proportions from medical diagram 21134.png:
  //   В.треть бедра:   0–15% of leg = y 59–65%
  //   С.треть бедра:  15–30% of leg = y 65–71%
  //   Н.треть бедра:  30–42% of leg = y 71–76%
  //   Надколенник:    41–47% of leg = y 75–78%
  //   Коленный сустав:46–55% of leg = y 77–81%
  //   В.треть голени: 54–65% of leg = y 81–85%
  //   С.треть голени: 64–76% of leg = y 85–89%
  //   Н.треть голени: 75–87% of leg = y 89–94%
  //   Стопа:          86–100% of leg = y 93–99%
  //
  // X ranges (patient RIGHT = screen LEFT, patient LEFT = screen RIGHT):
  //   PR (screen-left):  x 30–48%
  //   PL (screen-right): x 52–70%
  // ══════════════════════════════════════════════════════

  // ── Верхняя треть бедра (y 59–65%) ───────────────────
  {
    id: "front-thigh-upper-right", name: "Правое бедро (В.треть)", view: "front",
    bbox: [30, 59, 48, 65],
    structures: [
      { id: "quad-upper-r",  name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "rectus-fem-r",  name: "Прямая мышца бедра",        type: "muscle" },
      { id: "femur-upper-r", name: "Бедренная кость",            type: "bone"   },
      { id: "femoral-art-r", name: "Бедренная артерия",          type: "organ"  },
    ],
  },
  {
    id: "front-thigh-upper-left", name: "Левое бедро (В.треть)", view: "front",
    bbox: [52, 59, 70, 65],
    structures: [
      { id: "quad-upper",  name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "rectus-fem",  name: "Прямая мышца бедра",        type: "muscle" },
      { id: "femur-upper", name: "Бедренная кость",            type: "bone"   },
      { id: "femoral-art", name: "Бедренная артерия",          type: "organ"  },
    ],
  },

  // ── Средняя треть бедра (y 65–71%) ───────────────────
  {
    id: "front-thigh-mid-right", name: "Правое бедро (С.треть)", view: "front",
    bbox: [30, 64, 47, 71],
    structures: [
      { id: "quad-mid-r",     name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "vastus-lat-r",   name: "Латеральная широкая мышца", type: "muscle" },
      { id: "vastus-med-r",   name: "Медиальная широкая мышца",  type: "muscle" },
      { id: "femur-mid-r",    name: "Бедренная кость",            type: "bone"   },
    ],
  },
  {
    id: "front-thigh-mid-left", name: "Левое бедро (С.треть)", view: "front",
    bbox: [53, 64, 70, 71],
    structures: [
      { id: "quad-mid",   name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "vastus-lat", name: "Латеральная широкая мышца", type: "muscle" },
      { id: "vastus-med", name: "Медиальная широкая мышца",  type: "muscle" },
      { id: "femur-mid",  name: "Бедренная кость",            type: "bone"   },
    ],
  },

  // ── Нижняя треть бедра (y 71–76%) ────────────────────
  {
    id: "front-thigh-lower-right", name: "Правое бедро (Н.треть)", view: "front",
    bbox: [31, 70, 47, 76],
    structures: [
      { id: "quad-lower-r",  name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "sartorius-r",   name: "Портняжная мышца",           type: "muscle" },
      { id: "femur-lower-r", name: "Бедренная кость",            type: "bone"   },
    ],
  },
  {
    id: "front-thigh-lower-left", name: "Левое бедро (Н.треть)", view: "front",
    bbox: [53, 70, 69, 76],
    structures: [
      { id: "quad-lower",  name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "sartorius",   name: "Портняжная мышца",           type: "muscle" },
      { id: "femur-lower", name: "Бедренная кость",            type: "bone"   },
    ],
  },

  // ── Надколенная чашечка (y 75–79%) ───────────────────
  {
    id: "front-patella-right", name: "Правый надколенник", view: "front",
    bbox: [32, 74, 46, 79],
    structures: [
      { id: "patella-r",      name: "Надколенник",           type: "bone"   },
      { id: "patellar-ten-r", name: "Связка надколенника",   type: "tendon" },
      { id: "quad-ten-r",     name: "Сухожилие квадрицепса", type: "tendon" },
    ],
  },
  {
    id: "front-patella-left", name: "Левый надколенник", view: "front",
    bbox: [54, 74, 68, 79],
    structures: [
      { id: "patella",      name: "Надколенник",           type: "bone"   },
      { id: "patellar-ten", name: "Связка надколенника",   type: "tendon" },
      { id: "quad-ten",     name: "Сухожилие квадрицепса", type: "tendon" },
    ],
  },

  // ── Область коленного сустава (y 78–82%) ─────────────
  {
    id: "front-knee-right", name: "Правый коленный сустав", view: "front",
    bbox: [31, 77, 46, 83],
    structures: [
      { id: "knee-j-r",   name: "Коленный сустав",               type: "joint"    },
      { id: "acl-r",      name: "Передняя крестообразная связка", type: "ligament" },
      { id: "mcl-r",      name: "Медиальная коллатеральная связка", type: "ligament" },
      { id: "meniscus-r", name: "Мениск",                         type: "joint"    },
    ],
  },
  {
    id: "front-knee-left", name: "Левый коленный сустав", view: "front",
    bbox: [54, 77, 69, 83],
    structures: [
      { id: "knee-j",   name: "Коленный сустав",               type: "joint"    },
      { id: "acl",      name: "Передняя крестообразная связка", type: "ligament" },
      { id: "mcl",      name: "Медиальная коллатеральная связка", type: "ligament" },
      { id: "meniscus", name: "Мениск",                         type: "joint"    },
    ],
  },

  // ── Верхняя треть голени (y 82–86%) ──────────────────
  {
    id: "front-shin-upper-right", name: "Правая голень (В.треть)", view: "front",
    bbox: [32, 82, 45, 87],
    structures: [
      { id: "tibialis-r",  name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-r",     name: "Большеберцовая кость",          type: "bone"   },
      { id: "peroneus-r",  name: "Малоберцовые мышцы",            type: "muscle" },
    ],
  },
  {
    id: "front-shin-upper-left", name: "Левая голень (В.треть)", view: "front",
    bbox: [55, 82, 68, 87],
    structures: [
      { id: "tibialis",  name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia",     name: "Большеберцовая кость",          type: "bone"   },
      { id: "peroneus",  name: "Малоберцовые мышцы",            type: "muscle" },
    ],
  },

  // ── Средняя треть голени (y 86–90%) ──────────────────
  {
    id: "front-shin-mid-right", name: "Правая голень (С.треть)", view: "front",
    bbox: [33, 86, 44, 91],
    structures: [
      { id: "tibialis-mid-r", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-mid-r",    name: "Большеберцовая кость",          type: "bone"   },
    ],
  },
  {
    id: "front-shin-mid-left", name: "Левая голень (С.треть)", view: "front",
    bbox: [56, 86, 67, 91],
    structures: [
      { id: "tibialis-mid", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-mid",    name: "Большеберцовая кость",          type: "bone"   },
    ],
  },

  // ── Нижняя треть голени (y 90–94%) ───────────────────
  {
    id: "front-shin-lower-right", name: "Правая голень (Н.треть)", view: "front",
    bbox: [33, 90, 44, 95],
    structures: [
      { id: "tibialis-low-r", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-low-r",    name: "Большеберцовая кость",          type: "bone"   },
      { id: "ankle-ten-r",    name: "Сухожилие разгибателей",        type: "tendon" },
    ],
  },
  {
    id: "front-shin-lower-left", name: "Левая голень (Н.треть)", view: "front",
    bbox: [56, 90, 67, 95],
    structures: [
      { id: "tibialis-low", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-low",    name: "Большеберцовая кость",          type: "bone"   },
      { id: "ankle-ten",    name: "Сухожилие разгибателей",        type: "tendon" },
    ],
  },

  // ── Стопа / лодыжка (y 93–99%) ───────────────────────
  {
    id: "front-ankle-foot-right", name: "Правая стопа", view: "front",
    bbox: [30, 93, 46, 99],
    structures: [
      { id: "ankle-j-r",   name: "Голеностопный сустав", type: "joint"  },
      { id: "achilles-r",  name: "Ахиллово сухожилие",   type: "tendon" },
      { id: "plantar-r",   name: "Подошвенная фасция",    type: "tendon" },
      { id: "calcaneus-r", name: "Пяточная кость",        type: "bone"   },
      { id: "talus-r",     name: "Таранная кость",        type: "bone"   },
    ],
  },
  {
    id: "front-ankle-foot-left", name: "Левая стопа", view: "front",
    bbox: [54, 93, 70, 99],
    structures: [
      { id: "ankle-j",   name: "Голеностопный сустав", type: "joint"  },
      { id: "achilles",  name: "Ахиллово сухожилие",   type: "tendon" },
      { id: "plantar",   name: "Подошвенная фасция",    type: "tendon" },
      { id: "calcaneus", name: "Пяточная кость",        type: "bone"   },
      { id: "talus",     name: "Таранная кость",        type: "bone"   },
    ],
  },
];

// ==================== BACK VIEW ====================
// Image: 429×865 px — same vertical proportions as front.
export const backZones: AnatomicalZone[] = [
  {
    id: "back-head", name: "Затылок", view: "back",
    bbox: [37, 2, 63, 19],
    structures: [
      { id: "occipitalis",  name: "Затылочная мышца",    type: "muscle" },
      { id: "suboccipital", name: "Подзатылочные мышцы", type: "muscle" },
      { id: "skull-b",      name: "Кости черепа",         type: "bone"   },
    ],
  },
  {
    id: "back-neck", name: "Шея (сзади)", view: "back",
    bbox: [38, 17, 62, 26],
    structures: [
      { id: "trapezius-upper",  name: "Верхняя трапециевидная мышца",    type: "muscle" },
      { id: "cervical-spine-b", name: "Шейный отдел позвоночника",        type: "bone"   },
      { id: "levator-scap",     name: "Мышца, поднимающая лопатку",       type: "muscle" },
    ],
  },
  {
    id: "back-shoulder-right", name: "Правое плечо (сзади)", view: "back",
    bbox: [19, 24, 36, 42],
    structures: [
      { id: "deltoid-post-r",  name: "Задняя головка дельтовидной мышцы", type: "muscle" },
      { id: "infraspinatus-r", name: "Подостная мышца",                    type: "muscle" },
      { id: "scapula-r",       name: "Лопатка",                            type: "bone"   },
    ],
  },
  {
    id: "back-shoulder-left", name: "Левое плечо (сзади)", view: "back",
    bbox: [64, 24, 81, 42],
    structures: [
      { id: "deltoid-post",  name: "Задняя головка дельтовидной мышцы", type: "muscle" },
      { id: "infraspinatus", name: "Подостная мышца",                    type: "muscle" },
      { id: "teres-minor",   name: "Малая круглая мышца",                type: "muscle" },
      { id: "scapula",       name: "Лопатка",                            type: "bone"   },
    ],
  },
  {
    id: "back-upper-back", name: "Верхняя спина", view: "back",
    bbox: [27, 22, 73, 42],
    structures: [
      { id: "trapezius-mid",    name: "Средняя трапециевидная мышца", type: "muscle" },
      { id: "rhomboids",        name: "Ромбовидные мышцы",             type: "muscle" },
      { id: "thoracic-spine",   name: "Грудной отдел позвоночника",    type: "bone"   },
      { id: "latissimus-upper", name: "Широчайшая мышца (верх)",       type: "muscle" },
    ],
  },
  {
    id: "back-mid-back", name: "Средняя спина", view: "back",
    bbox: [27, 41, 73, 54],
    structures: [
      { id: "latissimus-mid",  name: "Широчайшая мышца спины",     type: "muscle" },
      { id: "serratus-post",   name: "Задняя зубчатая мышца",      type: "muscle" },
      { id: "thoracic-spine-m",name: "Грудной отдел позвоночника", type: "bone"   },
    ],
  },
  {
    id: "back-lower-back", name: "Поясница", view: "back",
    bbox: [27, 53, 73, 62],
    structures: [
      { id: "erector-spinae",     name: "Мышца, выпрямляющая позвоночник", type: "muscle" },
      { id: "multifidus",         name: "Многораздельная мышца",           type: "muscle" },
      { id: "quadratus-lumborum", name: "Квадратная мышца поясницы",       type: "muscle" },
      { id: "lumbar-spine",       name: "Поясничный отдел позвоночника",   type: "bone"   },
      { id: "kidney",             name: "Почки",                            type: "organ"  },
      { id: "sciatic-nerve",      name: "Седалищный нерв",                 type: "nerve"  },
    ],
  },
  {
    id: "back-glutes", name: "Ягодицы", view: "back",
    bbox: [27, 61, 73, 74],
    structures: [
      { id: "gluteus-max", name: "Большая ягодичная мышца", type: "muscle" },
      { id: "gluteus-med", name: "Средняя ягодичная мышца", type: "muscle" },
      { id: "piriformis",  name: "Грушевидная мышца",        type: "muscle" },
      { id: "sacrum",      name: "Крестец",                   type: "bone"   },
      { id: "sciatic-b",   name: "Седалищный нерв",           type: "nerve"  },
    ],
  },
  {
    id: "back-upper-arm-right", name: "Правое плечо (рука, сзади)", view: "back",
    bbox: [19, 40, 33, 57],
    structures: [
      { id: "triceps-b-r", name: "Трицепс",        type: "muscle" },
      { id: "humerus-b-r", name: "Плечевая кость", type: "bone"   },
    ],
  },
  {
    id: "back-upper-arm-left", name: "Левое плечо (рука, сзади)", view: "back",
    bbox: [67, 40, 81, 57],
    structures: [
      { id: "triceps-b", name: "Трицепс",        type: "muscle" },
      { id: "humerus-b", name: "Плечевая кость", type: "bone"   },
    ],
  },
  {
    id: "back-hamstring-right", name: "Правое бедро (задн.)", view: "back",
    bbox: [29, 72, 48, 84],
    structures: [
      { id: "biceps-fem-r",     name: "Двуглавая мышца бедра", type: "muscle" },
      { id: "semitendinosus-r", name: "Полусухожильная мышца",  type: "muscle" },
    ],
  },
  {
    id: "back-hamstring-left", name: "Левое бедро (задн.)", view: "back",
    bbox: [52, 72, 71, 84],
    structures: [
      { id: "biceps-fem",     name: "Двуглавая мышца бедра",   type: "muscle" },
      { id: "semitendinosus", name: "Полусухожильная мышца",   type: "muscle" },
      { id: "semimembranosus",name: "Полуперепончатая мышца",  type: "muscle" },
    ],
  },
  {
    id: "back-knee-right", name: "Правое колено (сзади)", view: "back",
    bbox: [30, 82, 47, 94],
    structures: [
      { id: "popliteal-r",   name: "Подколенная ямка",             type: "joint"    },
      { id: "pcl-r",         name: "Задняя крестообразная связка", type: "ligament" },
      { id: "gastroc-top-r", name: "Икроножная мышца (верх)",      type: "muscle"   },
    ],
  },
  {
    id: "back-knee-left", name: "Левое колено (сзади)", view: "back",
    bbox: [53, 82, 70, 94],
    structures: [
      { id: "popliteal",   name: "Подколенная ямка",             type: "joint"    },
      { id: "pcl",         name: "Задняя крестообразная связка", type: "ligament" },
      { id: "gastroc-top", name: "Икроножная мышца (верх)",      type: "muscle"   },
    ],
  },
  {
    id: "back-calf-right", name: "Правая икра", view: "back",
    bbox: [30, 92, 47, 97],
    structures: [
      { id: "gastrocnemius-r", name: "Икроножная мышца",    type: "muscle" },
      { id: "soleus-r",        name: "Камбаловидная мышца", type: "muscle" },
      { id: "achilles-b-r",    name: "Ахиллово сухожилие",  type: "tendon" },
    ],
  },
  {
    id: "back-calf-left", name: "Левая икра", view: "back",
    bbox: [53, 92, 70, 97],
    structures: [
      { id: "gastrocnemius", name: "Икроножная мышца",    type: "muscle" },
      { id: "soleus",        name: "Камбаловидная мышца", type: "muscle" },
      { id: "achilles-b",    name: "Ахиллово сухожилие",  type: "tendon" },
    ],
  },
  {
    id: "back-heel-right", name: "Правая пятка", view: "back",
    bbox: [27, 95, 46, 100],
    structures: [
      { id: "calcaneus-b-r",  name: "Пяточная кость",                        type: "bone"   },
      { id: "achilles-ins-r", name: "Место прикрепления ахиллова сухожилия", type: "tendon" },
    ],
  },
  {
    id: "back-heel-left", name: "Левая пятка", view: "back",
    bbox: [54, 95, 73, 100],
    structures: [
      { id: "calcaneus-b",  name: "Пяточная кость",                        type: "bone"   },
      { id: "achilles-ins", name: "Место прикрепления ахиллова сухожилия", type: "tendon" },
    ],
  },
];

// ==================== LEFT SIDE VIEW ====================
// Image: 434×899 px. Person faces right on screen.
export const leftZones: AnatomicalZone[] = [
  {
    id: "left-head", name: "Голова (висок)", view: "left",
    bbox: [25, 2, 80, 19],
    structures: [
      { id: "temporalis-l", name: "Височная мышца",                type: "muscle" },
      { id: "masseter-l",   name: "Жевательная мышца",             type: "muscle" },
      { id: "tmj-l",        name: "Височно-нижнечелюстной сустав", type: "joint"  },
    ],
  },
  {
    id: "left-neck", name: "Шея (сбоку)", view: "left",
    bbox: [28, 17, 68, 28],
    structures: [
      { id: "scm-l",      name: "Грудино-ключично-сосцевидная мышца", type: "muscle" },
      { id: "scalene-l",  name: "Лестничные мышцы",                   type: "muscle" },
      { id: "cervical-l", name: "Шейный отдел позвоночника",          type: "bone"   },
    ],
  },
  {
    id: "left-shoulder", name: "Плечо (сбоку)", view: "left",
    bbox: [15, 24, 62, 42],
    structures: [
      { id: "deltoid-l",      name: "Дельтовидная мышца",  type: "muscle" },
      { id: "shoulder-j-l",   name: "Плечевой сустав",      type: "joint"  },
      { id: "rotator-cuff-l", name: "Ротаторная манжета",   type: "tendon" },
    ],
  },
  {
    id: "left-chest-side", name: "Грудная клетка (сбоку)", view: "left",
    bbox: [25, 24, 80, 50],
    structures: [
      { id: "serratus-l",    name: "Передняя зубчатая мышца", type: "muscle" },
      { id: "intercostal-l", name: "Межрёберные мышцы",        type: "muscle" },
      { id: "ribs-l",        name: "Рёбра",                    type: "bone"   },
      { id: "lungs-l",       name: "Лёгкие",                   type: "organ"  },
    ],
  },
  {
    id: "left-upper-arm", name: "Плечо (рука, сбоку)", view: "left",
    bbox: [10, 40, 40, 60],
    structures: [
      { id: "biceps-l",  name: "Бицепс",         type: "muscle" },
      { id: "triceps-l", name: "Трицепс",         type: "muscle" },
      { id: "humerus-l", name: "Плечевая кость",  type: "bone"   },
    ],
  },
  {
    id: "left-abdomen", name: "Живот (сбоку)", view: "left",
    bbox: [25, 49, 80, 65],
    structures: [
      { id: "obliques-l", name: "Косые мышцы живота",            type: "muscle" },
      { id: "rectus-l",   name: "Прямая мышца живота",           type: "muscle" },
      { id: "lumbar-l",   name: "Поясничный отдел позвоночника", type: "bone"   },
      { id: "kidney-l",   name: "Почка",                          type: "organ"  },
    ],
  },
  {
    id: "left-hip", name: "Тазобедренный сустав (сбоку)", view: "left",
    bbox: [20, 64, 72, 76],
    structures: [
      { id: "hip-j-l",         name: "Тазобедренный сустав",            type: "joint"  },
      { id: "it-band-l",       name: "Подвздошно-большеберцовый тракт", type: "tendon" },
      { id: "gluteus-med-l",   name: "Средняя ягодичная мышца",         type: "muscle" },
      { id: "greater-troch-l", name: "Большой вертел бедра",            type: "bone"   },
    ],
  },
  {
    id: "left-thigh", name: "Бедро (сбоку)", view: "left",
    bbox: [18, 75, 68, 85],
    structures: [
      { id: "vastus-lat-l", name: "Латеральная широкая мышца",             type: "muscle" },
      { id: "hamstrings-l", name: "Мышцы задней поверхности бедра",        type: "muscle" },
      { id: "it-band-th-l", name: "Подвздошно-большеберцовый тракт",       type: "tendon" },
      { id: "femur-l",      name: "Бедренная кость",                        type: "bone"   },
    ],
  },
  {
    id: "left-knee", name: "Колено (сбоку)", view: "left",
    bbox: [15, 84, 65, 93],
    structures: [
      { id: "knee-j-l",       name: "Коленный сустав",                           type: "joint"    },
      { id: "patella-l",      name: "Надколенник",                               type: "bone"     },
      { id: "it-band-knee-l", name: "Подвздошно-большеберцовый тракт (колено)", type: "tendon"   },
      { id: "lcl-l",          name: "Латеральная коллатеральная связка",         type: "ligament" },
      { id: "meniscus-l",     name: "Мениск",                                    type: "joint"    },
      { id: "patellar-ten-l", name: "Связка надколенника",                      type: "tendon"   },
    ],
  },
  {
    id: "left-calf", name: "Голень (сбоку)", view: "left",
    bbox: [15, 92, 62, 97],
    structures: [
      { id: "tibialis-l",  name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "gastroc-l",   name: "Икроножная мышца",               type: "muscle" },
      { id: "peroneus-l",  name: "Малоберцовые мышцы",             type: "muscle" },
    ],
  },
  {
    id: "left-ankle", name: "Лодыжка / стопа (сбоку)", view: "left",
    bbox: [10, 96, 65, 100],
    structures: [
      { id: "ankle-j-l",  name: "Голеностопный сустав",                type: "joint"    },
      { id: "achilles-l", name: "Ахиллово сухожилие",                  type: "tendon"   },
      { id: "atfl-l",     name: "Передняя таранно-малоберцовая связка", type: "ligament" },
      { id: "plantar-l",  name: "Подошвенная фасция",                   type: "tendon"   },
    ],
  },
];

// ==================== RIGHT SIDE VIEW ====================
export const rightZones: AnatomicalZone[] = leftZones.map((z) => ({
  ...z,
  id: z.id.replace("left-", "right-"),
  name: z.name
    .replace("Левая", "Правая")
    .replace("Левое", "Правое")
    .replace("Левый", "Правый")
    .replace("левая", "правая"),
  view: "right" as BodyView,
  structures: z.structures.map((s) => ({ ...s, id: s.id + "-r" })),
}));

export const allZones: AnatomicalZone[] = [
  ...frontZones,
  ...backZones,
  ...leftZones,
  ...rightZones,
];

export function getZonesForView(view: BodyView): AnatomicalZone[] {
  return allZones.filter((z) => z.view === view);
}

// Find zone where point (x%, y%) falls within bbox.
//
// Strategy: sort matching zones by bbox area (ascending) so the SMALLEST
// (most specific) bbox wins when zones overlap. This handles cases like
// knee overlapping thigh — knee bbox is smaller so it wins.
// Falls back to nearest-center zone if no exact hit.
export function findZoneAtPoint(x: number, y: number, view: BodyView): AnatomicalZone | null {
  const zones = getZonesForView(view);
  if (zones.length === 0) return null;

  // Collect all zones whose bbox contains the point
  const hits: Array<{ zone: AnatomicalZone; area: number }> = [];
  for (const zone of zones) {
    const [x1, y1, x2, y2] = zone.bbox;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      hits.push({ zone, area: (x2 - x1) * (y2 - y1) });
    }
  }

  if (hits.length > 0) {
    // Return the zone with the smallest area (most specific)
    hits.sort((a, b) => a.area - b.area);
    return hits[0].zone;
  }

  // Nearest-center fallback
  let nearest: AnatomicalZone | null = null;
  let minDist = Infinity;
  for (const zone of zones) {
    const [x1, y1, x2, y2] = zone.bbox;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist < minDist) { minDist = dist; nearest = zone; }
  }
  return nearest;
}
