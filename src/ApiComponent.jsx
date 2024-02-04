// src/ApiComponent.js
import React, { useState, useEffect } from "react";
import "./ApiComponent.css";

const ApiComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize currentPage from localStorage or default to 1
    const storedPage = localStorage.getItem("currentPage");
    return storedPage ? parseInt(storedPage, 10) : 1;
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const offset = (currentPage - 1) * 10;
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=10&offset=${offset}`
      );
      const result = await response.json();
      // console.log(result);
      const pokemonArray = result.results || [];
      // console.log(pokemonArray);
      const detailedPokemonArray = await Promise.all(
        pokemonArray.map(async (pokemon) => {
          const detailsResponse = await fetch(pokemon.url);
          const detailsResult = await detailsResponse.json();
          console.log(detailsResult);

          const moves = detailsResult.moves.map((move) => move.move.name);

          return {
            id: detailsResult.id,
            name: detailsResult.name,
            image: detailsResult.sprites.front_default,
            moves: moves,
          };
        })
      );

      setData(detailedPokemonArray);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching Pokémon data.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      localStorage.setItem("currentPage", nextPage);
      return nextPage;
    });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage > 1 ? prevPage - 1 : 1;
      localStorage.setItem("currentPage", newPage);
      return newPage;
    });
  };

  const handleShowMoreMoves = (index) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[index].showAllMoves = true;
      return newData;
    });
  };

  const handleShowLessMoves = (index) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[index].showAllMoves = false;
      return newData;
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="pokemon-list-container">
      <h1>Pokémon List:</h1>
      <button onClick={handlePreviousPage} disabled={currentPage === 1}>
        Previous
      </button>
      <button className="pagination-button" onClick={handleNextPage}>
        Next
      </button>
      <ul className="pokemon-list">
        {data.map((pokemon, index) => (
          <li key={pokemon.id} className="pokemon-item">
            <img
              src={pokemon.image}
              alt={pokemon.name}
              className="pokemon-image"
            />
            <span className="pokemon-name">{pokemon.name}</span>
            <div className="pokemon-moves">
              {pokemon.showAllMoves
                ? pokemon.moves.map((move, moveIndex) => (
                    <span key={moveIndex}>{move} " </span>
                  ))
                : pokemon.moves
                    .slice(0, 4)
                    .map((move, moveIndex) => (
                      <span key={moveIndex}>{move} " </span>
                    ))}
            </div>
            {!pokemon.showAllMoves ? (
              <button onClick={() => handleShowMoreMoves(index)}>
                Show More Moves
              </button>
            ) : (
              <button onClick={() => handleShowLessMoves(index)}>
                Show Less Moves
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApiComponent;
