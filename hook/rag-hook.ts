//- proposal for react hooks
//useRAG

const fetchOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

/*
const useRAG = (url: string) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: null,
  });

  const fetchData = useCallback(async () => {
    setState({ ...state, loading: true });
    try {
      const res = await fetch(url, fetchOptions);
      const data = await res.json();
      setState({ ...state, loading: false, data });
    } catch (error) {
      setState({ ...state, loading: false, error });
    }
  }, [url]);

  return {
    matches: state.data,
    loading: state.loading,
    error: state.error,
    fetchData,
  };
};*/

type Match = {
  vector: number[];
  id: string;
  score: number;
  data: any;
};

async function getUsers() {
  const { query } = useRAG("http://localhost:8000/use-rag-backend/"); // backend running use-rag-node (postgres)
  const { matches } = await query("users", { topK: 10, fetchOptions });
  const bestMatch = matches[0];
  const record = await bestMatch.retrieve();
  chatAPI.sendMessage(record.data.message);
}

/*
not in scope but would be important:
- writes
- pagination
- caching
*/
