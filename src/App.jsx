
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Home,
  Database,
  ChevronLeft,
  Upload,
  Download,
  FileJson,
  Sparkles,
  Link as LinkIcon,
  Package,
} from "lucide-react";

const defaultCards = [
  {
    id: "60060041",
    name: "L.S. Shadow Emperor Dragon Bekrelon",
    author: "Mardras",
    archetype: "L.S.",
    type: "Monster Effect Special Summon",
    attribute: "DIVINE",
    race: "Divine-Beast",
    level: 12,
    atk: 5000,
    def: 5000,
    cardType: "Monster",
    image: "https://placehold.co/280x410/2b2240/f6e5ff?text=Bekrelon",
    lore: 'Cannot be Normal Summoned/Set. Must be Special Summoned (from your hand/GY) by having 2+ other "L.S." monsters in your GY and 2+ "L.S." monsters banished.',
    status: "Legal",
    setGroup: "Imported from CDB",
  },
  {
    id: "60060092",
    name: "L.S. Jiauer",
    author: "Mardras",
    archetype: "L.S.",
    type: "Monster Effect Tuner",
    attribute: "DARK",
    race: "Psychic",
    level: 9,
    atk: 0,
    def: 500,
    cardType: "Monster",
    image: "https://placehold.co/280x410/1e3550/eaf5ff?text=Jiauer",
    lore: 'You can Special Summon it (from your hand) by paying 500 LP.',
    status: "Legal",
    setGroup: "Imported from CDB",
  },
  {
    id: "60060102",
    name: "L.S. Zero Hour",
    author: "Mardras",
    archetype: "L.S.",
    type: "Spell Quick-Play",
    attribute: "—",
    race: "Spell",
    cardType: "Spell",
    atk: "—",
    def: "—",
    image: "https://placehold.co/280x410/2d3f1e/f0ffe5?text=Zero+Hour",
    lore: 'The activation/effect of its activation/effects cannot be negated.',
    status: "Legal",
    setGroup: "Imported from CDB",
  },
];

const emptyTemplate = [
  {
    id: "your-card-id",
    name: "Your Card Name",
    author: "Mardras",
    archetype: "L.S.",
    cardType: "Monster",
    type: "Effect Monster",
    attribute: "DARK",
    race: "Dragon",
    level: 9,
    atk: 3000,
    def: 0,
    scales: "",
    image: "",
    lore: "Full card text here.",
    status: "Legal",
    setGroup: "Core",
  },
];

const STORAGE_KEY = "mardras-db-cards-v1";
const SETTINGS_KEY = "mardras-db-settings-v1";
const DEFAULT_PAGE_SIZE = 15;



const ATTRIBUTE_ICON_MAP = {
  DARK: "/icons/attributes/dark.png",
  EARTH: "/icons/attributes/earth.png",
  DIVINE: "/icons/attributes/divine.png",
  FIRE: "/icons/attributes/fire.png",
  LIGHT: "/icons/attributes/light.png",
  WATER: "/icons/attributes/water.png",
  WIND: "/icons/attributes/wind.png",
};

const CARD_TYPE_ICON_MAP = {
  Spell: "/icons/card-types/spell.png",
  Trap: "/icons/card-types/trap.png",
};

const PROPERTY_ICON_MAP = {
  Normal: "/icons/properties/normal.png",
  "Quick-Play": "/icons/properties/quickplay.png",
  Continuous: "/icons/properties/continuous.png",
  Ritual: "/icons/properties/ritual.png",
  Field: "/icons/properties/field.png",
  Equip: "/icons/properties/equipment.png",
  Counter: "/icons/properties/counter.png",
};

const LEVEL_ICON_MAP = {
  level: "/icons/levels/star.png",
  rank: "/icons/levels/estar.png",
};

const PENDULUM_SCALE_ICON = "/icons/pendulum/Pendulum_Scale.png";

function getAttributeIcon(attribute) {
  return ATTRIBUTE_ICON_MAP[String(attribute || "").toUpperCase()] || null;
}

function getCardTypeIcon(cardType) {
  return CARD_TYPE_ICON_MAP[String(cardType || "")] || null;
}

function getPropertyIcon(property) {
  const normalized = String(property || "").trim().toLowerCase();
  const propertyEntry = Object.entries(PROPERTY_ICON_MAP).find(([label]) =>
    label.toLowerCase() === normalized || label.toLowerCase().replace(/-/g, "") === normalized.replace(/-/g, "")
  );
  return propertyEntry ? propertyEntry[1] : null;
}

function getLevelIcon(card) {
  const isXyz = `${card.cardType || ""} ${card.type || ""}`.toLowerCase().includes("xyz");
  return isXyz ? LEVEL_ICON_MAP.rank : LEVEL_ICON_MAP.level;
}

function getLevelLabel(card) {
  const typeText = `${card.cardType || ""} ${card.type || ""}`.toLowerCase();
  if (typeText.includes("xyz")) return "Rank";
  if (typeText.includes("link")) return "Link Rating";
  return "Level";
}

