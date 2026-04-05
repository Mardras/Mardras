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
    lore: "The activation/effect of its activation/effects cannot be negated.",
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
const ADMIN_QUERY_KEY = "admin";


function getArchetypeList(card) {
  if (Array.isArray(card?.archetype)) {
    return card.archetype
      .map((value) => String(value || "").trim())
      .filter(Boolean);
  }

  const single = String(card?.archetype || "").trim();
  return single ? [single] : [];
}

function getArchetypeText(card) {
  const archetypes = getArchetypeList(card);
  return archetypes.length ? archetypes.join(" / ") : "—";
}

function cardHasArchetype(card, archetype) {
  return getArchetypeList(card).includes(archetype);
}

function getAttributeList(card) {
  if (Array.isArray(card?.attribute)) {
    return card.attribute
      .map((value) => String(value || "").trim().toUpperCase())
      .filter(Boolean);
  }

  const single = String(card?.attribute || "").trim().toUpperCase();
  if (!single || single === "—" || single === "0") return [];
  return [single];
}

function getAttributeText(card) {
  const attributes = getAttributeList(card);
  return attributes.length ? attributes.join(" / ") : "—";
}

function cardHasAttribute(card, attribute) {
  return getAttributeList(card).includes(String(attribute || "").trim().toUpperCase());
}

function getRaceList(card) {
  if (Array.isArray(card?.race)) {
    return card.race
      .map((value) => String(value || "").trim())
      .filter(Boolean);
  }

  const single = String(card?.race || "").trim();
  if (!single || single === "—" || single === "0") return [];
  return [single];
}

function getRaceText(card) {
  const races = getRaceList(card);
  return races.length ? races.join(" / ") : "—";
}

function cardHasRace(card, race) {
  return getRaceList(card).includes(String(race || "").trim());
}

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

const LINK_ARROW_POSITIONS = [
  "top-left",
  "top",
  "top-right",
  "left",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
];

const LINK_ARROW_LAYOUT = [
  ["top-left", "top", "top-right"],
  ["left", null, "right"],
  ["bottom-left", "bottom", "bottom-right"],
];

const LINK_ARROW_ICON_MAP = {
  "top-left": {on: "/icons/link-arrows/top-left-red.png", off: "/icons/link-arrows/top-left-grey.png"},
  top: {on: "/icons/link-arrows/top-red.png", off: "/icons/link-arrows/top-grey.png"},
  "top-right": {on: "/icons/link-arrows/top-right-red.png", off: "/icons/link-arrows/top-right-grey.png"},
  left: {on: "/icons/link-arrows/left-red.png", off: "/icons/link-arrows/left-grey.png"},
  right: {on: "/icons/link-arrows/right-red.png", off: "/icons/link-arrows/right-grey.png"},
  "bottom-left": {on: "/icons/link-arrows/bottom-left-red.png", off: "/icons/link-arrows/bottom-left-grey.png"},
  bottom: {on: "/icons/link-arrows/bottom-red.png", off: "/icons/link-arrows/bottom-grey.png"},
  "bottom-right": {on: "/icons/link-arrows/bottom-right-red.png", off: "/icons/link-arrows/bottom-right-grey.png"},
};

function normalizeLinkArrowName(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  const normalized = raw
    .replace(/^middle-/, "")
    .replace(/-center$/g, "")
    .replace(/^centre$/g, "")
    .replace(/-centre$/g, "")
    .replace(/^mid-/, "");

  const aliasMap = {
    topleft: "top-left",
    topright: "top-right",
    bottomleft: "bottom-left",
    bottomright: "bottom-right",
    middleleft: "left",
    middleright: "right",
    centerleft: "left",
    centerright: "right",
    topcenter: "top",
    bottomcenter: "bottom",
    topcentre: "top",
    bottomcentre: "bottom",
  };

  const condensed = normalized.replace(/-/g, "");
  if (aliasMap[condensed]) return aliasMap[condensed];
  if (LINK_ARROW_POSITIONS.includes(normalized)) return normalized;
  return "";
}

function getLinkArrowNames(card) {
  const candidates = [
    card?.linkArrows,
    card?.linkarrows,
    card?.linkMarkers,
    card?.linkmarkers,
    card?.linkArrow,
    card?.linkMarker,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const values = candidate.map(normalizeLinkArrowName).filter(Boolean);
      if (values.length) return [...new Set(values)];
      continue;
    }

    if (typeof candidate === "string") {
      const values = candidate
        .split(/[|,/;]/)
        .map(normalizeLinkArrowName)
        .filter(Boolean);
      if (values.length) return [...new Set(values)];
      continue;
    }

    if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
      const bitMap = [
        [0x001, "bottom-left"],
        [0x002, "bottom"],
        [0x004, "bottom-right"],
        [0x008, "left"],
        [0x020, "right"],
        [0x040, "top-left"],
        [0x080, "top"],
        [0x100, "top-right"],
      ];
      const values = bitMap.filter(([bit]) => (candidate & bit) === bit).map(([, name]) => name);
      if (values.length) return values;
    }
  }

  return [];
}

function isLinkMonster(card) {
  const typeText = `${card?.cardType || ""} ${card?.type || ""}`.toLowerCase();
  return String(card?.cardType || "").trim().toLowerCase() === "monster" && typeText.includes("link");
}

