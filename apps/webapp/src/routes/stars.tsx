import { Card, Spinner } from "@blueprintjs/core";
import { usePulls } from "../lib/queries";
import Navbar from "../components/Navbar";
import PullTable from "../components/PullTable";

export default function Stars() {
  const pulls = usePulls({ starred: 1 });
  return (
    <>
      <Navbar />
      <Card>
        {pulls.isLoading ? <Spinner /> : <PullTable pulls={pulls.data} />}
      </Card>
    </>
  );
}
