import "./styles.css";
import ReactJson from "react-json-view";
import { atom, useAtom } from "jotai";
import { atomsWithQuery } from "jotai-tanstack-query";
import { PageLoader } from "./PageLoader";

const idAtom = atom(1);
const [userAtom] = atomsWithQuery((get) => ({
  queryKey: ["users", get(idAtom)],
  queryFn: async ({ queryKey: [, id] }) => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    return res.json();
  }
}));

const UserData = () => {
  const [data] = useAtom(userAtom);
  return <ReactJson src={data} />;
};

export default function App() {
  return (
    <div>
      <PageLoader />
    </div>
  );
}
