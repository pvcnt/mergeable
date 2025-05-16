import { Button, HTMLTable } from "@blueprintjs/core";
import { useState } from "react";
import ConnectionDialog from "./ConnectionDialog";
import type { Connection, ConnectionProps } from "../lib/types";

import styles from "./ConnectionTable.module.scss";

export type Props = {
  connections: Connection[];
  allowedUrls?: string[];
  onSubmit: (prev: Connection, v: ConnectionProps) => Promise<void>;
  onDelete: (v: Connection) => Promise<void>;
};

export default function ConnectionTable({
  connections,
  allowedUrls,
  onSubmit,
  onDelete,
}: Props) {
  const [connection, setConnection] = useState<Connection | undefined>(
    undefined,
  );
  return (
    <>
      <HTMLTable className={styles.table}>
        <thead>
          <tr>
            <th>Host</th>
            <th>Label</th>
            <th>Viewer</th>
            <th>Organizations</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((connection, idx) => (
            <tr key={idx}>
              <td>
                <a href={`https://${connection.host}`}>{connection.host}</a>
              </td>
              <td>{connection.label || ""}</td>
              <td>{connection.viewer?.user.name || <i>Unknown</i>}</td>
              <td>{connection.orgs.join(", ")}</td>
              <td>
                <Button
                  text="Edit"
                  variant="minimal"
                  onClick={() => setConnection(connection)}
                ></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
      <ConnectionDialog
        connection={connection}
        title="Edit connection"
        isOpen={connection !== undefined}
        allowedUrls={allowedUrls}
        onClose={() => setConnection(undefined)}
        onSubmit={connection && ((v) => onSubmit(connection, v))}
        onDelete={connection && (() => onDelete(connection))}
      />
    </>
  );
}
