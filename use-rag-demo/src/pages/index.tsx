import useRAG from "@use-rag/hook";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import "./style.css";
import _ from "lodash";

const App = () => {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const { search, matches } = useRAG("http://localhost:3000");
  const [result, setResult] = useState<any>([]);

  useEffect(() => {
    search(query, { topK });
  }, [query, topK]);
  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <div>
        <p>Search query:</p>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p>Top K:</p>
        <input
          type="number"
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
        />
        {matches
          ? matches.map((match: any) => {
              return (
                <div>
                  <p>
                    {match.similarity.toFixed(2)}:{" "}
                    {_.truncate(match.content, {
                      length: 100,
                    })}
                  </p>
                </div>
              );
            })
          : null}
      </div>
    </>
  );
};

export default App;
