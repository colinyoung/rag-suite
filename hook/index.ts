import { useState } from "react";

const DEFAULT_OPTIONS = {
  fetchOptions: {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  },
};

const DEFAULT_SEARCH_OPTIONS = {
  topK: 5,
};

export const useRAG = (url: string, options = DEFAULT_OPTIONS) => {
  const [matches, setMatches] = useState([]);
  const search = (query: string, searchOptions = DEFAULT_SEARCH_OPTIONS) => {
    if (!query) {
      return;
    }
    fetch(url + "/search", {
      ...options.fetchOptions,
      body: JSON.stringify({
        query,
        ...searchOptions,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
      });
  };
  return { search, matches };
};

export default useRAG;
