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
// Image: 424×865 px. Pixel-level calibration per row.
//
// Head:   y=2–19%,  x≈40–60% (skin cluster, center)
// Neck:   y=17–25%, x≈37–62% (visible skin transition)
// Shirt collar closes at y≈19%; arms appear at y=19% (body outline)
// Body outline: x≈22–78% at y=28–57%
// Arms (skin): y=32–57%, screen-LEFT x≈22–30% (patient RIGHT),
//              screen-RIGHT x≈70–78% (patient LEFT)
// Legs: split into TWO clusters from y=58% onwards
//   screen-LEFT  cluster (patient RIGHT): x=28–49% at y=58%, narrows to 33–43% by y=85%
//   screen-RIGHT cluster (patient LEFT):  x=51–72% at y=58%, narrows to 57–67% by y=85%
// Knees: y=83–93%, left-cluster x=33–43%, right-cluster x=57–67%
// Feet:  y=96–100%
//
// NOTE: patient's RIGHT side = LEFT side of screen (standard front view).

export const frontZones: AnatomicalZone[] = [
  // ── Head & neck ──────────────────────────────────────
  {
    id: "front-head", name: "Голова", view: "front",
    bbox: [37, 2, 63, 19],
    structures: [
      { id: "frontalis",  name: "Лобная мышца",    type: "muscle" },
      { id: "temporalis", name: "Височная мышца",   type: "muscle" },
      { id: "skull",      name: "Кости черепа",     type: "bone"   },
    ],
  },
  {
    id: "front-neck", name: "Шея", view: "front",
    bbox: [38, 17, 62, 26],
    structures: [
      { id: "scm",            name: "Грудино-ключично-сосцевидная мышца", type: "muscle" },
      { id: "cervical-spine", name: "Шейный отдел позвоночника",          type: "bone"   },
      { id: "trachea",        name: "Трахея",                              type: "organ"  },
      { id: "thyroid",        name: "Щитовидная железа",                   type: "organ"  },
    ],
  },

  // ── Shoulders ────────────────────────────────────────
  {
    id: "front-shoulder-right", name: "Правое плечо", view: "front",
    // patient RIGHT = screen LEFT; body outline starts at x≈22%
    bbox: [19, 24, 36, 42],
    structures: [
      { id: "deltoid-r",      name: "Дельтовидная мышца",          type: "muscle" },
      { id: "shoulder-jr",    name: "Плечевой сустав",              type: "joint"  },
      { id: "rotator-cuff-r", name: "Ротаторная манжета",           type: "tendon" },
      { id: "ac-joint-r",     name: "Акромиально-ключичный сустав", type: "joint"  },
    ],
  },
  {
    id: "front-shoulder-left", name: "Левое плечо", view: "front",
    // patient LEFT = screen RIGHT; body outline ends at x≈78%
    bbox: [64, 24, 81, 42],
    structures: [
      { id: "deltoid",      name: "Дельтовидная мышца",          type: "muscle" },
      { id: "shoulder-j",   name: "Плечевой сустав",              type: "joint"  },
      { id: "rotator-cuff", name: "Ротаторная манжета",           type: "tendon" },
      { id: "ac-joint",     name: "Акромиально-ключичный сустав", type: "joint"  },
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
    bbox: [27, 52, 73, 60],
    structures: [
      { id: "rectus-lower",    name: "Прямая мышца живота (низ)", type: "muscle" },
      { id: "small-intestine", name: "Тонкий кишечник",           type: "organ"  },
      { id: "large-intestine", name: "Толстый кишечник",          type: "organ"  },
      { id: "appendix",        name: "Аппендикс",                 type: "organ"  },
      { id: "bladder",         name: "Мочевой пузырь",            type: "organ"  },
    ],
  },

  // ── Upper arms (skin clusters) ───────────────────────
  {
    id: "front-upper-arm-right", name: "Правое плечо (рука)", view: "front",
    // skin cluster at screen LEFT: x=21–30%
    bbox: [19, 40, 33, 57],
    structures: [
      { id: "biceps-r",  name: "Бицепс",         type: "muscle" },
      { id: "triceps-r", name: "Трицепс",         type: "muscle" },
      { id: "humerus-r", name: "Плечевая кость",  type: "bone"   },
    ],
  },
  {
    id: "front-upper-arm-left", name: "Левое плечо (рука)", view: "front",
    // skin cluster at screen RIGHT: x=70–79%
    bbox: [67, 40, 81, 57],
    structures: [
      { id: "biceps",  name: "Бицепс",        type: "muscle" },
      { id: "triceps", name: "Трицепс",        type: "muscle" },
      { id: "humerus", name: "Плечевая кость", type: "bone"   },
    ],
  },

  // ── Elbows ───────────────────────────────────────────
  {
    id: "front-elbow-right", name: "Правый локоть", view: "front",
    bbox: [19, 56, 33, 63],
    structures: [
      { id: "elbow-j-r",       name: "Локтевой сустав",       type: "joint"  },
      { id: "biceps-ten-r",    name: "Сухожилие бицепса",     type: "tendon" },
      { id: "epicondyle-r",    name: "Латеральный надмыщелок", type: "bone"   },
      { id: "ulnar-nerve-r",   name: "Локтевой нерв",          type: "nerve"  },
    ],
  },
  {
    id: "front-elbow-left", name: "Левый локоть", view: "front",
    bbox: [67, 56, 81, 63],
    structures: [
      { id: "elbow-j",     name: "Локтевой сустав",       type: "joint"  },
      { id: "biceps-ten",  name: "Сухожилие бицепса",     type: "tendon" },
      { id: "epicondyle",  name: "Латеральный надмыщелок", type: "bone"   },
      { id: "ulnar-nerve", name: "Локтевой нерв",          type: "nerve"  },
    ],
  },

  // ── Forearms ─────────────────────────────────────────
  {
    id: "front-forearm-right", name: "Правое предплечье", view: "front",
    bbox: [19, 62, 33, 75],
    structures: [
      { id: "brachiorad-r", name: "Плечелучевая мышца",        type: "muscle" },
      { id: "flexor-c-r",   name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "radius-r",     name: "Лучевая кость",              type: "bone"   },
      { id: "ulna-r",       name: "Локтевая кость",             type: "bone"   },
    ],
  },
  {
    id: "front-forearm-left", name: "Левое предплечье", view: "front",
    bbox: [67, 62, 81, 75],
    structures: [
      { id: "brachiorad", name: "Плечелучевая мышца",        type: "muscle" },
      { id: "flexor-c",   name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "radius",     name: "Лучевая кость",              type: "bone"   },
      { id: "ulna",       name: "Локтевая кость",             type: "bone"   },
    ],
  },

  // ── Wrists / hands ───────────────────────────────────
  {
    id: "front-wrist-hand-right", name: "Правое запястье / кисть", view: "front",
    bbox: [18, 74, 33, 87],
    structures: [
      { id: "wrist-j-r",    name: "Лучезапястный сустав",  type: "joint"  },
      { id: "carpal-r",     name: "Карпальный канал",       type: "bone"   },
      { id: "median-n-r",   name: "Срединный нерв",         type: "nerve"  },
      { id: "flex-ten-r",   name: "Сухожилия сгибателей",   type: "tendon" },
    ],
  },
  {
    id: "front-wrist-hand-left", name: "Левое запястье / кисть", view: "front",
    bbox: [67, 74, 82, 87],
    structures: [
      { id: "wrist-j",   name: "Лучезапястный сустав", type: "joint"  },
      { id: "carpal",    name: "Карпальный канал",      type: "bone"   },
      { id: "median-n",  name: "Срединный нерв",        type: "nerve"  },
      { id: "flex-ten",  name: "Сухожилия сгибателей",  type: "tendon" },
    ],
  },

  // ── Groin / pelvis ────────────────────────────────────
  // Thin strip before legs fully split (y=57–62%)
  {
    id: "front-groin", name: "Таз / Пах", view: "front",
    bbox: [26, 55, 74, 63],
    structures: [
      { id: "iliac-crest",  name: "Гребень подвздошной кости", type: "bone"     },
      { id: "inguinal-lig", name: "Паховая связка",             type: "ligament" },
      { id: "adductors",    name: "Приводящие мышцы бедра",     type: "muscle"   },
    ],
  },

  // ── Hips (y=62–75%) ──────────────────────────────────
  // Leg clusters: screen-LEFT x=31–48%, screen-RIGHT x=52–69%
  {
    id: "front-hip-right", name: "Правый тазобедренный сустав", view: "front",
    bbox: [27, 60, 50, 74],
    structures: [
      { id: "hip-j-r",     name: "Тазобедренный сустав",        type: "joint"    },
      { id: "iliopsoas-r", name: "Подвздошно-поясничная мышца", type: "muscle"   },
      { id: "groin-lig-r", name: "Паховые связки",               type: "ligament" },
    ],
  },
  {
    id: "front-hip-left", name: "Левый тазобедренный сустав", view: "front",
    bbox: [50, 60, 73, 74],
    structures: [
      { id: "hip-j",     name: "Тазобедренный сустав",        type: "joint"    },
      { id: "iliopsoas", name: "Подвздошно-поясничная мышца", type: "muscle"   },
      { id: "groin-lig", name: "Паховые связки",               type: "ligament" },
    ],
  },

  // ── Thighs (y=73–84%) ────────────────────────────────
  // screen-LEFT x=32–45%, screen-RIGHT x=55–68%
  {
    id: "front-thigh-right", name: "Правое бедро", view: "front",
    bbox: [29, 72, 48, 84],
    structures: [
      { id: "quadriceps-r",  name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "rectus-fem-r",  name: "Прямая мышца бедра",        type: "muscle" },
      { id: "vastus-med-r",  name: "Медиальная широкая мышца",  type: "muscle" },
      { id: "femur-r",       name: "Бедренная кость",            type: "bone"   },
    ],
  },
  {
    id: "front-thigh-left", name: "Левое бедро", view: "front",
    bbox: [52, 72, 71, 84],
    structures: [
      { id: "quadriceps",  name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "rectus-fem",  name: "Прямая мышца бедра",        type: "muscle" },
      { id: "vastus-lat",  name: "Латеральная широкая мышца", type: "muscle" },
      { id: "sartorius",   name: "Портняжная мышца",           type: "muscle" },
      { id: "femur",       name: "Бедренная кость",            type: "bone"   },
    ],
  },

  // ── Knees (y=83–93%) ─────────────────────────────────
  // screen-LEFT x=33–43%, screen-RIGHT x=57–67%
  {
    id: "front-knee-right", name: "Правое колено", view: "front",
    bbox: [30, 82, 47, 94],
    structures: [
      { id: "knee-j-r",       name: "Коленный сустав",               type: "joint"    },
      { id: "patella-r",      name: "Надколенник",                    type: "bone"     },
      { id: "patellar-ten-r", name: "Связка надколенника",           type: "tendon"   },
      { id: "acl-r",          name: "Передняя крестообразная связка", type: "ligament" },
      { id: "meniscus-r",     name: "Мениск",                         type: "joint"    },
    ],
  },
  {
    id: "front-knee-left", name: "Левое колено", view: "front",
    bbox: [53, 82, 70, 94],
    structures: [
      { id: "knee-j",       name: "Коленный сустав",               type: "joint"    },
      { id: "patella",      name: "Надколенник",                    type: "bone"     },
      { id: "patellar-ten", name: "Связка надколенника",           type: "tendon"   },
      { id: "acl",          name: "Передняя крестообразная связка", type: "ligament" },
      { id: "mcl",          name: "Медиальная коллатеральная связка", type: "ligament" },
      { id: "meniscus",     name: "Мениск",                         type: "joint"    },
    ],
  },

  // ── Shins (y=92–97%) ─────────────────────────────────
  // screen-LEFT x=33–43%, screen-RIGHT x=57–66%
  {
    id: "front-shin-right", name: "Правая голень", view: "front",
    bbox: [30, 92, 47, 97],
    structures: [
      { id: "tibialis-r", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-r",    name: "Большеберцовая кость",          type: "bone"   },
      { id: "peroneus-r", name: "Малоберцовые мышцы",            type: "muscle" },
    ],
  },
  {
    id: "front-shin-left", name: "Левая голень", view: "front",
    bbox: [53, 92, 70, 97],
    structures: [
      { id: "tibialis", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia",    name: "Большеберцовая кость",          type: "bone"   },
      { id: "peroneus", name: "Малоберцовые мышцы",            type: "muscle" },
    ],
  },

  // ── Feet (y=96–100%) ─────────────────────────────────
  // screen-LEFT x=30–43%, screen-RIGHT x=57–70%
  {
    id: "front-ankle-foot-right", name: "Правая стопа / лодыжка", view: "front",
    bbox: [27, 95, 46, 100],
    structures: [
      { id: "ankle-j-r",   name: "Голеностопный сустав", type: "joint"  },
      { id: "achilles-r",  name: "Ахиллово сухожилие",   type: "tendon" },
      { id: "plantar-r",   name: "Подошвенная фасция",    type: "tendon" },
      { id: "calcaneus-r", name: "Пяточная кость",        type: "bone"   },
    ],
  },
  {
    id: "front-ankle-foot-left", name: "Левая стопа / лодыжка", view: "front",
    bbox: [54, 95, 73, 100],
    structures: [
      { id: "ankle-j",   name: "Голеностопный сустав", type: "joint"  },
      { id: "achilles",  name: "Ахиллово сухожилие",   type: "tendon" },
      { id: "plantar",   name: "Подошвенная фасция",    type: "tendon" },
      { id: "calcaneus", name: "Пяточная кость",        type: "bone"   },
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
// Iterates in reverse so smaller/specific zones win over larger ones.
// Falls back to nearest-center zone if no exact hit.
export function findZoneAtPoint(x: number, y: number, view: BodyView): AnatomicalZone | null {
  const zones = getZonesForView(view);
  if (zones.length === 0) return null;

  for (let i = zones.length - 1; i >= 0; i--) {
    const [x1, y1, x2, y2] = zones[i].bbox;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      return zones[i];
    }
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