function isHybridSpellTrap(card) {
  const cardType = String(card.cardType || "").trim().toLowerCase();
  const rawType = String(card.type || "").trim().toLowerCase();

  return (
    cardType === "spell / trap" ||
    cardType === "spell/trap" ||
    rawType === "spell & trap" ||
    rawType === "spell and trap" ||
    rawType === "spell / trap" ||
    rawType === "spell/trap"
  );
}

function getSpellTrapBaseTypes(card) {
  if (isHybridSpellTrap(card)) return ["Spell", "Trap"];

  const cardType = String(card.cardType || "").trim().toLowerCase();
  if (cardType === "spell") return ["Spell"];
  if (cardType === "trap") return ["Trap"];
  return [];
}

function normalizeSpellTrapProperty(part) {
  const p = String(part || "").trim().toLowerCase();
  if (!p) return "";
  if (p === "quick-play" || p === "quickplay") return "Quick-Play";
  if (p === "equip" || p === "equipment") return "Equip";
  if (p === "continuous") return "Continuous";
  if (p === "ritual") return "Ritual";
  if (p === "field") return "Field";
  if (p === "counter") return "Counter";
  if (p === "normal") return "Normal";
  return String(part).trim();
}

function getSpellTrapProperties(card) {
  const baseTypes = getSpellTrapBaseTypes(card);
  if (!baseTypes.length) {
    return [];
  }

  const rawProperty = String(card.property || "").trim();
  if (rawProperty) {
    return [normalizeSpellTrapProperty(rawProperty) || "Normal"];
  }

  const rawType = String(card.type || "").trim();
  if (!rawType) return ["Normal"];

  const parts = rawType
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const filtered = parts
    .filter((part) => {
      const p = part.toLowerCase();
      return (
        p !== "spell" &&
        p !== "trap" &&
        p !== "spell/trap" &&
        p !== "spell" &&
        p !== "&" &&
        p !== "/" &&
        p !== "and"
      );
    })
    .map((part) => normalizeSpellTrapProperty(part))
    .filter(Boolean);

  const unique = [];
  const seen = new Set();
  filtered.forEach((part) => {
    const key = String(part).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(part);
    }
  });

  return unique.length ? unique : ["Normal"];
}

function TypeLineWithIcons({ card }) {
  const baseTypes = getSpellTrapBaseTypes(card);

  if (baseTypes.length) {
    const properties = getSpellTrapProperties(card);

    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {properties.map((part, index) => {
          const iconSrc = getPropertyIcon(part);
          return (
            <span key={`${part}-${index}`} className="inline-flex items-center gap-1">
              <span>{part}</span>
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt={`${part} icon`}
                  className="h-7 w-7 object-contain"
                  loading="lazy"
                />
              ) : null}
            </span>
          );
        })}
      </div>
    );
  }

  return <span>{getDisplayTypes(card)}</span>;
}

