import React from 'react';
import "./ModificationByFieldMain.css";
import Chart from "../charts/Chart";
import { useState } from 'react';




function ModificationByFieldMain(props) {
    const [UiObjs, setUiObjs] = useState([]);
    const handleFilter = e => {
        e.preventDefault();
        const startDate = e.target.startDate.value;
        const endDate = e.target.endDate.value;

        const fieldName = e.target.fieldName.value;
        const label = e.target.label.value;


        fetch('/api/analytics/modificationByField', {
            method: 'POST',
            body: JSON.stringify({ fieldName, startDate, endDate, label }),

            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => { setUiObjs(data) })
    }



    return (
        <div className='ModificationByField__Wrapper'>
            <div className="ModificationByField__MainTitle">Modification By Field</div>
            <div className="ModificationByField__Chart">
                {UiObjs &&

                    <Chart UiObjs={UiObjs} />
                }
            </div>
            <form onSubmit={handleFilter} className="ModificationByField__Filters">
                <select name="fieldName" className="ModificationByField__Filter" required>
                    <option value="" >
                        Field Name
                          </option>
                    <option value="all">All</option>
                    <option value="status">status</option>
                    <option value="priority">Priority</option>
                    <option value="qaRepresentative">Qa Representative</option>

                </select>

                <input className="ModificationByField__Filter" type="date" name="startDate" required></input>

                <input className="ModificationByField__Filter" type="date" name="endDate" required></input>

                <select name="label" className="ModificationByField__Filter" required>
                    <option value="" >
                        Label
              </option>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                </select>
                <button className="ModificationByField__Submit" type="submit"> submit</button>
            </form>

            <div className="chart_Colors">
                <div className="chart_Colors_Status">Status</div>
                <div className="chart_Colors_Priority">Priority</div>
                <div className="chart_Colors_QaRepresentative">QaRep</div>
            </div>

        </div>
    )

}


export default ModificationByFieldMain;