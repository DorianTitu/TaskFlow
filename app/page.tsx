"use client";

import { useState, useEffect } from "react";
import { getQuote, getCompanyInfo } from "../utils/finnhub";

const StockTracker = () => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [portfolio, setPortfolio] = useState([]);
  const [stockInfo, setStockInfo] = useState(null);
  const [error, setError] = useState("");

  // Actualiza el precio actual de las acciones en el portafolio cada 60 segundos
  const updatePortfolioPrices = async () => {
    const updatedPortfolio = await Promise.all(
      portfolio.map(async (stock) => {
        const quote = await getQuote(stock.symbol);
        return { ...stock, currentPrice: quote.c };
      })
    );
    setPortfolio(updatedPortfolio);
  };

  useEffect(() => {
    const interval = setInterval(updatePortfolioPrices, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, [portfolio]);

  // Maneja la búsqueda de información de una acción
  const handleSearch = async () => {
    try {
      const data = await getCompanyInfo(symbol);
      if (!data.name) throw new Error("Acción no encontrada");
      const quote = await getQuote(symbol);
      setStockInfo({ ...data, currentPrice: quote.c });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Maneja la compra de una acción
  const handleBuy = () => {
    if (stockInfo) {
      setPortfolio([
        ...portfolio,
        {
          ...stockInfo,
          quantity,
          purchasePrice: stockInfo.currentPrice,
        },
      ]);
      setSymbol("");
      setStockInfo(null);
    }
  };

  return (
    <div>
      <h1>Rastreador de Acciones</h1>

      {/* Sección para buscar y comprar acciones */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Comprar Acciones</h2>
        <input
          type="text"
          placeholder="Símbolo (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        />
        <button onClick={handleSearch}>Buscar</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {stockInfo && (
          <div>
            <h3>{stockInfo.name}</h3>
            <p>Precio actual: ${stockInfo.currentPrice}</p>
            <label>
              Cantidad:
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <button onClick={handleBuy}>Comprar</button>
          </div>
        )}
      </div>

      {/* Sección para visualizar el portafolio */}
      <div>
        <h2>Mi Portafolio</h2>
        {portfolio.length === 0 ? (
          <p>No tienes acciones compradas aún.</p>
        ) : (
          portfolio.map((stock, index) => (
            <div key={index}>
              <h3>
                {stock.name} ({stock.symbol})
              </h3>
              <p>Cantidad: {stock.quantity}</p>
              <p>Precio de compra: ${stock.purchasePrice}</p>
              <p>Precio actual: ${stock.currentPrice}</p>
              <p>
                Ganancia/Pérdida: $
                {((stock.currentPrice - stock.purchasePrice) * stock.quantity).toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockTracker;
