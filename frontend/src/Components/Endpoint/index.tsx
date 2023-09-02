import React, { useState } from "react";
import Button from "plaid-threads/Button";
import Note from "plaid-threads/Note";

import Table from "../Table";
import Error from "../Error";
import { DataItem, Categories, ErrorDataItem, Data } from "../../dataUtilities";

import styles from "./index.module.scss";

interface Props {
  endpoint: string;
  name?: string;
  categories: Array<Categories>;
  schema: string;
  description: string;
  transformData: (arg: any) => Array<DataItem>;
}

const Endpoint = (props: Props) => {
  const [showTable, setShowTable] = useState(false);
  const [transformedData, setTransformedData] = useState<Data>([]);
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<ErrorDataItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getData = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
    
    // Log the response status and text
    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    try {
      const data = JSON.parse(responseText);
      if (data.error != null) {
        setError(data.error);
        setIsLoading(false);
        return;
      }
      setTransformedData(props.transformData(data)); // transform data into proper format for each individual product
      if (data.pdf != null) {
        setPdf(data.pdf);
      }
      setShowTable(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <div className={styles.endpointContainer}>
        <Note info className={styles.post}>
          POST
        </Note>
        <div className={styles.endpointContents}>
          <div className={styles.endpointHeader}>
            {props.name != null && (
              <span className={styles.endpointName}>{props.name}</span>
            )}
            <span className={styles.schema}>{props.schema}</span>
          </div>
          <div className={styles.endpointDescription}>{props.description}</div>
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            small
            centered
            wide
            secondary
            className={styles.sendRequest}
            onClick={getData}
          >
            {isLoading ? "Loading..." : `Send request`}
          </Button>
          {pdf != null && (
            <Button
              small
              centered
              wide
              className={styles.pdf}
              href={`data:application/pdf;base64,${pdf}`}
              componentProps={{ download: "Asset Report.pdf" }}
            >
              Download PDF
            </Button>
          )}
          <Button
            small
            centered
            wide
            secondary
            className={styles.downloadJson}
            onClick={async () => {
              setIsLoading(true);
              const response = await fetch(`/api/${props.endpoint}`, { method: "GET" });
              const data = await response.json();
              if (data.error != null) {
                setError(data.error);
                setIsLoading(false);
                return;
              }
              const json = JSON.stringify(data);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'data.json';
              link.click();
              URL.revokeObjectURL(url);
              setIsLoading(false);
          }}
          >
    {isLoading ? "Downloading..." : `Download JSON`}
  </Button>
        </div>
      </div>
      {showTable && (
        <Table
          categories={props.categories}
          data={transformedData}
          isIdentity={props.endpoint === "identity"}
        />
      )}
      {error != null && <Error error={error} />}
    </>
    
  );
};

Endpoint.displayName = "Endpoint";

export default Endpoint;
