import type { BodyView } from "@shared/schema";

export interface AnatomicalZone {
  id: string;
  name: string;
  view: BodyView;
  // Bounding box as percentage of image (x1,y1,x2,y2)
  bbox: [number, number, number, number];
  structures: AnatomicalStructure[];
}

export interface AnatomicalStructure {
  id: string;
  name: string;
  type: "muscle" | "tendon" | "ligament" | "organ" | "nerve" | "bone" | "joint";
}

// ==================== FRONT VIEW ====================
// Image 424x865
// Head: y=3-20% (center x=36-64%)
// Neck: y=17-24% (center x=40-60%)
// Shoulders/arms appear at y=32%, x=15-33% (right) and x=67-85% (left)
// Torso (clothed): y=22-60%, x=32-68%
// Groin/Pelvis: y=60-71% (legs together)
// Legs split at y=70%: R=x:30-50%, L=x:50-70%
// Thighs: y=70-84%
// Knees: y=84-92% (narrowed)
// Shins: y=91-98%
// Feet: y=96-100%
// NOTE: patient's RIGHT side = LEFT side of screen (mirror)
export const frontZones: AnatomicalZone[] = [
  {
    id: "front-head", name: "Голова", view: "front",
    bbox: [36, 3, 64, 20],
    structures: [
      { id: "frontalis", name: "Лобная мышца", type: "muscle" },
      { id: "temporalis", name: "Височная мышца", type: "muscle" },
      { id: "skull", name: "Кости черепа", type: "bone" },
    ],
  },
  {
    id: "front-neck", name: "Шея", view: "front",
    bbox: [40, 18, 60, 26],
    structures: [
      { id: "sternocleidomastoid", name: "Грудино-ключично-сосцевидная мышца", type: "muscle" },
      { id: "scalenes", name: "Лестничные мышцы", type: "muscle" },
      { id: "cervical-spine", name: "Шейный отдел позвоночника", type: "bone" },
      { id: "trachea", name: "Трахея", type: "organ" },
      { id: "thyroid", name: "Щитовидная железа", type: "organ" },
    ],
  },
  {
    id: "front-shoulder-right", name: "Правое плечо", view: "front",
    // patient's RIGHT = screen LEFT
    bbox: [14, 28, 36, 48],
    structures: [
      { id: "deltoid-r", name: "Дельтовидная мышца", type: "muscle" },
      { id: "shoulder-joint-r", name: "Плечевой сустав", type: "joint" },
      { id: "rotator-cuff-r", name: "Ротаторная манжета", type: "tendon" },
      { id: "supraspinatus-r", name: "Надостная мышца", type: "muscle" },
      { id: "ac-joint-r", name: "Акромиально-ключичный сустав", type: "joint" },
    ],
  },
  {
    id: "front-shoulder-left", name: "Левое плечо", view: "front",
    // patient's LEFT = screen RIGHT
    bbox: [64, 28, 86, 48],
    structures: [
      { id: "deltoid", name: "Дельтовидная мышца", type: "muscle" },
      { id: "shoulder-joint", name: "Плечевой сустав", type: "joint" },
      { id: "rotator-cuff", name: "Ротаторная манжета", type: "tendon" },
      { id: "supraspinatus", name: "Надостная мышца", type: "muscle" },
      { id: "ac-joint", name: "Акромиально-ключичный сустав", type: "joint" },
    ],
  },
  {
    id: "front-chest", name: "Грудная клетка", view: "front",
    bbox: [30, 22, 70, 52],
    structures: [
      { id: "pectoralis-major", name: "Большая грудная мышца", type: "muscle" },
      { id: "heart", name: "Сердце", type: "organ" },
      { id: "lungs", name: "Лёгкие", type: "organ" },
      { id: "sternum", name: "Грудина", type: "bone" },
      { id: "ribs", name: "Рёбра", type: "bone" },
      { id: "intercostal", name: "Межрёберные мышцы", type: "muscle" },
    ],
  },
  {
    id: "front-upper-arm-right", name: "Правое плечо (рука)", view: "front",
    // patient's RIGHT arm = screen LEFT
    bbox: [13, 44, 30, 62],
    structures: [
      { id: "biceps-r", name: "Двуглавая мышца (бицепс)", type: "muscle" },
      { id: "brachialis-r", name: "Плечевая мышца", type: "muscle" },
      { id: "triceps-r", name: "Трёхглавая мышца (трицепс)", type: "muscle" },
      { id: "humerus-r", name: "Плечевая кость", type: "bone" },
    ],
  },
  {
    id: "front-upper-arm-left", name: "Левое плечо (рука)", view: "front",
    // patient's LEFT arm = screen RIGHT
    bbox: [70, 44, 87, 62],
    structures: [
      { id: "biceps", name: "Двуглавая мышца (бицепс)", type: "muscle" },
      { id: "brachialis", name: "Плечевая мышца", type: "muscle" },
      { id: "triceps", name: "Трёхглавая мышца (трицепс)", type: "muscle" },
      { id: "humerus", name: "Плечевая кость", type: "bone" },
    ],
  },
  {
    id: "front-elbow-right", name: "Правый локоть", view: "front",
    bbox: [13, 61, 30, 68],
    structures: [
      { id: "elbow-joint-r", name: "Локтевой сустав", type: "joint" },
      { id: "biceps-tendon-r", name: "Сухожилие бицепса", type: "tendon" },
      { id: "lateral-epicondyle-r", name: "Латеральный надмыщелок", type: "bone" },
      { id: "ulnar-nerve-r", name: "Локтевой нерв", type: "nerve" },
    ],
  },
  {
    id: "front-elbow-left", name: "Левый локоть", view: "front",
    bbox: [70, 61, 87, 68],
    structures: [
      { id: "elbow-joint", name: "Локтевой сустав", type: "joint" },
      { id: "biceps-tendon", name: "Сухожилие бицепса", type: "tendon" },
      { id: "lateral-epicondyle", name: "Латеральный надмыщелок", type: "bone" },
      { id: "ulnar-nerve", name: "Локтевой нерв", type: "nerve" },
    ],
  },
  {
    id: "front-forearm-right", name: "Правое предплечье", view: "front",
    bbox: [12, 67, 30, 79],
    structures: [
      { id: "brachioradialis-r", name: "Плечелучевая мышца", type: "muscle" },
      { id: "flexor-carpi-r", name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "radius-r", name: "Лучевая кость", type: "bone" },
      { id: "ulna-r", name: "Локтевая кость", type: "bone" },
    ],
  },
  {
    id: "front-forearm-left", name: "Левое предплечье", view: "front",
    bbox: [70, 67, 88, 79],
    structures: [
      { id: "brachioradialis", name: "Плечелучевая мышца", type: "muscle" },
      { id: "flexor-carpi", name: "Лучевой сгибатель запястья", type: "muscle" },
      { id: "radius", name: "Лучевая кость", type: "bone" },
      { id: "ulna", name: "Локтевая кость", type: "bone" },
    ],
  },
  {
    id: "front-wrist-hand-right", name: "Правое запястье / кисть", view: "front",
    bbox: [10, 78, 30, 90],
    structures: [
      { id: "wrist-joint-r", name: "Лучезапястный сустав", type: "joint" },
      { id: "carpal-tunnel-r", name: "Карпальный канал", type: "bone" },
      { id: "median-nerve-r", name: "Срединный нерв", type: "nerve" },
      { id: "flexor-tendons-r", name: "Сухожилия сгибателей", type: "tendon" },
    ],
  },
  {
    id: "front-wrist-hand-left", name: "Левое запястье / кисть", view: "front",
    bbox: [70, 78, 90, 90],
    structures: [
      { id: "wrist-joint", name: "Лучезапястный сустав", type: "joint" },
      { id: "carpal-tunnel", name: "Карпальный канал", type: "bone" },
      { id: "median-nerve", name: "Срединный нерв", type: "nerve" },
      { id: "flexor-tendons", name: "Сухожилия сгибателей", type: "tendon" },
    ],
  },
  {
    id: "front-abdomen-upper", name: "Верхний живот", view: "front",
    bbox: [32, 50, 68, 60],
    structures: [
      { id: "rectus-upper", name: "Прямая мышца живота (верх)", type: "muscle" },
      { id: "stomach", name: "Желудок", type: "organ" },
      { id: "liver", name: "Печень", type: "organ" },
      { id: "gallbladder", name: "Желчный пузырь", type: "organ" },
      { id: "pancreas", name: "Поджелудочная железа", type: "organ" },
      { id: "spleen", name: "Селезёнка", type: "organ" },
    ],
  },
  {
    id: "front-abdomen-lower", name: "Нижний живот", view: "front",
    bbox: [32, 59, 68, 68],
    structures: [
      { id: "rectus-lower", name: "Прямая мышца живота (низ)", type: "muscle" },
      { id: "small-intestine", name: "Тонкий кишечник", type: "organ" },
      { id: "large-intestine", name: "Толстый кишечник", type: "organ" },
      { id: "appendix", name: "Аппендикс", type: "organ" },
      { id: "bladder", name: "Мочевой пузырь", type: "organ" },
    ],
  },
  {
    id: "front-groin", name: "Таз / Пах", view: "front",
    bbox: [30, 67, 70, 74],
    structures: [
      { id: "iliac-crest", name: "Гребень подвздошной кости", type: "bone" },
      { id: "inguinal-lig", name: "Паховая связка", type: "ligament" },
      { id: "adductors", name: "Приводящие мышцы бедра", type: "muscle" },
    ],
  },
  {
    id: "front-hip-right", name: "Правый тазобедренный сустав", view: "front",
    // patient's RIGHT hip = screen LEFT, x=30-50%, y=72-80%
    bbox: [28, 72, 52, 81],
    structures: [
      { id: "hip-joint-r", name: "Тазобедренный сустав", type: "joint" },
      { id: "iliopsoas-r", name: "Подвздошно-поясничная мышца", type: "muscle" },
      { id: "groin-ligaments-r", name: "Паховые связки", type: "ligament" },
    ],
  },
  {
    id: "front-hip-left", name: "Левый тазобедренный сустав", view: "front",
    // patient's LEFT hip = screen RIGHT, x=50-72%
    bbox: [48, 72, 72, 81],
    structures: [
      { id: "hip-joint", name: "Тазобедренный сустав", type: "joint" },
      { id: "iliopsoas", name: "Подвздошно-поясничная мышца", type: "muscle" },
      { id: "groin-ligaments", name: "Паховые связки", type: "ligament" },
    ],
  },
  {
    id: "front-thigh-right", name: "Правое бедро", view: "front",
    // screen LEFT leg: x=30-50%, y=80-86%
    bbox: [29, 80, 50, 86],
    structures: [
      { id: "quadriceps-r", name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "rectus-femoris-r", name: "Прямая мышца бедра", type: "muscle" },
      { id: "vastus-med-r", name: "Медиальная широкая мышца", type: "muscle" },
      { id: "femur-r", name: "Бедренная кость", type: "bone" },
    ],
  },
  {
    id: "front-thigh-left", name: "Левое бедро", view: "front",
    // screen RIGHT leg: x=50-72%, y=80-86%
    bbox: [50, 80, 71, 86],
    structures: [
      { id: "quadriceps", name: "Четырёхглавая мышца бедра", type: "muscle" },
      { id: "rectus-femoris", name: "Прямая мышца бедра", type: "muscle" },
      { id: "vastus-med", name: "Медиальная широкая мышца", type: "muscle" },
      { id: "vastus-lat", name: "Латеральная широкая мышца", type: "muscle" },
      { id: "sartorius", name: "Портняжная мышца", type: "muscle" },
      { id: "femur", name: "Бедренная кость", type: "bone" },
    ],
  },
  {
    id: "front-knee-right", name: "Правое колено", view: "front",
    // screen LEFT leg (patient RIGHT): x=31-48%, y=85-93%
    bbox: [30, 85, 49, 93],
    structures: [
      { id: "knee-joint-r", name: "Коленный сустав", type: "joint" },
      { id: "patella-r", name: "Надколенник", type: "bone" },
      { id: "patellar-tendon-r", name: "Связка надколенника", type: "tendon" },
      { id: "acl-r", name: "Передняя крестообразная связка", type: "ligament" },
      { id: "meniscus-r", name: "Мениск", type: "joint" },
    ],
  },
  {
    id: "front-knee-left", name: "Левое колено", view: "front",
    // screen RIGHT leg (patient LEFT): x=51-70%, y=85-93%
    bbox: [51, 85, 70, 93],
    structures: [
      { id: "knee-joint", name: "Коленный сустав", type: "joint" },
      { id: "patella", name: "Надколенник", type: "bone" },
      { id: "patellar-tendon", name: "Связка надколенника", type: "tendon" },
      { id: "acl", name: "Передняя крестообразная связка", type: "ligament" },
      { id: "mcl", name: "Медиальная коллатеральная связка", type: "ligament" },
      { id: "meniscus", name: "Мениск", type: "joint" },
    ],
  },
  {
    id: "front-shin-right", name: "Правая голень", view: "front",
    // screen LEFT leg: x=32-47%, y=92-98%
    bbox: [31, 92, 48, 98],
    structures: [
      { id: "tibialis-ant-r", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia-r", name: "Большеберцовая кость", type: "bone" },
      { id: "peroneus-r", name: "Малоберцовые мышцы", type: "muscle" },
    ],
  },
  {
    id: "front-shin-left", name: "Левая голень", view: "front",
    // screen RIGHT leg: x=52-68%, y=92-98%
    bbox: [52, 92, 69, 98],
    structures: [
      { id: "tibialis-ant", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "tibia", name: "Большеберцовая кость", type: "bone" },
      { id: "peroneus", name: "Малоберцовые мышцы", type: "muscle" },
    ],
  },
  {
    id: "front-ankle-foot-right", name: "Правая лодыжка / стопа", view: "front",
    bbox: [29, 96, 47, 100],
    structures: [
      { id: "ankle-joint-r", name: "Голеностопный сустав", type: "joint" },
      { id: "achilles-r", name: "Ахиллово сухожилие", type: "tendon" },
      { id: "plantar-fascia-r", name: "Подошвенная фасция", type: "tendon" },
      { id: "calcaneus-r", name: "Пяточная кость", type: "bone" },
    ],
  },
  {
    id: "front-ankle-foot-left", name: "Левая лодыжка / стопа", view: "front",
    bbox: [53, 96, 71, 100],
    structures: [
      { id: "ankle-joint", name: "Голеностопный сустав", type: "joint" },
      { id: "achilles", name: "Ахиллово сухожилие", type: "tendon" },
      { id: "plantar-fascia", name: "Подошвенная фасция", type: "tendon" },
      { id: "calcaneus", name: "Пяточная кость", type: "bone" },
    ],
  },
];

// ==================== BACK VIEW ====================
// Back image 429x865 — same vertical proportions as front
// Back view mirrors front horizontally for patient anatomy
// patient's RIGHT = screen LEFT (same as front)
export const backZones: AnatomicalZone[] = [
  {
    id: "back-head", name: "Затылок", view: "back",
    bbox: [36, 3, 64, 20],
    structures: [
      { id: "occipitalis", name: "Затылочная мышца", type: "muscle" },
      { id: "suboccipital", name: "Подзатылочные мышцы", type: "muscle" },
      { id: "skull-b", name: "Кости черепа", type: "bone" },
    ],
  },
  {
    id: "back-neck", name: "Шея (сзади)", view: "back",
    bbox: [40, 18, 60, 26],
    structures: [
      { id: "trapezius-upper", name: "Верхняя трапециевидная мышца", type: "muscle" },
      { id: "cervical-spine-b", name: "Шейный отдел позвоночника", type: "bone" },
      { id: "levator-scapulae", name: "Мышца, поднимающая лопатку", type: "muscle" },
    ],
  },
  {
    id: "back-shoulder-right", name: "Правое плечо (сзади)", view: "back",
    bbox: [14, 28, 36, 48],
    structures: [
      { id: "deltoid-post-r", name: "Задняя головка дельтовидной мышцы", type: "muscle" },
      { id: "infraspinatus-r", name: "Подостная мышца", type: "muscle" },
      { id: "scapula-r", name: "Лопатка", type: "bone" },
    ],
  },
  {
    id: "back-shoulder-left", name: "Левое плечо (сзади)", view: "back",
    bbox: [64, 28, 86, 48],
    structures: [
      { id: "deltoid-post", name: "Задняя головка дельтовидной мышцы", type: "muscle" },
      { id: "infraspinatus", name: "Подостная мышца", type: "muscle" },
      { id: "teres-minor", name: "Малая круглая мышца", type: "muscle" },
      { id: "scapula", name: "Лопатка", type: "bone" },
    ],
  },
  {
    id: "back-upper-back", name: "Верхняя спина", view: "back",
    bbox: [30, 22, 70, 42],
    structures: [
      { id: "trapezius-mid", name: "Средняя трапециевидная мышца", type: "muscle" },
      { id: "rhomboids", name: "Ромбовидные мышцы", type: "muscle" },
      { id: "thoracic-spine", name: "Грудной отдел позвоночника", type: "bone" },
      { id: "latissimus-upper", name: "Широчайшая мышца (верх)", type: "muscle" },
    ],
  },
  {
    id: "back-mid-back", name: "Средняя спина", view: "back",
    bbox: [32, 41, 68, 54],
    structures: [
      { id: "latissimus-mid", name: "Широчайшая мышца спины", type: "muscle" },
      { id: "serratus-post", name: "Задняя зубчатая мышца", type: "muscle" },
      { id: "thoracic-spine-m", name: "Грудной отдел позвоночника", type: "bone" },
    ],
  },
  {
    id: "back-lower-back", name: "Поясница", view: "back",
    bbox: [32, 53, 68, 67],
    structures: [
      { id: "erector-spinae", name: "Мышца, выпрямляющая позвоночник", type: "muscle" },
      { id: "multifidus", name: "Многораздельная мышца", type: "muscle" },
      { id: "quadratus-lumborum", name: "Квадратная мышца поясницы", type: "muscle" },
      { id: "lumbar-spine", name: "Поясничный отдел позвоночника", type: "bone" },
      { id: "kidney", name: "Почки", type: "organ" },
      { id: "sciatic-nerve", name: "Седалищный нерв", type: "nerve" },
    ],
  },
  {
    id: "back-glutes", name: "Ягодицы", view: "back",
    bbox: [30, 67, 70, 78],
    structures: [
      { id: "gluteus-max", name: "Большая ягодичная мышца", type: "muscle" },
      { id: "gluteus-med", name: "Средняя ягодичная мышца", type: "muscle" },
      { id: "piriformis", name: "Грушевидная мышца", type: "muscle" },
      { id: "sacrum", name: "Крестец", type: "bone" },
      { id: "sciatic-nerve-b", name: "Седалищный нерв", type: "nerve" },
    ],
  },
  {
    id: "back-upper-arm-right", name: "Правое плечо (рука, сзади)", view: "back",
    bbox: [13, 44, 30, 62],
    structures: [
      { id: "triceps-b-r", name: "Трёхглавая мышца (трицепс)", type: "muscle" },
      { id: "humerus-b-r", name: "Плечевая кость", type: "bone" },
    ],
  },
  {
    id: "back-upper-arm-left", name: "Левое плечо (рука, сзади)", view: "back",
    bbox: [70, 44, 87, 62],
    structures: [
      { id: "triceps-b", name: "Трёхглавая мышца (трицепс)", type: "muscle" },
      { id: "humerus-b", name: "Плечевая кость", type: "bone" },
    ],
  },
  {
    id: "back-hamstring-right", name: "Правое бедро (задняя сторона)", view: "back",
    bbox: [28, 77, 50, 87],
    structures: [
      { id: "biceps-femoris-r", name: "Двуглавая мышца бедра", type: "muscle" },
      { id: "semitendinosus-r", name: "Полусухожильная мышца", type: "muscle" },
    ],
  },
  {
    id: "back-hamstring-left", name: "Левое бедро (задняя сторона)", view: "back",
    bbox: [50, 77, 72, 87],
    structures: [
      { id: "biceps-femoris", name: "Двуглавая мышца бедра", type: "muscle" },
      { id: "semitendinosus", name: "Полусухожильная мышца", type: "muscle" },
      { id: "semimembranosus", name: "Полуперепончатая мышца", type: "muscle" },
      { id: "femur-b", name: "Бедренная кость", type: "bone" },
    ],
  },
  {
    id: "back-knee-right", name: "Правое колено (сзади)", view: "back",
    bbox: [30, 85, 49, 93],
    structures: [
      { id: "popliteal-r", name: "Подколенная ямка", type: "joint" },
      { id: "pcl-r", name: "Задняя крестообразная связка", type: "ligament" },
      { id: "gastrocnemius-top-r", name: "Икроножная мышца (верх)", type: "muscle" },
    ],
  },
  {
    id: "back-knee-left", name: "Левое колено (сзади)", view: "back",
    bbox: [51, 85, 70, 93],
    structures: [
      { id: "popliteal", name: "Подколенная ямка", type: "joint" },
      { id: "pcl", name: "Задняя крестообразная связка", type: "ligament" },
      { id: "gastrocnemius-top", name: "Икроножная мышца (верх)", type: "muscle" },
    ],
  },
  {
    id: "back-calf-right", name: "Правая икра", view: "back",
    bbox: [31, 92, 48, 98],
    structures: [
      { id: "gastrocnemius-r", name: "Икроножная мышца", type: "muscle" },
      { id: "soleus-r", name: "Камбаловидная мышца", type: "muscle" },
      { id: "achilles-b-r", name: "Ахиллово сухожилие", type: "tendon" },
    ],
  },
  {
    id: "back-calf-left", name: "Левая икра", view: "back",
    bbox: [52, 92, 69, 98],
    structures: [
      { id: "gastrocnemius", name: "Икроножная мышца", type: "muscle" },
      { id: "soleus", name: "Камбаловидная мышца", type: "muscle" },
      { id: "achilles-b", name: "Ахиллово сухожилие", type: "tendon" },
    ],
  },
  {
    id: "back-heel-right", name: "Правая пятка", view: "back",
    bbox: [29, 96, 47, 100],
    structures: [
      { id: "calcaneus-b-r", name: "Пяточная кость", type: "bone" },
      { id: "achilles-ins-r", name: "Место прикрепления ахиллова сухожилия", type: "tendon" },
    ],
  },
  {
    id: "back-heel-left", name: "Левая пятка", view: "back",
    bbox: [53, 96, 71, 100],
    structures: [
      { id: "calcaneus-b", name: "Пяточная кость", type: "bone" },
      { id: "achilles-ins", name: "Место прикрепления ахиллова сухожилия", type: "tendon" },
    ],
  },
];

// ==================== LEFT SIDE VIEW ====================
// Image 434x899 — similar vertical proportions
// Side view: head at top, feet at bottom, facing direction varies
export const leftZones: AnatomicalZone[] = [
  {
    id: "left-head", name: "Голова (висок)", view: "left",
    bbox: [28, 3, 72, 20],
    structures: [
      { id: "temporalis-l", name: "Височная мышца", type: "muscle" },
      { id: "masseter-l", name: "Жевательная мышца", type: "muscle" },
      { id: "tmj-l", name: "Височно-нижнечелюстной сустав", type: "joint" },
    ],
  },
  {
    id: "left-neck", name: "Шея (сбоку)", view: "left",
    bbox: [35, 18, 65, 28],
    structures: [
      { id: "scm-l", name: "Грудино-ключично-сосцевидная мышца", type: "muscle" },
      { id: "scalene-l", name: "Лестничные мышцы", type: "muscle" },
      { id: "cervical-l", name: "Шейный отдел позвоночника", type: "bone" },
    ],
  },
  {
    id: "left-shoulder", name: "Плечо (сбоку)", view: "left",
    bbox: [18, 26, 58, 44],
    structures: [
      { id: "deltoid-mid-l", name: "Средняя часть дельтовидной мышцы", type: "muscle" },
      { id: "shoulder-joint-l", name: "Плечевой сустав", type: "joint" },
      { id: "subacromial-l", name: "Субакромиальная сумка", type: "joint" },
      { id: "rotator-cuff-l", name: "Ротаторная манжета", type: "tendon" },
    ],
  },
  {
    id: "left-chest-side", name: "Грудная клетка (сбоку)", view: "left",
    bbox: [33, 26, 75, 50],
    structures: [
      { id: "serratus-l", name: "Передняя зубчатая мышца", type: "muscle" },
      { id: "intercostal-l", name: "Межрёберные мышцы", type: "muscle" },
      { id: "ribs-l", name: "Рёбра", type: "bone" },
      { id: "lungs-l", name: "Лёгкие", type: "organ" },
    ],
  },
  {
    id: "left-upper-arm", name: "Плечо (рука, сбоку)", view: "left",
    bbox: [15, 43, 40, 63],
    structures: [
      { id: "biceps-l", name: "Двуглавая мышца плеча", type: "muscle" },
      { id: "triceps-l", name: "Трёхглавая мышца плеча", type: "muscle" },
      { id: "humerus-l", name: "Плечевая кость", type: "bone" },
    ],
  },
  {
    id: "left-abdomen", name: "Живот (сбоку)", view: "left",
    bbox: [33, 49, 75, 68],
    structures: [
      { id: "obliques-l", name: "Косые мышцы живота", type: "muscle" },
      { id: "rectus-l", name: "Прямая мышца живота", type: "muscle" },
      { id: "lumbar-l", name: "Поясничный отдел позвоночника", type: "bone" },
      { id: "kidney-l", name: "Левая почка", type: "organ" },
    ],
  },
  {
    id: "left-hip", name: "Тазобедренный сустав (сбоку)", view: "left",
    bbox: [28, 67, 68, 78],
    structures: [
      { id: "hip-joint-l", name: "Тазобедренный сустав", type: "joint" },
      { id: "it-band-l", name: "Подвздошно-большеберцовый тракт", type: "tendon" },
      { id: "gluteus-med-l", name: "Средняя ягодичная мышца", type: "muscle" },
      { id: "greater-trochanter-l", name: "Большой вертел бедра", type: "bone" },
    ],
  },
  {
    id: "left-thigh", name: "Бедро (сбоку)", view: "left",
    bbox: [26, 77, 67, 87],
    structures: [
      { id: "vastus-lat-l", name: "Латеральная широкая мышца", type: "muscle" },
      { id: "hamstrings-l", name: "Мышцы задней поверхности бедра", type: "muscle" },
      { id: "it-band-th-l", name: "Подвздошно-большеберцовый тракт", type: "tendon" },
      { id: "femur-l", name: "Бедренная кость", type: "bone" },
    ],
  },
  {
    id: "left-knee", name: "Колено (сбоку)", view: "left",
    bbox: [25, 86, 65, 93],
    structures: [
      { id: "knee-joint-l", name: "Коленный сустав", type: "joint" },
      { id: "patella-l", name: "Надколенник", type: "bone" },
      { id: "it-band-knee-l", name: "Подвздошно-большеберцовый тракт (колено)", type: "tendon" },
      { id: "lcl-l", name: "Латеральная коллатеральная связка", type: "ligament" },
      { id: "meniscus-l", name: "Мениск", type: "joint" },
      { id: "patellar-tendon-l", name: "Связка надколенника", type: "tendon" },
    ],
  },
  {
    id: "left-calf", name: "Голень (сбоку)", view: "left",
    bbox: [25, 92, 62, 98],
    structures: [
      { id: "tibialis-l", name: "Передняя большеберцовая мышца", type: "muscle" },
      { id: "gastrocnemius-l", name: "Икроножная мышца", type: "muscle" },
      { id: "peroneus-l", name: "Малоберцовые мышцы", type: "muscle" },
    ],
  },
  {
    id: "left-ankle", name: "Лодыжка / стопа (сбоку)", view: "left",
    bbox: [20, 97, 65, 100],
    structures: [
      { id: "ankle-joint-l", name: "Голеностопный сустав", type: "joint" },
      { id: "achilles-l", name: "Ахиллово сухожилие", type: "tendon" },
      { id: "atfl-l", name: "Передняя таранно-малоберцовая связка", type: "ligament" },
      { id: "plantar-l", name: "Подошвенная фасция", type: "tendon" },
    ],
  },
];

// ==================== RIGHT SIDE VIEW ====================
// Mirror of left — same bbox, different zone IDs/names
export const rightZones: AnatomicalZone[] = leftZones.map((z) => ({
  ...z,
  id: z.id.replace("left-", "right-"),
  name: z.name.replace("Левая", "Правая").replace("Левое", "Правое").replace("Левый", "Правый").replace("левая", "правая"),
  view: "right" as BodyView,
  structures: z.structures.map((s) => ({
    ...s,
    id: s.id + "-r",
  })),
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

// Find zone by checking if point (x%, y%) falls within bbox.
// If no exact match, returns the nearest zone by distance to bbox center.
export function findZoneAtPoint(x: number, y: number, view: BodyView): AnatomicalZone | null {
  const zones = getZonesForView(view);
  if (zones.length === 0) return null;

  // Iterate in reverse so smaller/more specific zones win over large ones
  for (let i = zones.length - 1; i >= 0; i--) {
    const [x1, y1, x2, y2] = zones[i].bbox;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      return zones[i];
    }
  }

  // Fallback: find the nearest zone by distance to bbox center
  let nearest: AnatomicalZone | null = null;
  let minDist = Infinity;
  for (const zone of zones) {
    const [x1, y1, x2, y2] = zone.bbox;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = zone;
    }
  }
  return nearest;
}