function LinkArrowsValue({ card }) {
  const activeArrows = new Set(getLinkArrowNames(card));

  return (
    <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-1">
      <div className="grid grid-cols-3 gap-[1px]">
        {LINK_ARROW_LAYOUT.flat().map((position, index) => {
          if (!position) {
            return <div key={`empty-${index}`} className="h-[14px] w-[14px] rounded-[2px] bg-slate-200/70" />;
          }

          const isActive = activeArrows.has(position);
          const icon = LINK_ARROW_ICON_MAP[position];
          return (
            <div key={position} className="flex h-[14px] w-[14px] items-center justify-center rounded-[2px] bg-white">
              <img
                src={isActive ? icon?.on : icon?.off}
                alt={`${position} ${isActive ? "active" : "inactive"} link arrow`}
                className="h-[10px] w-[10px] object-contain"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getAttributeIcon(attribute) {
  return ATTRIBUTE_ICON_MAP[String(attribute || "").toUpperCase()] || null;
}

function getCardTypeIcon(cardType) {
  return CARD_TYPE_ICON_MAP[String(cardType || "")] || null;
}

function getPropertyIcon(property) {
  const normalized = String(property || "").trim().toLowerCase();
  const propertyEntry = Object.entries(PROPERTY_ICON_MAP).find(
    ([label]) =>
      label.toLowerCase() === normalized ||
      label.toLowerCase().replace(/-/g, "") === normalized.replace(/-/g, "")
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
  if (typeText.includes("link")) return "Link Arrows";
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

function getFilterCardType(card) {
  if (isHybridSpellTrap(card)) return "Spell / Trap";
  return String(card.cardType || "").trim() || "—";
}

function getFilterTypes(card) {
  const cardType = String(card?.cardType || "").trim().toLowerCase();
  const rawType = String(card?.type || "").trim();
  if (!rawType) return "All Types";

  if (cardType === "monster") {
    const normalized = rawType
      .replace(/^Monster\s*/i, "")
      .replace(/Special\s+Summon/gi, "Special Summon")
      .trim();
    return normalized || "Effect";
  }

  const properties = getSpellTrapProperties(card);
  return properties.length ? properties.join(" | ") : "Normal";
}

function buildYdkText(deck) {
  const main = Array.isArray(deck?.main) ? deck.main.map(String) : [];
  const extra = Array.isArray(deck?.extra) ? deck.extra.map(String) : [];
  const side = Array.isArray(deck?.side) ? deck.side.map(String) : [];

  return ["#created by Mardras-db.com", "#main", ...main, "#extra", ...extra, "!side", ...side, ""].join("\n");
}

function downloadYdk(deck, characterName = "") {
  const safeDeckName =
    String(deck?.name || "deck")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "deck";
  const safeCharacterName = String(characterName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const filename = `${safeCharacterName ? `${safeCharacterName}-` : ""}${safeDeckName}.ydk`;
  const blob = new Blob([buildYdkText(deck)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
      return p !== "spell" && p !== "trap" && p !== "spell/trap" && p !== "&" && p !== "/" && p !== "and";
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
  const rawValue = card.level ?? card.link ?? card.linkRating ?? card.rank ?? "";
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

const CODE_DOWNLOADS = [
  {
    id: "ls-pack-main",
    title: "L.S. Pack for EDOPro",
    description: "Full Collection of L.S. cards",
    url: "https://www.mediafire.com/file/g2m9dptch1sdd20/LS-2026FullbyMardras.zip/file",
  },
  {
    id: "fran-pack",
    title: "Fran Deck Pack for EDOPro",
    description: "Fran's Warrior Xyz custom deck and related cards.",
    url: "https://www.mediafire.com/file/pu6l1awbblnegrw/Fran_Customs_Basic_Deck_Weather_Warrior_2026.zip/file",
  },
  {
    id: "vylon-pack",
    title: "Vylon Custom Pack for EDOPro",
    description: "Veihar's custom Vylon deck (Full Collection).",
    url: "https://www.mediafire.com/file/xig0cmh7jqkzymw/VylonCustom2026ByMardras.zip/file",
  },
  {
    id: "aura-pack",
    title: "Aura Deck Pack for EDOPro",
    description: "Aura's custom Ritual Xyz deck and related cards.",
    url: "https://www.mediafire.com/file/q6gq4pckaagu1l1/Aura_Customs_Basic_Deck_Duelist_Goddess_2026.zip/file",
  },
  {
    id: "pk-pack",
    title: "Phantom Knights Custom for EDOPro",
    description: "Sae's custom Phantom Knights cards.",
    url: "https://www.mediafire.com/file/6iezt5tuxl0i204/Phantom_Knights_Support.zip/file",
  },
  {
    id: "archers-pack",
    title: "Archers Custom for EDOPro",
    description: "TheArcDes' custom Archer cards. Contribution: Fran.",
    url: "https://www.mediafire.com/file/5jbsyvsy25pfs11/Arrow_Archer_Cards_by_TheArcDes_and_Fran.zip/file",
  },
   {
    id: "Legolas-pack",
    title: "The 2 Legolas Customs for EDOPro",
    description: "Siege's custom Legolas Xyz Cards. Contribution: Fran.",
    url: "https://www.mediafire.com/file/0pu7q6w0nqj0mqk/Legolas_by_Siege.zip/file",
  },
  {
    id: "archfiend-chess-pack",
    title: "Archfiend Chess Pack for EDOPro",
    description: "Milius K. Roydenburg's Chess Strategy Deck",
    url: "https://www.mediafire.com/file/wo8uxhvok2kzity/ArchfiendChessbyMardras.zip/file",
  },
  {
    id: "ragnaraika-customs-pack",
    title: "Ragnaraika Customs for EDOPro",
    description: "Zeith Leinsdoom's Ragnaraika custom cards",
    url: "https://www.mediafire.com/file/juxcre6b8d8myjv/RagnaraikaCustoms2026byMardras.zip/file",
  },
];

const defaultSettings = {
  imageBaseUrl: "/cards",
  imageExtension: "jpg",
  dataUrl: "/data/cards.json",
  downloads: CODE_DOWNLOADS,
};

function normalizeCard(card, index, settings = defaultSettings) {
  const normalizedRaceList = Array.isArray(card?.race)
    ? card.race.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
  const normalizedAttributeList = Array.isArray(card?.attribute)
    ? card.attribute.map((value) => String(value || "").trim().toUpperCase()).filter(Boolean)
    : [];

  return {
    id: String(card.id || `card-${index + 1}`),
    name: card.name || `Untitled Card ${index + 1}`,
    author: card.author || "Mardras",
    archetype: Array.isArray(card.archetype)
      ? card.archetype.map((value) => String(value || "").trim()).filter(Boolean)
      : String(card.archetype || "").trim() || "Other Customs",
    type: card.type || (normalizedRaceList.length ? normalizedRaceList.join(" ") : card.race) || "Effect Monster",
    attribute: normalizedAttributeList.length ? normalizedAttributeList : (card.attribute || "—"),
    race: normalizedRaceList.length ? normalizedRaceList : (card.race || card.type || "—"),
    level: card.level ?? "",
    rank: card.rank ?? "",
    linkRating: card.linkRating ?? card.link ?? "",
    linkMarkers: Array.isArray(card?.linkMarkers)
      ? card.linkMarkers.map(normalizeLinkArrowName).filter(Boolean)
      : (typeof card?.linkMarkers === "string"
          ? card.linkMarkers.split(/[|,/;]/).map(normalizeLinkArrowName).filter(Boolean)
          : card?.linkMarkers ?? ""),
    linkArrows: Array.isArray(card?.linkArrows)
      ? card.linkArrows.map(normalizeLinkArrowName).filter(Boolean)
      : (typeof card?.linkArrows === "string"
          ? card.linkArrows.split(/[|,/;]/).map(normalizeLinkArrowName).filter(Boolean)
          : card?.linkArrows ?? ""),
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

function normalizeOfficialCard(card, index) {
  const normalized = normalizeCard(
    {
      ...card,
      author: card?.author || "Konami",
      source: "official",
      image: card?.image || (card?.id ? `/official-cards/${card.id}.jpg` : ""),
    },
    index,
    defaultSettings
  );
  return {
    ...normalized,
    source: "official",
    image: normalized.image || (normalized.id ? `/official-cards/${normalized.id}.jpg` : ""),
    author: normalized.author || "Konami",
  };
}

function normalizeCharacter(character, index) {
  const decks = Array.isArray(character?.decks) ? character.decks : [];
  return {
    id: String(character?.id || `character-${index + 1}`),
    name: character?.name || `Untitled Character ${index + 1}`,
    title: character?.title || "",
    image: character?.image || "https://placehold.co/600x800/e5e7eb/475569?text=Character",
    summary: character?.summary || "",
    biography: character?.biography || "",
    affiliation: character?.affiliation || "",
    aliases: Array.isArray(character?.aliases) ? character.aliases : [],
    firstAppearance: character?.firstAppearance || "",
    tags: Array.isArray(character?.tags) ? character.tags : [],
    signatureCards: Array.isArray(character?.signatureCards) ? character.signatureCards.map(String) : [],
    decks: decks.map((deck, deckIndex) => ({
      id: String(deck?.id || `${character?.id || `character-${index + 1}`}-deck-${deckIndex + 1}`),
      name: deck?.name || `Deck ${deckIndex + 1}`,
      era: deck?.era || "",
      description: deck?.description || "",
      main: Array.isArray(deck?.main) ? deck.main.map(String) : [],
      extra: Array.isArray(deck?.extra) ? deck.extra.map(String) : [],
      side: Array.isArray(deck?.side) ? deck.side.map(String) : [],
    })),
  };
}

function getDisplayTypes(card) {
  if (card.cardType === "Monster") {
    const typeParts = String(card.type || "")
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    const filteredParts = typeParts.filter((part) => !["Monster", "Normal", "Spell", "Trap"].includes(part));
    const raceParts = getRaceList(card);
    const seen = new Set(raceParts.map((part) => String(part).toLowerCase()));
    const uniqueTypeParts = [];

    filteredParts.forEach((part) => {
      if (!part) return;
      const key = String(part).toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      uniqueTypeParts.push(part);
    });

    const raceText = raceParts.length ? raceParts.join(" / ") : "";
    const extraText = uniqueTypeParts.join(" ");
    return [raceText, extraText].filter(Boolean).join(" ") || getRaceText(card) || card.type || "—";
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
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

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

  const materialLike =
    /(?:\+|\bLevel\b|\bRank\b|\bTuner\b|\bnon-Tuner\b|\bmaterials?\b|\bmonsters?\b|\bTokens?\b|\bPendulum\b|\bSynchro\b|\bFusion\b|\bLink\b|\bXyz\b|"[^"]+")/i;

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
    monster = normalized.replace(/\[PENDULUM_EFFECT\]/g, "").replace(/\[MONSTER_EFFECT\]/g, "").trim();
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

      {hasPendulumSection && hasMonsterSection ? <div className="my-3 border-t border-slate-200" /> : null}

      {hasMonsterSection ? (
        <div className="whitespace-pre-wrap">
          <div className="mb-1 text-[15px] font-semibold text-slate-900">Monster Effect</div>
          {isExtraDeckMonster(card) ? (
            <ExtraDeckLoreContent text={sections.monster} />
          ) : (
            <div>{sections.monster}</div>
          )}
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

function getLevelRankLinkSortValue(card) {
  const rawRank = String(card?.rank ?? "").trim();
  const rawLink = String(card?.linkRating ?? card?.link ?? "").trim();
  const rawLevel = String(card?.level ?? "").trim();

  if (rawRank !== "" && !Number.isNaN(Number(rawRank))) return Number(rawRank);
  if (rawLink !== "" && !Number.isNaN(Number(rawLink))) return Number(rawLink);
  if (rawLevel !== "" && !Number.isNaN(Number(rawLevel))) return Number(rawLevel);
  return -1;
}

function getPendulumScaleSortValue(card) {
  const candidates = [card?.leftScale, card?.rightScale, card?.scales]
    .map((value) => String(value ?? "").trim())
    .filter((value) => value !== "" && !Number.isNaN(Number(value)));

  if (!candidates.length) return -1;
  return Number(candidates[0]);
}

function getGenesysPointsSortValue(card) {
  const candidates = [card?.genesysPoints, card?.genesisPoints, card?.points, card?.genesys]
    .map((value) => String(value ?? "").trim())
    .filter((value) => value !== "" && !Number.isNaN(Number(value)));

  if (!candidates.length) return 0;
  return Number(candidates[0]);
}

function getBattleSortValue(value) {
  const raw = String(value ?? "").trim();
  if (raw === "" || Number.isNaN(Number(raw))) return -999999;
  return Number(raw);
}

function parseRoute(cards, characters = [], officialCards = []) {
  const path = window.location.pathname || "/";
  const parts = path.split("/").filter(Boolean);

  if (parts[0] === "card" && parts[1]) {
    const found = cards.find((card) => String(card.id) === String(parts[1]));
    if (found)
      return { page: "card", selectedCard: found, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: null };
  }
  if (parts[0] === "official-card" && parts[1]) {
    const found = officialCards.find((card) => String(card.id) === String(parts[1]));
    if (found)
      return { page: "official-card", selectedCard: null, selectedOfficialCard: found, archetypeFilter: null, selectedCharacter: null };
  }
  if (parts[0] === "character" && parts[1]) {
    const found = characters.find((character) => String(character.id) === decodeURIComponent(parts[1]));
    if (found)
      return { page: "character", selectedCard: null, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: found };
  }
  if (parts[0] === "characters")
    return { page: "characters", selectedCard: null, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: null };
  if (parts[0] === "official-database")
    return { page: "official-database", selectedCard: null, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: null };
  if (parts[0] === "archetype" && parts[1]) {
    return {
      page: "archetype",
      selectedCard: null,
      selectedOfficialCard: null,
      archetypeFilter: decodeURIComponent(parts[1]),
      selectedCharacter: null,
    };
  }
  if (parts[0] === "downloads")
    return { page: "downloads", selectedCard: null, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: null };
  if (parts[0] === "database")
    return { page: "database", selectedCard: null, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: null };
  return { page: "home", selectedCard: null, selectedOfficialCard: null, archetypeFilter: null, selectedCharacter: null };
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
  const attributes = getAttributeList(card);

  if (attributes.length > 1) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {attributes.map((attribute) => (
          <span key={attribute} className="inline-flex items-center gap-2">
            <span>{attribute}</span>
            {getAttributeIcon(attribute) ? (
              <img
                src={getAttributeIcon(attribute)}
                alt={`${attribute} attribute`}
                className="h-8 w-8 object-contain"
                loading="lazy"
              />
            ) : null}
          </span>
        ))}
      </div>
    );
  }

  return <StatValueWithIcon value={getAttributeText(card)} iconSrc={getAttributeIcon(attributes[0])} iconAlt={`${getAttributeText(card)} attribute`} />;
}

function CardThumb({ card, onOpen }) {
  return (
    <button
      onClick={() => onOpen(card)}
      className="group overflow-hidden rounded-2xl border border-slate-300 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-100">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-1 p-3">
        <div className="line-clamp-2 text-sm font-semibold text-slate-900">{card.name}</div>
        <div className="text-xs text-slate-500">
          {getArchetypeText(card)} • {card.cardType}
        </div>
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
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{getArchetypeText(card)}</span>
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
      onSaveSettings({
        imageBaseUrl,
        imageExtension,
        dataUrl,
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
          <button
            onClick={() => downloadJson("mardras-db-template.json", emptyTemplate)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <FileJson className="h-4 w-4" /> Template
          </button>
          <button
            onClick={() => downloadJson("mardras-db-cards.json", cards)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <Download className="h-4 w-4" /> Export current JSON
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
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
          <input
            value={imageBaseUrl}
            onChange={(e) => setImageBaseUrl(e.target.value)}
            placeholder="/cards"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            value={imageExtension}
            onChange={(e) => setImageExtension(e.target.value)}
            placeholder="jpg"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            value={dataUrl}
            onChange={(e) => setDataUrl(e.target.value)}
            placeholder="/data/cards.json or full URL"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-900">Download links</div>
          <div className="min-h-[150px] w-full rounded-2xl border border-slate-300 bg-slate-100 p-4 text-sm leading-6 text-slate-600">
            Download links are now controlled directly in App.jsx and are no longer loaded from saved browser settings.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className={`text-sm ${ok ? "text-slate-600" : "text-red-700"}`}>{message}</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LinkIcon className="h-4 w-4" /> Save Settings
          </button>
          <button
            onClick={() => onLoadFromUrl(dataUrl, { navigateAfterLoad: true })}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Load from URL
          </button>
          <button
            onClick={handleImport}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Upload className="h-4 w-4" /> Import JSON
          </button>
        </div>
      </div>
    </section>
  );
}

function HomePage({
  onBrowse,
  cards,
  onOpen,
  onImport,
  onReset,
  settings,
  onSaveSettings,
  onLoadFromUrl,
  isAdmin,
}) {
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
            <button
              onClick={onBrowse}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Open Database
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featured.map((card) => (
          <FeaturedCard key={card.id} card={card} onOpen={onOpen} />
        ))}
      </section>

      <section className="space-y-4 rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">Downloads</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(settings.downloads || []).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100"
            >
              <div className="mb-1 text-base font-semibold text-slate-900">{item.title}</div>
              <div className="mb-3 text-sm text-slate-600">{item.description}</div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                <Download className="h-4 w-4" /> Download pack
              </div>
            </a>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <ImportPanel
          cards={cards}
          onImport={onImport}
          onReset={onReset}
          settings={settings}
          onSaveSettings={onSaveSettings}
          onLoadFromUrl={onLoadFromUrl}
        />
      ) : null}
    </div>
  );
}

function normalizeAttributeFilterValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "—" || raw === "0") return "0";
  return raw.toUpperCase();
}

function getMonsterAttributeTags(card) {
  if (String(card?.cardType || "").trim().toLowerCase() !== "monster") return [];
  const values = getAttributeList(card).map((value) => normalizeAttributeFilterValue(value));
  return values.length ? [...new Set(values)] : ["0"];
}

function normalizeRaceFilterValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "—" || raw === "0") return "0";
  return raw;
}

function getMonsterSubtypeTags(card) {
  if (String(card?.cardType || "").trim().toLowerCase() !== "monster") return [];
  const typeText = String(card?.type || "").toLowerCase();
  const tags = [];
  const checks = [
    ["Normal", /\bnormal\b/],
    ["Effect", /\beffect\b/],
    ["Ritual", /\britual\b/],
    ["Pendulum", /\bpendulum\b/],
    ["Fusion", /\bfusion\b/],
    ["Synchro", /\bsynchro\b/],
    ["Xyz", /\bxyz\b/],
    ["Link", /\blink\b/],
    ["Union", /\bunion\b/],
    ["Flip", /\bflip\b/],
    ["Spirit", /\bspirit\b/],
    ["Gemini", /\bgemini\b/],
    ["Toon", /\btoon\b/],
    ["Tuner", /\btuner\b/],
  ];
  checks.forEach(([label, pattern]) => {
    if (pattern.test(typeText)) tags.push(label);
  });
  return tags;
}

function getMonsterRaceTags(card) {
  if (String(card?.cardType || "").trim().toLowerCase() !== "monster") return [];
  const values = getRaceList(card).map((value) => normalizeRaceFilterValue(value));
  return values.length ? [...new Set(values)] : ["0"];
}

function getLevelRankLinkTags(card) {
  if (String(card?.cardType || "").trim().toLowerCase() !== "monster") return [];
  const tags = [];

  const rawRank = String(card?.rank ?? "").trim();
  const rawLink = String(card?.linkRating ?? card?.link ?? "").trim();
  const rawLevel = String(card?.level ?? "").trim();

  const hasRank = rawRank !== "" && !Number.isNaN(Number(rawRank));
  const hasLink = rawLink !== "" && !Number.isNaN(Number(rawLink));
  const hasLevel = rawLevel !== "" && !Number.isNaN(Number(rawLevel));

  if (hasRank) {
    tags.push(`Rank ${Number(rawRank)}`);
  } else if (hasLink) {
    tags.push(`Link ${Number(rawLink)}`);
  } else if (hasLevel) {
    tags.push(`Level ${Number(rawLevel)}`);
  }

  return tags;
}

function getPendulumScaleTags(card) {
  const values = [];
  const candidates = [card?.leftScale, card?.rightScale, card?.scales];
  candidates.forEach((value) => {
    if (value === "" || value === null || value === undefined) return;
    const num = Number(value);
    if (Number.isFinite(num)) values.push(`Scale ${num}`);
  });
  return [...new Set(values)];
}

function getSpellTrapTypeTags(card) {
  if (String(card?.cardType || "").trim().toLowerCase() === "monster") return [];
  return getSpellTrapProperties(card);
}

function getResolvedCardTypeTag(card, hasHybridCardType) {
  const raw = String(getFilterCardType(card) || "").trim();
  if (!raw) return "Unknown";
  if (!hasHybridCardType && raw === "Spell / Trap") return "Unknown";
  return raw;
}

function buildFilterOptions(cards) {
  const hasHybridCardType = cards.some((card) => getFilterCardType(card) === "Spell / Trap");
  const attributeValues = ["WATER", "FIRE", "EARTH", "WIND", "LIGHT", "DARK", "DIVINE", "0"];
  const subtypeValues = ["Normal", "Effect", "Ritual", "Pendulum", "Fusion", "Synchro", "Xyz", "Link", "Union", "Flip", "Spirit", "Gemini", "Toon", "Tuner"];
  const cardTypeValues = hasHybridCardType ? ["Monster", "Spell", "Trap", "Spell / Trap"] : ["Monster", "Spell", "Trap", "Unknown"];
  const spellTrapTypeValues = ["Normal", "Quick-Play", "Continuous", "Ritual", "Equip", "Field", "Counter"];
  const raceValues = [...new Set(cards.flatMap((card) => getMonsterRaceTags(card)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const numberValues = Array.from({ length: 14 }, (_, index) => index);

  const options = [];
  subtypeValues.forEach((value) => options.push({ id: `monster-subtype:${value}`, kind: "monster-subtype", label: value, category: "Monster Card Type", value }));
  attributeValues.forEach((value) => options.push({ id: `attribute:${value}`, kind: "attribute", label: value, category: "Attribute", value }));
  raceValues.forEach((value) => options.push({ id: `race:${value}`, kind: "race", label: value, category: "Monster Race", value }));
  numberValues.forEach((value) => options.push({ id: `level:${value}`, kind: "level", label: `Level ${value}`, category: "Level/Rank/Link", value: `Level ${value}` }));
  numberValues.forEach((value) => options.push({ id: `rank:${value}`, kind: "level", label: `Rank ${value}`, category: "Level/Rank/Link", value: `Rank ${value}` }));
  numberValues.forEach((value) => options.push({ id: `link:${value}`, kind: "level", label: `Link ${value}`, category: "Level/Rank/Link", value: `Link ${value}` }));
  cardTypeValues.forEach((value) => options.push({ id: `card-type:${value}`, kind: "card-type", label: value, category: "Card Type", value }));
  numberValues.forEach((value) => options.push({ id: `scale:${value}`, kind: "scale", label: `Scale ${value}`, category: "Pendulum Scale", value: `Scale ${value}` }));
  spellTrapTypeValues.forEach((value) => options.push({ id: `spell-trap-type:${value}`, kind: "spell-trap-type", label: value, category: "Spell/Trap Type", value }));

  return { options, hasHybridCardType };
}

function cardMatchesFilterTag(card, tag, hasHybridCardType) {
  if (!tag) return true;
  switch (tag.kind) {
    case "monster-subtype":
      return getMonsterSubtypeTags(card).includes(tag.value);
    case "attribute":
      return getMonsterAttributeTags(card).includes(tag.value);
    case "race":
      return getMonsterRaceTags(card).includes(tag.value);
    case "level":
      return getLevelRankLinkTags(card).includes(tag.value);
    case "card-type":
      return getResolvedCardTypeTag(card, hasHybridCardType) === tag.value;
    case "scale":
      return getPendulumScaleTags(card).includes(tag.value);
    case "spell-trap-type":
      return getSpellTrapTypeTags(card).includes(tag.value);
    default:
      return true;
  }
}

function DatabasePage({ cards, onOpen }) {
  const [query, setQuery] = useState("");
  const [archetypeQuery, setArchetypeQuery] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(1);
  const [authorFilter, setAuthorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const { options: filterOptions, hasHybridCardType } = useMemo(() => buildFilterOptions(cards), [cards]);
  const archetypes = useMemo(() => [...new Set(cards.flatMap((card) => getArchetypeList(card)))].sort((a, b) => a.localeCompare(b)), [cards]);
  const authors = ["All", ...new Set(cards.map((c) => c.author).filter(Boolean))];
  const statuses = ["All", ...new Set(cards.map((c) => c.status).filter(Boolean))];

  const selectedFilterIds = useMemo(() => new Set(selectedFilterTags.map((tag) => tag.id)), [selectedFilterTags]);

  const matchingFilterOptions = useMemo(() => {
    const term = filterQuery.trim().toLowerCase();
    const base = filterOptions.filter((option) => !selectedFilterIds.has(option.id));
    if (!term) return base;
    return base
      .filter((option) => `${option.label} ${option.category}`.toLowerCase().includes(term))
      .sort((a, b) => {
        const aStarts = a.label.toLowerCase().startsWith(term) ? 0 : 1;
        const bStarts = b.label.toLowerCase().startsWith(term) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.label.localeCompare(b.label);
      });
  }, [filterQuery, filterOptions, selectedFilterIds]);

  const matchingArchetypes = useMemo(() => {
    const term = archetypeQuery.trim().toLowerCase();
    const base = archetypes.filter((item) => item !== selectedArchetype);
    if (!term) return base;
    return base.filter((item) => item.toLowerCase().includes(term));
  }, [archetypeQuery, archetypes, selectedArchetype]);

  const filtered = useMemo(() => {
    const base = cards.filter((card) => {
      const matchQuery =
        !query ||
        [card.id, card.name, card.author, card.type, card.attribute, card.race, getArchetypeText(card), card.setGroup, card.status, card.lore]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesTags = selectedFilterTags.every((tag) => cardMatchesFilterTag(card, tag, hasHybridCardType));

      return (
        matchQuery &&
        matchesTags &&
        (!selectedArchetype || cardHasArchetype(card, selectedArchetype)) &&
        (authorFilter === "All" || card.author === authorFilter) &&
        (statusFilter === "All" || card.status === statusFilter)
      );
    });

    return [...base].sort((a, b) => {
      const direction = sortDirection === "desc" ? -1 : 1;

      if (sortField === "name") {
        return a.name.localeCompare(b.name) * direction;
      }

      let aValue = 0;
      let bValue = 0;

      if (sortField === "id") {
        aValue = Number(a.id);
        bValue = Number(b.id);
      } else if (sortField === "genesys") {
        aValue = getGenesysPointsSortValue(a);
        bValue = getGenesysPointsSortValue(b);
      } else if (sortField === "level-rank-link") {
        aValue = getLevelRankLinkSortValue(a);
        bValue = getLevelRankLinkSortValue(b);
      } else if (sortField === "pendulum-scale") {
        aValue = getPendulumScaleSortValue(a);
        bValue = getPendulumScaleSortValue(b);
      } else if (sortField === "atk") {
        aValue = getBattleSortValue(a.atk);
        bValue = getBattleSortValue(b.atk);
      } else if (sortField === "def") {
        aValue = getBattleSortValue(a.def);
        bValue = getBattleSortValue(b.def);
      }

      if (aValue === bValue) {
        return a.name.localeCompare(b.name) * direction;
      }

      return (aValue - bValue) * direction;
    });
  }, [cards, query, selectedFilterTags, hasHybridCardType, selectedArchetype, authorFilter, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    setPageIndex(1);
  }, [query, selectedFilterTags, selectedArchetype, authorFilter, statusFilter, sortField, sortDirection, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const isOfficial = cards.some((card) => card?.source === "official");
  const databaseTitle = isOfficial ? "Official Database" : "Custom Database";

  function addFilterTag(option) {
    if (!option || selectedFilterIds.has(option.id)) return;
    setSelectedFilterTags((prev) => [...prev, option]);
    setFilterQuery("");
  }

  function removeFilterTag(id) {
    setSelectedFilterTags((prev) => prev.filter((tag) => tag.id !== id));
  }

  function clearAllFilterTags() {
    setSelectedFilterTags([]);
    setFilterQuery("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Filters</h3>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Sort by</div>
          <div className="grid grid-cols-[1fr_112px] gap-2">
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">
              <option value="id">ID</option>
              <option value="name">Name</option>
              <option value="genesys">Genesys Points</option>
              <option value="level-rank-link">Level/Rank/Link</option>
              <option value="pendulum-scale">Pendulum Scale</option>
              <option value="atk">ATK</option>
              <option value="def">DEF</option>
            </select>
            <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none">
              {sortField === "name" ? (
                <>
                  <option value="asc">A to Z</option>
                  <option value="desc">Z to A</option>
                </>
              ) : (
                <>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Filter by</div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search filters like DARK, Dragon, Effect, Level 4..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
          {selectedFilterTags.length > 0 ? (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-2">
                {selectedFilterTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => removeFilterTag(tag.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <span>{tag.label}</span>
                    <span>✕</span>
                  </button>
                ))}
              </div>
              <button
                onClick={clearAllFilterTags}
                className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
              >
                Clear all tags
              </button>
            </div>
          ) : null}
          {matchingFilterOptions.length > 0 ? (
            <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-slate-300 bg-slate-50">
              {matchingFilterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => addFilterTag(option)}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 last:border-b-0"
                >
                  <span>{option.label}</span>
                  <span className="text-[11px] text-slate-400">{option.category}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Archetype</div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={archetypeQuery}
              onChange={(e) => setArchetypeQuery(e.target.value)}
              placeholder="Search archetype names..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
          {selectedArchetype ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setSelectedArchetype("")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                <span>{selectedArchetype}</span>
                <span>✕</span>
              </button>
            </div>
          ) : null}
          {!selectedArchetype && matchingArchetypes.length > 0 ? (
            <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-slate-300 bg-slate-50">
              {matchingArchetypes.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedArchetype(item);
                    setArchetypeQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 last:border-b-0"
                >
                  <span>{item}</span>
                  <span className="text-[11px] text-slate-400">Archetype</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {!isOfficial ? (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-700">Author</div>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
            >
              {authors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Banlist Status</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
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
              <h2 className="text-2xl font-bold text-slate-900">{databaseTitle}</h2>
              <p className="text-sm text-slate-600">Showing {filtered.length} cards</p>
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, name, type, archetype, author, status, or text..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((card) => (
            <CardThumb key={card.id} card={card} onOpen={onOpen} />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-300 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Page {pageIndex} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              disabled={pageIndex === totalPages}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
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
  const primaryArchetype = getArchetypeList(card)[0] || "";
  const sameArchetype = primaryArchetype ? cards.filter((c) => cardHasArchetype(c, primaryArchetype)) : [];
  const palette = getCardPalette(card);

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase?.() || "";
      const isTypingTarget = tagName === "input" || tagName === "textarea" || tagName === "select" || target?.isContentEditable;

      if (isTypingTarget) return;

      if (event.key === "ArrowLeft" && prev) {
        event.preventDefault();
        onOpen(prev);
      }

      if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        onOpen(next);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prev, next, onOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" /> Back to database
        </button>
        {prev && (
          <button
            onClick={() => onOpen(prev)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ◀ Previous
          </button>
        )}
        {next && (
          <button
            onClick={() => onOpen(next)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Next ▶
          </button>
        )}
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
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.status === "Banned" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                {card.status}
              </div>
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
              {isLinkMonster(card) ? (
                <StatRow label="Link Arrows" value={<LinkArrowsValue card={card} />} />
              ) : card.level || card.rank || card.linkRating ? (
                <StatRow label={getLevelLabel(card)} value={<LevelValue card={card} />} />
              ) : null}
              {card.scales ? <StatRow label="Pendulum Scale" value={<PendulumScaleValue value={card.scales} />} /> : null}
              {getBattleStatDisplay(card) ? <StatRow label={getBattleStatDisplay(card).label} value={getBattleStatDisplay(card).value} /> : null}
              <StatRow label="Archetype" value={getArchetypeText(card)} />
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

function CharacterDeckCard({ card, onOpen, onHover, onLeave }) {
  return (
    <button
      onClick={() => onOpen(card)}
      onMouseEnter={() => onHover(card)}
      onFocus={() => onHover(card)}
      onMouseLeave={onLeave}
      onBlur={onLeave}
      className="group relative overflow-hidden rounded-lg border border-slate-400/70 bg-slate-950/5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      title={card.name}
    >
      <img src={card.image} alt={card.name} loading="lazy" className="aspect-[2/3] w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1.5 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
        {card.name}
      </div>
    </button>
  );
}

function CharacterDeckSection({ title, ids, allCards, onOpen, onHover, onLeave }) {
  const deckCards = ids.map((id) => allCards.find((card) => String(card.id) === String(id))).filter(Boolean);
  if (!ids.length) return null;

  return (
    <section className="space-y-3 rounded-[24px] border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="text-sm font-medium text-slate-500">{deckCards.length}</div>
      </div>
      {deckCards.length ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {deckCards.map((card) => (
            <CharacterDeckCard key={`${title}-${card.id}`} card={card} onOpen={onOpen} onHover={onHover} onLeave={onLeave} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          These card IDs are not present in the current cards.json yet.
        </div>
      )}
    </section>
  );
}

function CharacterHoverPreview({ card }) {
  if (!card) {
    return (
      <div className="rounded-[24px] border border-slate-300 bg-white p-4 shadow-sm">
        <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50" />
        <div className="mt-4 space-y-2">
          <div className="text-base font-semibold text-slate-900">Hover a card</div>
          <div className="text-sm leading-6 text-slate-600">Move your cursor over a decklist card to preview it here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-300 bg-white p-4 shadow-sm">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <img src={card.image} alt={card.name} loading="lazy" className="w-full object-cover" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="text-xl font-bold text-slate-900">{card.name}</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{getArchetypeText(card)}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{getFilterCardType(card)}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">ID: {card.id}</span>
        </div>
        <div className="text-sm leading-6 text-slate-700 line-clamp-10">{card.lore || "No effect text provided."}</div>
      </div>
    </div>
  );
}

function CharactersPage({ characters, onOpen }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Story Archive</div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Characters</h1>
        <p className="mt-2 text-base leading-7 text-slate-700">Browse the characters from your books and manga, read their story summaries, and open the decks they used throughout the plot.</p>
      </section>

      {!characters.length ? (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <div className="text-lg font-semibold text-slate-900">No characters found</div>
          <div className="mt-2 text-sm text-slate-600">
            Add <code>/public/data/characters.json</code> to your project to populate this page.
          </div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => (
            <button
              key={character.id}
              onClick={() => onOpen(character)}
              className="overflow-hidden rounded-[24px] border border-slate-300 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                <img src={character.image} alt={character.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{character.name}</div>
                  {character.title ? <div className="text-sm font-medium text-slate-500">{character.title}</div> : null}
                </div>
                <div className="text-sm leading-6 text-slate-700">{character.summary || "No summary yet."}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {character.affiliation ? <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{character.affiliation}</span> : null}
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {character.decks.length} deck{character.decks.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}

function CharacterDetailPage({ character, cards, onOpenCard, onOpenCharacterList }) {
  const [activeDeckId, setActiveDeckId] = useState(character?.decks?.[0]?.id || "");
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setActiveDeckId(character?.decks?.[0]?.id || "");
    setHoveredCard(null);
  }, [character?.id]);

  const activeDeck = character?.decks?.find((deck) => deck.id === activeDeckId) || character?.decks?.[0] || null;
  const signatureCards = (character?.signatureCards || []).map((id) => cards.find((card) => String(card.id) === String(id))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button onClick={onOpenCharacterList} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Back to characters
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[24px] border border-slate-300 bg-white shadow-sm">
            <div className="aspect-[3/4] bg-slate-100">
              <img src={character.image} alt={character.name} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3 p-5">
              <div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">{character.name}</div>
                {character.title ? <div className="text-sm font-medium text-slate-500">{character.title}</div> : null}
              </div>
              {character.summary ? <div className="text-sm leading-6 text-slate-700">{character.summary}</div> : null}
              <div className="flex flex-wrap gap-2 text-xs">
                {character.affiliation ? <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{character.affiliation}</span> : null}
                {character.firstAppearance ? <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{character.firstAppearance}</span> : null}
                {(character.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <CharacterHoverPreview card={hoveredCard} />
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Biography / Story</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{character.biography || "Add the biography/story for this character in characters.json."}</div>
          </section>

          {signatureCards.length ? (
            <section className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Signature Cards</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {signatureCards.map((card) => (
                  <FeaturedCard key={`signature-${card.id}`} card={card} onOpen={onOpenCard} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-4 rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Decklists</h2>
                <div className="text-sm text-slate-600">Open any deck used by this character during the story.</div>
              </div>
              {character.decks.length ? (
                <select
                  value={activeDeck?.id || ""}
                  onChange={(e) => setActiveDeckId(e.target.value)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none"
                >
                  {character.decks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                      {deck.era ? ` — ${deck.era}` : ""}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            {activeDeck ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xl font-semibold text-slate-900">{activeDeck.name}</div>
                  {activeDeck.era ? <div className="mt-1 text-sm font-medium text-slate-500">{activeDeck.era}</div> : null}
                  {activeDeck.description ? <div className="mt-2 text-sm leading-6 text-slate-700">{activeDeck.description}</div> : null}
                </div>

                <CharacterDeckSection title="Main Deck" ids={activeDeck.main} allCards={cards} onOpen={onOpenCard} onHover={setHoveredCard} onLeave={() => setHoveredCard(null)} />
                <CharacterDeckSection title="Extra Deck" ids={activeDeck.extra} allCards={cards} onOpen={onOpenCard} onHover={setHoveredCard} onLeave={() => setHoveredCard(null)} />
                <CharacterDeckSection title="Side Deck" ids={activeDeck.side} allCards={cards} onOpen={onOpenCard} onHover={setHoveredCard} onLeave={() => setHoveredCard(null)} />

                <div className="flex justify-end">
                  <button
                    onClick={() => downloadYdk(activeDeck, character?.name)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" /> Download .ydk
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                This character does not have any decks yet.
              </div>
            )}
          </section>
        </div>
      </section>
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
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-[24px] border border-slate-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
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
  const filtered = cards.filter((card) => cardHasArchetype(card, archetype));
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
        {filtered.map((card) => (
          <CardThumb key={card.id} card={card} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return {
          ...defaultSettings,
          downloads: CODE_DOWNLOADS,
        };
      }

      const parsed = JSON.parse(raw);

      return {
        ...defaultSettings,
        ...parsed,
        downloads: CODE_DOWNLOADS,
      };
    } catch {
      return {
        ...defaultSettings,
        downloads: CODE_DOWNLOADS,
      };
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

  const [characters, setCharacters] = useState([]);
  const [officialCards, setOfficialCards] = useState([]);

  const initialRoute = useMemo(() => parseRoute(cards, characters, officialCards), [cards, characters, officialCards]);
  const [page, setPage] = useState(initialRoute.page);
  const [selectedCard, setSelectedCard] = useState(initialRoute.selectedCard);
  const [selectedOfficialCard, setSelectedOfficialCard] = useState(initialRoute.selectedOfficialCard);
  const [archetypeFilter, setArchetypeFilter] = useState(initialRoute.archetypeFilter);
  const [selectedCharacter, setSelectedCharacter] = useState(initialRoute.selectedCharacter);

  const isAdmin = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get(ADMIN_QUERY_KEY) === "1";
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    const settingsToPersist = {
      ...settings,
    };
    delete settingsToPersist.downloads;

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToPersist));
  }, [settings]);

  useEffect(() => {
    const syncFromHistory = () => {
      const route = parseRoute(cards, characters, officialCards);
      setPage(route.page);
      setSelectedCard(route.selectedCard);
      setSelectedOfficialCard(route.selectedOfficialCard);
      setArchetypeFilter(route.archetypeFilter);
      setSelectedCharacter(route.selectedCharacter);
    };
    window.addEventListener("popstate", syncFromHistory);
    syncFromHistory();
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, [cards, characters, officialCards]);

  function navigate(path) {
    window.history.pushState({}, "", path);
    const route = parseRoute(cards, characters, officialCards);
    setPage(route.page);
    setSelectedCard(route.selectedCard);
    setSelectedOfficialCard(route.selectedOfficialCard);
    setArchetypeFilter(route.archetypeFilter);
    setSelectedCharacter(route.selectedCharacter);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadCharacters() {
      try {
        const response = await fetch("/data/characters.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load characters JSON: ${response.status}`);
        const parsed = await response.json();
        if (!Array.isArray(parsed)) throw new Error("Characters file is not a JSON array.");
        if (!cancelled) setCharacters(parsed.map((character, index) => normalizeCharacter(character, index)));
      } catch (error) {
        console.warn(error);
        if (!cancelled) setCharacters([]);
      }
    }
    loadCharacters();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadOfficialCards() {
      try {
        const response = await fetch("/data/official-cards.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load official cards JSON: ${response.status}`);
        const parsed = await response.json();
        if (!Array.isArray(parsed)) throw new Error("Official cards file is not a JSON array.");
        if (!cancelled) setOfficialCards(parsed.map((card, index) => normalizeOfficialCard(card, index)));
      } catch (error) {
        console.warn(error);
        if (!cancelled) setOfficialCards([]);
      }
    }
    loadOfficialCards();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapCards() {
      const target = settings.dataUrl || defaultSettings.dataUrl;
      if (!target) return;

      try {
        const response = await fetch(target, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load JSON: ${response.status}`);

        const parsed = await response.json();
        if (!Array.isArray(parsed)) throw new Error("Loaded file is not a JSON array.");

        if (cancelled) return;

        const normalized = parsed.map((card, index) => normalizeCard(card, index, settings));
        setCards(normalized);
      } catch (error) {
        console.warn("Auto-refresh failed, using cached/local cards instead.", error);
      }
    }

    bootstrapCards();

    return () => {
      cancelled = true;
    };
  }, [settings.dataUrl, settings.imageBaseUrl, settings.imageExtension]);

  function goHome() {
    navigate("/");
  }

  function goDatabase() {
    navigate("/database");
  }

  function goOfficialDatabase() {
    navigate("/official-database");
  }

  function goCharacters() {
    navigate("/characters");
  }

  function goDownloads() {
    navigate("/downloads");
  }

  function openCard(card) {
    navigate(`/card/${card.id}`);
  }

  function openOfficialCard(card) {
    navigate(`/official-card/${card.id}`);
  }

  function openAnyCard(card) {
    if (card?.source === "official") {
      openOfficialCard(card);
      return;
    }
    openCard(card);
  }

  function openArchetype(archetype) {
    navigate(`/archetype/${encodeURIComponent(archetype)}`);
  }

  function openCharacter(character) {
    navigate(`/character/${encodeURIComponent(character.id)}`);
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
    const merged = {
      ...settings,
      ...newSettings,
      downloads: CODE_DOWNLOADS,
    };

    setSettings(merged);
    setCards((prev) => prev.map((card, index) => normalizeCard(card, index, merged)));
  }

  async function handleLoadFromUrl(url, options = {}) {
    const { navigateAfterLoad = false, silent = false } = options;
    const target = url || settings.dataUrl;

    if (!target) return false;

    try {
      const response = await fetch(target, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load JSON: ${response.status}`);

      const parsed = await response.json();
      if (!Array.isArray(parsed)) throw new Error("Loaded file is not a JSON array.");

      const normalized = parsed.map((card, index) => normalizeCard(card, index, settings));
      setCards(normalized);

      if (navigateAfterLoad) {
        navigate("/database");
      }

      return true;
    } catch (error) {
      console.error(error);
      if (!silent) {
        alert(error.message || "Failed to load remote JSON.");
      }
      return false;
    }
  }

  const allCards = useMemo(() => [...cards, ...officialCards], [cards, officialCards]);

  return (
    <div className="min-h-screen bg-[#dce5c6] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[24px] border border-slate-300 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-2xl font-bold tracking-tight">Mardras-db.com</div>
              <div className="text-sm text-slate-500">Custom and official card database for L.S., story characters, and OCG/TCG cards</div>
            </div>
            <nav className="flex flex-wrap gap-2">
              <button onClick={goHome} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "home" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Home className="h-4 w-4" /> Home
              </button>
              <button onClick={goDatabase} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "database" || page === "archetype" || page === "card" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Database className="h-4 w-4" /> Custom Database
              </button>
              <button onClick={goOfficialDatabase} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "official-database" || page === "official-card" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Database className="h-4 w-4" /> Official Database
              </button>
              <button onClick={goCharacters} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition ${page === "characters" || page === "character" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                <Sparkles className="h-4 w-4" /> Characters
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
            isAdmin={isAdmin}
          />
        )}

        {page === "database" && <DatabasePage cards={cards} onOpen={openCard} />}
        {page === "official-database" && <DatabasePage cards={officialCards} onOpen={openOfficialCard} />}
        {page === "characters" && <CharactersPage characters={characters} onOpen={openCharacter} />}
        {page === "character" && selectedCharacter && <CharacterDetailPage character={selectedCharacter} cards={allCards} onOpenCard={openAnyCard} onOpenCharacterList={goCharacters} />}
        {page === "archetype" && archetypeFilter && <ArchetypePage cards={cards} archetype={archetypeFilter} onOpen={openCard} onBrowseAll={goDatabase} />}
        {page === "downloads" && <DownloadsPage settings={settings} />}
        {page === "card" && selectedCard && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={goDatabase} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Back to database
              </button>
              {getArchetypeList(selectedCard).map((archetype) => (
                <button
                  key={archetype}
                  onClick={() => openArchetype(archetype)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  More from {archetype}
                </button>
              ))}
            </div>
            <CardDetail card={selectedCard} cards={cards} onBack={goDatabase} onOpen={openCard} />
          </div>
        )}
        {page === "official-card" && selectedOfficialCard && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={goOfficialDatabase} className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Back to official database
              </button>
            </div>
            <CardDetail card={selectedOfficialCard} cards={officialCards} onBack={goOfficialDatabase} onOpen={openOfficialCard} />
          </div>
        )}
      </div>
    </div>
  );
}
