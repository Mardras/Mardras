import React, { useMemo, useState } from "react";
import { Home, Database, ChevronLeft } from "lucide-react";

const defaultCards = [
  {
    id: "60060041",
    name: "L.S. Shadow Emperor Dragon Bekrelon",
    author: "Mardras",
    archetype: "L.S.",
    attribute: "DIVINE",
    level: 12,
    atk: 5000,
    def: 5000,
    image: "/cards/60060041.jpg",
    lore:
      'Cannot be Normal Summoned/Set. Must be Special Summoned by having 2+ "L.S." monsters in your GY.',
  },
];

function CardThumb({ card, onOpen }) {
  return (
    <button
      onClick={() => onOpen(card)}
      className="border rounded-xl bg-white shadow hover:shadow-lg"
    >
      <img src={card.image} alt={card.name} />
      <div className="p-2 text-sm font-semibold">{card.name}</div>
      <div className="text-xs text-gray-500 pb-2">ID: {card.id}</div>
    </button>
  );
}

function CardDetail({ card, onBack }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="px-3 py-2 border rounded bg-white hover:bg-gray-50"
      >
        <ChevronLeft className="inline w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <img src={card.image} alt={card.name} className="w-full border" />

        <div className="border rounded p-4">
          <div><b>ID:</b> {card.id}</div>
          <div><b>Attribute:</b> {card.attribute}</div>
          <div><b>Level:</b> {card.level}</div>
          <div><b>ATK / DEF:</b> {card.atk} / {card.def}</div>
          <div><b>Archetype:</b> {card.archetype}</div>
          <div><b>Author:</b> {card.author}</div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white whitespace-pre-wrap">
        {card.lore}
      </div>
    </div>
  );
}

function DatabasePage({ cards, onOpen }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return cards.filter((card) =>
      (card.name + card.id).toLowerCase().includes(query.toLowerCase())
    );
  }, [cards, query]);

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cards..."
        className="border rounded px-3 py-2 w-full"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((card) => (
          <CardThumb key={card.id} card={card} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [cards] = useState(defaultCards);
  const [page, setPage] = useState("home");
  const [selectedCard, setSelectedCard] = useState(null);

  function goHome() {
    setPage("home");
  }

  function goDatabase() {
    setPage("database");
  }

  function openCard(card) {
    setSelectedCard(card);
    setPage("card");
  }

  return (
    <div className="min-h-screen bg-[#dce5c6] p-6">
      <header className="flex gap-3 mb-6">
        <button
          onClick={goHome}
          className="px-4 py-2 border rounded bg-white"
        >
          <Home className="inline w-4 h-4" /> Home
        </button>

        <button
          onClick={goDatabase}
          className="px-4 py-2 border rounded bg-white"
        >
          <Database className="inline w-4 h-4" /> Database
        </button>
      </header>

      {page === "home" && (
        <div className="text-xl font-bold">
          Mardras Custom Card Database
        </div>
      )}

      {page === "database" && (
        <DatabasePage cards={cards} onOpen={openCard} />
      )}

      {page === "card" && selectedCard && (
        <CardDetail card={selectedCard} onBack={goDatabase} />
      )}
    </div>
  );
}