function LevelValue({ card }) {
  const rawValue = card.level ?? card.link ?? "";
  const count = Number(rawValue);
  const iconSrc = getLevelIcon(card);
  const safeCount = Number.isFinite(count) && count > 0 ? Math.min(count, 13) : 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span>{rawValue || "—"}</span>
      {safeCount ? (
        <div className="flex flex-wrap items-center gap-0.5">
          {Array.from({ length: safeCount }).map((_, index) => (
            <img
              key={index}
              src={iconSrc}
              alt={getLevelLabel(card)}
              className="h-5 w-5 object-contain"
              loading="lazy"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PendulumScaleValue({ value }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={PENDULUM_SCALE_ICON}
        alt="Pendulum Scale"
        className="h-5 w-5 object-contain"
        loading="lazy"
      />
      <span>{value || "—"}</span>
    </div>
  );
}

function StatValueWithIcon({ value, iconSrc, iconAlt }) {
  return (
    <div className="flex items-center gap-2">
      <span>{value || "—"}</span>
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={iconAlt || "icon"}
          className="h-8 w-8 object-contain"
          loading="lazy"
        />
      ) : null}
    </div>
  );
}

const defaultSettings = {
  imageBaseUrl: "/cards",
  imageExtension: "jpg",
  dataUrl: "/data/cards.json",
  downloads: [
    {
      id: "ls-pack-main",
      title: "L.S. Pack for EDOPro",
      description: "Main custom pack download for the L.S. cards.",
      url: "https://mega.nz/file/GpJSgKpC#_mbTXl1_4vnHXWp8jxRPnpka99O6N-bHmNN11bdKypg",
    },
  ],
};

function normalizeCard(card, index, settings = defaultSettings) {
  return {
    id: String(card.id || `card-${index + 1}`),
    name: card.name || `Untitled Card ${index + 1}`,
    author: card.author || "Mardras",
    archetype: card.archetype || "Other Customs",
    type: card.type || card.race || "Effect Monster",
    attribute: card.attribute || "—",
    race: card.race || card.type || "—",
    level: card.level ?? "",
    rank: card.rank ?? "",
    linkRating: card.linkRating ?? "",
    leftScale: card.leftScale ?? "",
    rightScale: card.rightScale ?? "",
    atk: card.atk ?? "—",
    def: card.def ?? "—",
    scales: card.scales || "",
    property: card.property || "",
    cardType: card.cardType || "Monster",
    image:
      card.image ||
      (card.id && settings.imageBaseUrl
        ? `${settings.imageBaseUrl.replace(/\/$/, "")}/${card.id}.${settings.imageExtension || "jpg"}`
        : "https://placehold.co/280x410/e5e7eb/475569?text=No+Image"),
    lore: card.lore || "No effect text provided.",
    status: card.status || "Legal",
    setGroup: card.setGroup || "Unsorted",
  };
}


function getDisplayTypes(card) {
  if (card.cardType === "Monster") {
    const typeParts = String(card.type || "")
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    const filteredParts = typeParts.filter(
      (part) => !["Monster", "Normal", "Spell", "Trap"].includes(part)
    );

    const uniqueParts = [];
    const seen = new Set();

    [card.race, ...filteredParts].forEach((part) => {
      if (!part) return;
      if (seen.has(part)) return;
      seen.add(part);
      uniqueParts.push(part);
    });

    return uniqueParts.join(" ") || card.race || card.type || "—";
  }

  if (getSpellTrapBaseTypes(card).length) {
    const baseTypes = getSpellTrapBaseTypes(card);
    const label = baseTypes.join(" / ");
    const properties = getSpellTrapProperties(card);
    return properties.length ? [label, ...properties].join(" ") : label;
  }

  return card.type || card.race || "—";
}



function isPendulumCard(card) {
  return `${card.cardType || ""} ${card.type || ""}`.toLowerCase().includes("pendulum");
}


function isExtraDeckMonster(card) {
  const typeText = `${card.cardType || ""} ${card.type || ""}`.toLowerCase();
  return card.cardType === "Monster" && ["fusion", "synchro", "xyz", "link"].some((part) => typeText.includes(part));
}

function splitExtraDeckLore(lore) {
  const source = String(lore || "").trim();
  if (!source) return { materials: "", effect: "" };

  const normalized = source.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return {
      materials: lines[0],
      effect: lines.slice(1).join("\n").trim(),
    };
  }

  const starters = [
    /\bMust be\b/i,
    /\bCannot be\b/i,
    /\bIf\b/i,
    /\bWhen\b/i,
    /\bOnce per turn\b/i,
    /\bOnce while\b/i,
    /\bDuring\b/i,
    /\bYou can\b/i,
    /\bYour opponent\b/i,
    /\bThis card\b/i,
    /\bMonsters\b/i,
    /\bAny\b/i,
    /\bQuick Effect\b/i,
    /\bGains\b/i,
    /\bUnaffected\b/i,
  ];

  const materialLike = /(?:\+|\bLevel\b|\bRank\b|\bTuner\b|\bnon-Tuner\b|\bmaterials?\b|\bmonsters?\b|\bTokens?\b|\bPendulum\b|\bSynchro\b|\bFusion\b|\bLink\b|\bXyz\b|"[^"]+")/i;

  let splitIndex = -1;
  for (const starter of starters) {
    const match = starter.exec(normalized);
    if (!match) continue;
    const idx = match.index;
    if (idx < 20) continue;
    const before = normalized.slice(0, idx).trim();
    if (!materialLike.test(before)) continue;
    splitIndex = idx;
    break;
  }

  if (splitIndex === -1) {
    return { materials: "", effect: source };
  }

  return {
    materials: normalized.slice(0, splitIndex).trim(),
    effect: normalized.slice(splitIndex).trim(),
  };
}

function ExtraDeckLoreContent({ text }) {
  const sections = splitExtraDeckLore(text);
  if (!sections.materials) {
    return <div className="whitespace-pre-wrap">{text || "No effect text provided."}</div>;
  }

  return (
    <div>
      <div className="whitespace-pre-wrap">{sections.materials}</div>
      {sections.effect ? <div className="mt-1 whitespace-pre-wrap">{sections.effect}</div> : null}
    </div>
  );
}

function splitPendulumLore(lore) {
  const source = String(lore || "").trim();
  if (!source) return { pendulum: "", monster: "" };

  const normalized = source
    .replace(/\[\s*Pendulum Effect\s*\]/gi, "\n[PENDULUM_EFFECT]\n")
    .replace(/\[\s*Monster Effect\s*\]/gi, "\n[MONSTER_EFFECT]\n")
    .replace(/-{8,}/g, "\n");

  const hasPendulum = normalized.includes("[PENDULUM_EFFECT]");
  const hasMonster = normalized.includes("[MONSTER_EFFECT]");

  if (!hasPendulum && !hasMonster) {
    return { pendulum: "", monster: source };
  }

  const pendulumMatch = normalized.match(/\[PENDULUM_EFFECT\]([\s\S]*?)(?=\[MONSTER_EFFECT\]|$)/);
  const monsterMatch = normalized.match(/\[MONSTER_EFFECT\]([\s\S]*?)$/);

  const pendulum = pendulumMatch ? pendulumMatch[1].trim().replace(/^\n+|\n+$/g, "") : "";
  let monster = monsterMatch ? monsterMatch[1].trim().replace(/^\n+|\n+$/g, "") : "";

  if (!monster) {
    monster = normalized
      .replace(/\[PENDULUM_EFFECT\]/g, "")
      .replace(/\[MONSTER_EFFECT\]/g, "")
      .trim();
  }

  return { pendulum, monster };
}

function LoreBlock({ card }) {
  if (!isPendulumCard(card)) {
    return (
      <div className="bg-white px-4 py-4 text-sm leading-7 text-slate-800">
        {isExtraDeckMonster(card) ? (
          <ExtraDeckLoreContent text={card.lore} />
        ) : (
          <div className="whitespace-pre-wrap">{card.lore || "No effect text provided."}</div>
        )}
      </div>
    );
  }

  const sections = splitPendulumLore(card.lore);
  const hasPendulumSection = Boolean(sections.pendulum);
  const hasMonsterSection = Boolean(sections.monster);

  if (!hasPendulumSection && !hasMonsterSection) {
    return (
      <div className="bg-white px-4 py-4 text-sm leading-7 text-slate-800 whitespace-pre-wrap">
        {card.lore || "No effect text provided."}
      </div>
    );
  }

  return (
    <div className="bg-white px-4 py-4 text-sm leading-7 text-slate-800">
      {hasPendulumSection ? (
        <div className="whitespace-pre-wrap">
          <div className="mb-1 text-[15px] font-semibold text-slate-900">Pendulum Effect</div>
          <div>{sections.pendulum}</div>
        </div>
      ) : null}

      {hasPendulumSection && hasMonsterSection ? (
        <div className="my-3 border-t border-slate-200" />
      ) : null}

      {hasMonsterSection ? (
        <div className="whitespace-pre-wrap">
          <div className="mb-1 text-[15px] font-semibold text-slate-900">Monster Effect</div>
          {isExtraDeckMonster(card) ? <ExtraDeckLoreContent text={sections.monster} /> : <div>{sections.monster}</div>}
        </div>
      ) : null}
    </div>
  );
}

function getCardPalette(card) {
  const typeText = `${card.cardType || ""} ${card.type || ""}`.toLowerCase();

  if (typeText.includes("token")) {
    return {
      shell: "border-[#8f8f8f] bg-[#d9d9d9]",
      header: "border-[#9d9d9d] bg-[#c7c7c7]",
      subheader: "border-slate-300 bg-[#ececec]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("synchro")) {
    return {
      shell: "border-[#9ea0a8] bg-[#dddddf]",
      header: "border-[#acafb8] bg-[#cbccd1]",
      subheader: "border-slate-300 bg-[#f2f3f5]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("xyz")) {
    return {
      shell: "border-[#4b4b52] bg-[#6b6b74]",
      header: "border-[#5a5a62] bg-[#55555d]",
      subheader: "border-slate-500 bg-[#7a7a83]",
      panel: "border-slate-500 bg-white",
    };
  }
  if (typeText.includes("fusion")) {
    return {
      shell: "border-[#8576a1] bg-[#c6bed0]",
      header: "border-[#8b7ca8] bg-[#b7a8cf]",
      subheader: "border-slate-300 bg-[#efe9f8]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("ritual")) {
    return {
      shell: "border-[#6a86b0] bg-[#c8d8ec]",
      header: "border-[#7090bb] bg-[#b6cce8]",
      subheader: "border-slate-300 bg-[#edf4fb]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("spell")) {
    return {
      shell: "border-[#4f8b84] bg-[#c6e0db]",
      header: "border-[#5d9991] bg-[#add2ca]",
      subheader: "border-slate-300 bg-[#e8f6f3]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("trap")) {
    return {
      shell: "border-[#8f6689] bg-[#d7c1d4]",
      header: "border-[#9a7394] bg-[#cfaecb]",
      subheader: "border-slate-300 bg-[#f4eaf2]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("link")) {
    return {
      shell: "border-[#517ca8] bg-[#c8d9eb]",
      header: "border-[#5c8bba] bg-[#b4cde6]",
      subheader: "border-slate-300 bg-[#edf4fb]",
      panel: "border-slate-400 bg-white",
    };
  }
  if (typeText.includes("normal")) {
    return {
      shell: "border-[#b49268] bg-[#ecd7bd]",
      header: "border-[#c09b70] bg-[#e4c39a]",
      subheader: "border-slate-300 bg-[#f9efdf]",
      panel: "border-slate-400 bg-white",
    };
  }

  return {
    shell: "border-[#b78d62] bg-[#edd2b4]",
    header: "border-[#c79b6d] bg-[#f58a52]",
    subheader: "border-slate-300 bg-[#fff3eb]",
    panel: "border-slate-400 bg-white",
  };
}

function parseRoute(cards) {
  const path = window.location.pathname || "/";
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "card" && parts[1]) {
    const found = cards.find((card) => String(card.id) === String(parts[1]));
    if (found) return { page: "card", selectedCard: found, archetypeFilter: null };
  }
  if (parts[0] === "archetype" && parts[1]) {
    return {
      page: "archetype",
      selectedCard: null,
      archetypeFilter: decodeURIComponent(parts[1]),
    };
  }
  if (parts[0] === "downloads") return { page: "downloads", selectedCard: null, archetypeFilter: null };
  if (parts[0] === "database") return { page: "database", selectedCard: null, archetypeFilter: null };
  return { page: "home", selectedCard: null, archetypeFilter: null };
}

function StatRow({ label, value }) {
  return (
    <div className="grid grid-cols-[150px_1fr] border-b border-slate-300/80 text-sm">
      <div className="bg-slate-100 px-3 py-2 font-semibold text-slate-700">{label}</div>
      <div className="bg-white px-3 py-2 text-slate-800 break-words">{value || "—"}</div>
    </div>
  );
}

function getCardTypeDisplay(card) {
  const baseTypes = getSpellTrapBaseTypes(card);

  if (baseTypes.length === 2) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {baseTypes.map((part, index) => (
          <React.Fragment key={`${part}-${index}`}>
            {index > 0 ? <span>/</span> : null}
            <span className="inline-flex items-center gap-2">
              <span>{part}</span>
              <img src={getCardTypeIcon(part)} alt={`${part} icon`} className="h-8 w-8 object-contain" loading="lazy" />
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (baseTypes.length === 1) {
    const label = baseTypes[0];
    const iconSrc = getCardTypeIcon(label);
    return <StatValueWithIcon value={label} iconSrc={iconSrc} iconAlt={`${label} icon`} />;
  }

  const iconSrc = ["Spell", "Trap"].includes(card.cardType) ? getCardTypeIcon(card.cardType) : null;
  return <StatValueWithIcon value={card.cardType} iconSrc={iconSrc} iconAlt={`${card.cardType} icon`} />;
}

function getAttributeDisplay(card) {
  return (
    <StatValueWithIcon
      value={card.attribute}
      iconSrc={getAttributeIcon(card.attribute)}
      iconAlt={`${card.attribute} attribute`}
    />
  );
}

function CardThumb({ card, onOpen }) {
  return (
    <button
      onClick={() => onOpen(card)}
      className="group overflow-hidden rounded-2xl border border-slate-300 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-100">
        <img src={card.image} alt={card.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
      </div>
      <div className="space-y-1 p-3">
        <div className="line-clamp-2 text-sm font-semibold text-slate-900">{card.name}</div>
        <div className="text-xs text-slate-500">{card.archetype} • {card.cardType}</div>
        <div className="text-xs text-slate-400">By {card.author || "Mardras"}</div>
        <div className="text-[11px] text-slate-400">ID: {card.id}</div>
      </div>
    </button>
  );
}

function FeaturedCard({ card, onOpen }) {
  return (
    <button
      onClick={() => onOpen(card)}
      className="grid gap-4 rounded-[24px] border border-slate-300 bg-white p-4 text-left shadow-sm transition hover:shadow-lg md:grid-cols-[140px_1fr]"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <img src={card.image} alt={card.name} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{card.archetype}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{card.cardType}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">{card.name}</h3>
        <p className="line-clamp-4 text-sm leading-6 text-slate-600">{card.lore}</p>
      </div>
    </button>
  );
}

function ImportPanel({ cards, onImport, onReset, settings, onSaveSettings, onLoadFromUrl }) {
  const [text, setText] = useState(JSON.stringify(cards, null, 2));
  const [imageBaseUrl, setImageBaseUrl] = useState(settings.imageBaseUrl || "");
  const [imageExtension, setImageExtension] = useState(settings.imageExtension || "jpg");
  const [downloadsText, setDownloadsText] = useState(JSON.stringify(settings.downloads || [], null, 2));
  const [dataUrl, setDataUrl] = useState(settings.dataUrl || "");
  const [message, setMessage] = useState("Paste your full card JSON here, then click Import.");
  const [ok, setOk] = useState(true);

  useEffect(() => {
    setText(JSON.stringify(cards, null, 2));
  }, [cards]);

  useEffect(() => {
    setImageBaseUrl(settings.imageBaseUrl || "");
    setImageExtension(settings.imageExtension || "jpg");
    setDataUrl(settings.dataUrl || "");
    setDownloadsText(JSON.stringify(settings.downloads || [], null, 2));
  }, [settings]);

  function handleImport() {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("The imported file must be a JSON array of card objects.");
      onImport(parsed);
      setOk(true);
      setMessage(`Imported ${parsed.length} cards successfully.`);
    } catch (error) {
      setOk(false);
      setMessage(error.message || "Invalid JSON.");
    }
  }

  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSaveSettings() {
    try {
      const parsedDownloads = JSON.parse(downloadsText);
      if (!Array.isArray(parsedDownloads)) throw new Error("Downloads must be a JSON array.");
      onSaveSettings({
        imageBaseUrl,
        imageExtension,
        dataUrl,
        downloads: parsedDownloads,
      });
      setOk(true);
      setMessage("Settings saved successfully.");
    } catch (error) {
      setOk(false);
      setMessage(error.message || "Invalid settings JSON.");
    }
  }

  return (
    <section className="space-y-6 rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Bulk JSON card import</h3>
          <p className="text-sm text-slate-600">This is the easiest way to scale the site to all your custom cards.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadJson("mardras-db-template.json", emptyTemplate)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <FileJson className="h-4 w-4" /> Template
          </button>
          <button onClick={() => downloadJson("mardras-db-cards.json", cards)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <Download className="h-4 w-4" /> Export current JSON
          </button>
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100">
            Reset sample data
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-900">Card JSON</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="min-h-[320px] w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 outline-none"
        />
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">Image auto-link settings</div>
          <input value={imageBaseUrl} onChange={(e) => setImageBaseUrl(e.target.value)} placeholder="/cards" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none" />
          <input value={imageExtension} onChange={(e) => setImageExtension(e.target.value)} placeholder="jpg" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none" />
          <input value={dataUrl} onChange={(e) => setDataUrl(e.target.value)} placeholder="/data/cards.json or full URL" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none" />
        </div>
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">Download links JSON</div>
          <textarea
            value={downloadsText}
            onChange={(e) => setDownloadsText(e.target.value)}
            spellCheck={false}
            className="min-h-[150px] w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className={`text-sm ${ok ? "text-slate-600" : "text-red-700"}`}>{message}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSaveSettings} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <LinkIcon className="h-4 w-4" /> Save Settings
          </button>
          <button onClick={() => onLoadFromUrl(dataUrl)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Download className="h-4 w-4" /> Load from URL
          </button>
          <button onClick={handleImport} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <Upload className="h-4 w-4" /> Import JSON
          </button>
        </div>
      </div>
    </section>
  );
}

function HomePage({ onBrowse, cards, onOpen, onImport, onReset, settings, onSaveSettings, onLoadFromUrl }) {
  const featured = cards.slice(0, 3);
  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-300 bg-gradient-to-br from-[#d8c8ea] via-[#efe8f8] to-[#dde7c6] p-8 shadow-sm">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            Personal Card Database
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Mardras-db.com</h1>
          <p className="text-base leading-7 text-slate-700">A custom card database for L.S. cards and the rest of your original projects.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={onBrowse} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Open Database
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featured.map((card) => <FeaturedCard key={card.id} card={card} onOpen={onOpen} />)}
      </section>

      <section className="space-y-4 rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">Downloads</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(settings.downloads || []).map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
              <div className="mb-1 text-base font-semibold text-slate-900">{item.title}</div>
              <div className="mb-3 text-sm text-slate-600">{item.description}</div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                <Download className="h-4 w-4" /> Download pack
              </div>
            </a>
          ))}
        </div>
      </section>

      <ImportPanel cards={cards} onImport={onImport} onReset={onReset} settings={settings} onSaveSettings={onSaveSettings} onLoadFromUrl={onLoadFromUrl} />
    </div>
  );
}

function DatabasePage({ cards, onOpen }) {
  const [query, setQuery] = useState("");
  const [archetype, setArchetype] = useState("All");
  const [cardType, setCardType] = useState("All");
  const [sortMode, setSortMode] = useState("id-asc");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(1);
  const [attributeFilter, setAttributeFilter] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const archetypes = ["All", ...new Set(cards.map((c) => c.archetype).filter(Boolean))];
  const cardTypes = ["All", ...new Set(cards.map((c) => c.cardType).filter(Boolean))];
  const attributes = ["All", ...new Set(cards.map((c) => c.attribute).filter(Boolean))];
  const authors = ["All", ...new Set(cards.map((c) => c.author).filter(Boolean))];
  const statuses = ["All", ...new Set(cards.map((c) => c.status).filter(Boolean))];

  const filtered = useMemo(() => {
    const base = cards.filter((card) => {
      const matchQuery =
        !query ||
        [card.id, card.name, card.author, card.type, card.attribute, card.race, card.archetype, card.setGroup, card.status, card.lore]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      return (
        matchQuery &&
        (archetype === "All" || card.archetype === archetype) &&
        (cardType === "All" || card.cardType === cardType) &&
        (attributeFilter === "All" || card.attribute === attributeFilter) &&
        (authorFilter === "All" || card.author === authorFilter) &&
        (statusFilter === "All" || card.status === statusFilter)
      );
    });

    return [...base].sort((a, b) => {
      if (sortMode === "name-asc") return a.name.localeCompare(b.name);
      if (sortMode === "name-desc") return b.name.localeCompare(a.name);
      if (sortMode === "id-desc") return Number(b.id) - Number(a.id);
      return Number(a.id) - Number(b.id);
    });
  }, [cards, query, archetype, cardType, attributeFilter, authorFilter, statusFilter, sortMode]);

  useEffect(() => {
    setPageIndex(1);
  }, [query, archetype, cardType, attributeFilter, authorFilter, statusFilter, sortMode, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Filters</h3>
          <p className="text-sm text-slate-600">Refine the database like a proper wiki directory.</p>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Archetype &gt;</div>
          <select value={archetype} onChange={(e) => setArchetype(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">{archetypes.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Card Type &gt;</div>
          <select value={cardType} onChange={(e) => setCardType(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">{cardTypes.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Attribute</div>
          <select value={attributeFilter} onChange={(e) => setAttributeFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">{attributes.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Author &gt;</div>
          <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">{authors.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Banlist Status &gt;</div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Search by ID</div>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value="id-asc">ID ↑</option>
            <option value="id-desc">ID ↓</option>
            <option value="name-asc">Name A→Z</option>
            <option value="name-desc">Name Z→A</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Cards per page</div>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">
            <option value={15}>15 / page</option>
            <option value={30}>30 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Custom Database</h2>
              <p className="text-sm text-slate-600">Showing {filtered.length} cards</p>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID, name, type, archetype, author, status, or text..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((card) => <CardThumb key={card.id} card={card} onOpen={onOpen} />)}
        </div>

        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">Page {pageIndex} of {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPageIndex((p) => Math.max(1, p - 1))} disabled={pageIndex === 1} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
            <button onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))} disabled={pageIndex === totalPages} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}


function formatStatValue(value) {
  if (value === -2 || value === "-2") return "?";
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function getBattleStatDisplay(card) {
  const typeText = `${card.cardType || ""} ${card.type || ""}`.toLowerCase();
  if (card.cardType !== "Monster") {
    return null;
  }
  if (typeText.includes("link")) {
    return {
      label: "ATK / LINK",
      value: `${formatStatValue(card.atk)} / ${formatStatValue(card.linkRating)}`,
    };
  }
  return {
    label: "ATK / DEF",
    value: `${formatStatValue(card.atk)} / ${formatStatValue(card.def)}`,
  };
}

function CardDetail({ card, cards, onBack, onOpen }) {
  const index = cards.findIndex((c) => String(c.id) === String(card.id));
  const prev = index > 0 ? cards[index - 1] : null;
  const next = index < cards.length - 1 ? cards[index + 1] : null;
  const sameArchetype = cards.filter((c) => c.archetype === card.archetype);
  const palette = getCardPalette(card);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          <ChevronLeft className="h-4 w-4" /> Back to database
        </button>
        {prev && <button onClick={() => onOpen(prev)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">◀ Previous</button>}
        {next && <button onClick={() => onOpen(next)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Next ▶</button>}
      </div>

      <div className={`overflow-hidden rounded-[28px] border shadow-sm ${palette.shell}`}>
        <div className={`border-b px-6 py-4 text-center ${palette.header}`}>
          <h1 className="text-3xl font-bold text-slate-900">{card.name}</h1>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <div className={`group overflow-hidden rounded-xl shadow-sm ${palette.panel}`}>
              <img src={card.image} alt={card.name} className="w-full object-cover transition duration-300 group-hover:scale-[1.5] origin-top" />
            </div>

            <div className={`rounded-xl p-4 text-sm text-slate-700 shadow-sm ${palette.panel}`}>
              <div className="mb-1 font-semibold text-slate-900">Status</div>
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.status === "Banned" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{card.status}</div>
            </div>

            <div className={`rounded-xl p-4 text-sm text-slate-700 shadow-sm ${palette.panel}`}>
              <div className="mb-2 font-semibold text-slate-900">More from this archetype</div>
              <div className="flex flex-wrap gap-2">
                {sameArchetype.slice(0, 6).map((c) => (
                  <button key={c.id} onClick={() => onOpen(c)} className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs hover:bg-slate-100">
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`overflow-hidden rounded-xl shadow-sm ${palette.panel}`}>
              <StatRow label="Card ID" value={card.id} />
              <StatRow label="Card type" value={getCardTypeDisplay(card)} />
              {card.cardType === "Monster" ? <StatRow label="Attribute" value={getAttributeDisplay(card)} /> : null}
              <StatRow label="Types" value={<TypeLineWithIcons card={card} />} />
              {card.level ? <StatRow label={getLevelLabel(card)} value={<LevelValue card={card} />} /> : null}
              {card.scales ? <StatRow label="Pendulum Scale" value={<PendulumScaleValue value={card.scales} />} /> : null}
              {getBattleStatDisplay(card) ? (
                <StatRow label={getBattleStatDisplay(card).label} value={getBattleStatDisplay(card).value} />
              ) : null}
              <StatRow label="Archetype" value={card.archetype} />
              <StatRow label="Author" value={card.author || "Mardras"} />
              <StatRow label="Lore group" value={card.setGroup} />
            </div>

            <div className={`overflow-hidden rounded-xl shadow-sm ${palette.panel}`}>
              <div className={`border-b px-4 py-3 text-lg font-semibold text-slate-900 ${palette.subheader}`}>Effect / Lore</div>
              <LoreBlock card={card} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadsPage({ settings }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-slate-700" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Downloads</h2>
            <p className="text-sm text-slate-600">Direct pack links for EDOPro and related custom card files.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(settings.downloads || []).map((item) => (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-2 text-lg font-semibold text-slate-900">{item.title}</div>
            <div className="mb-4 text-sm leading-6 text-slate-600">{item.description}</div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              <Download className="h-4 w-4" /> Download
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function ArchetypePage({ cards, archetype, onOpen, onBrowseAll }) {
  const filtered = cards.filter((card) => card.archetype === archetype);
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Archetype: {archetype}</h2>
            <p className="text-sm text-slate-600">Direct archetype page with all matching custom cards.</p>
          </div>
          <button onClick={onBrowseAll} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            View full database
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((card) => <CardThumb key={card.id} card={card} onOpen={onOpen} />)}
      </div>
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) return defaultSettings;
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        downloads: Array.isArray(parsed?.downloads) ? parsed.downloads : defaultSettings.downloads,
      };
    } catch {
      return defaultSettings;
    }
  });

  const [cards, setCards] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultCards.map((card, index) => normalizeCard(card, index, defaultSettings));
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map((card, index) => normalizeCard(card, index, defaultSettings))
        : defaultCards.map((card, index) => normalizeCard(card, index, defaultSettings));
    } catch {
      return defaultCards.map((card, index) => normalizeCard(card, index, defaultSettings));
    }
  });

  const initialRoute = useMemo(() => parseRoute(cards), [cards]);
  const [page, setPage] = useState(initialRoute.page);
  const [selectedCard, setSelectedCard] = useState(initialRoute.selectedCard);
  const [archetypeFilter, setArchetypeFilter] = useState(initialRoute.archetypeFilter);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const syncFromHistory = () => {
      const route = parseRoute(cards);
      setPage(route.page);
      setSelectedCard(route.selectedCard);
      setArchetypeFilter(route.archetypeFilter);
    };
    window.addEventListener("popstate", syncFromHistory);
    syncFromHistory();
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, [cards]);

  function navigate(path) {
    window.history.pushState({}, "", path);
    const route = parseRoute(cards);
    setPage(route.page);
    setSelectedCard(route.selectedCard);
    setArchetypeFilter(route.archetypeFilter);
  }

  function goHome() {
    navigate("/");
  }

  function goDatabase() {
    navigate("/database");
  }

  function goDownloads() {
    navigate("/downloads");
  }

  function openCard(card) {
    navigate(`/card/${card.id}`);
  }

  function openArchetype(archetype) {
    navigate(`/archetype/${encodeURIComponent(archetype)}`);
  }

  function handleImport(newCards) {
    const normalized = newCards.map((card, index) => normalizeCard(card, index, settings));
    setCards(normalized);
    navigate("/database");
  }

  function handleReset() {
    setSettings(defaultSettings);
    setCards(defaultCards.map((card, index) => normalizeCard(card, index, defaultSettings)));
    navigate("/");
  }

  function handleSaveSettings(newSettings) {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    setCards((prev) => prev.map((card, index) => normalizeCard(card, index, merged)));
  }

  async function handleLoadFromUrl(url) {
    const target = url || settings.dataUrl;
    if (!target) return;
    try {
      const response = await fetch(target);
      if (!response.ok) throw new Error(`Failed to load JSON: ${response.status}`);
      const parsed = await response.json();
      if (!Array.isArray(parsed)) throw new Error("Loaded file is not a JSON array.");
      const normalized = parsed.map((card, index) => normalizeCard(card, index, settings));
      setCards(normalized);
      navigate("/database");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load remote JSON.");
    }
  }

  return (
    <div className="min-h-screen bg-[#dce5c6] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[24px] border border-slate-300 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-bold tracking-tight">Mardras-db.com</div>
              <div className="text-sm text-slate-500">Custom card database for L.S. and other original cards</div>
            </div>
            <nav className="flex flex-wrap gap-2">
              <button onClick={goHome} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "home" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Home className="h-4 w-4" /> Home
              </button>
              <button onClick={goDatabase} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "database" || page === "archetype" || page === "card" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Database className="h-4 w-4" /> Database
              </button>
              <button onClick={goDownloads} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "downloads" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Download className="h-4 w-4" /> Downloads
              </button>
            </nav>
          </div>
        </header>

        {page === "home" && (
          <HomePage
            onBrowse={goDatabase}
            cards={cards}
            onOpen={openCard}
            onImport={handleImport}
            onReset={handleReset}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onLoadFromUrl={handleLoadFromUrl}
          />
        )}

        {page === "database" && <DatabasePage cards={cards} onOpen={openCard} />}
        {page === "archetype" && archetypeFilter && <ArchetypePage cards={cards} archetype={archetypeFilter} onOpen={openCard} onBrowseAll={goDatabase} />}
        {page === "downloads" && <DownloadsPage settings={settings} />}
        {page === "card" && selectedCard && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={goDatabase} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Back to database
              </button>
              <button onClick={() => openArchetype(selectedCard.archetype)} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                More from {selectedCard.archetype}
              </button>
            </div>
            <CardDetail card={selectedCard} cards={cards} onBack={goDatabase} onOpen={openCard} />
          </div>
        )}
      </div>
    </div>
  );
}
