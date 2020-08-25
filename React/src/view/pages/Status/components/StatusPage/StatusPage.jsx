import React from "react";
import "./StatusPage.css";
import { useState } from "react";
import SelectInput from "../Select/SelectInput";
import DashBoard from "../DashBoard/DashBoard";
import Chart from "../../../../../components/charts/Chart";

import Table from "../Table/Table";

let array = [
  { name: "functional tests", number: 12 },
  { name: "fix versions", number: 10 },
  { name: "deleted tasks", number: 20 },
  { name: "total tasks", number: 36 },
];

const optionSprint = [
  { value: "Backlog", label: "Backlog" },
  { value: "inProgress", label: "In Progress" },
  { value: "Done", label: "Done" },
];
const StatusPage = (props) => {
  // const [cardsContent,setCardsContent]=useState([]);
  // setCardsContent(array);
  // console.log(cardsContent)

  return (
    <div className="statuspage">
      <div className="statuspage__dashboard">
        <DashBoard cardsContent={array} />
      </div>
      <div className="statuspage__table">
        <Table />
      </div>
      <div className="statuspage__chart">
        <Chart />
      </div>
      <div className="statuspage__pie"></div>
    </div>
  );
};
export default StatusPage;
