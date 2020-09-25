import React, { useEffect } from 'react';
import "./ModificationByField.css";
import { useState, useRef } from 'react';
import Select from "react-select"
import Chart from "../../charts/Chart"


//Server Filters to receive Data
let serverFilters = { fieldName: [], values: [], qaRepresentative: [], startDate: "", endDate: "", label: [] };
function ModificationByField(props) {
    //On Page Opening

    useEffect(() => {
        //Building Start and End date for last month (Default)
        let startDate = new Date();
        let endDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);
        let endMonth = endDate.getMonth() + 1 < 10 ? `0${endDate.getMonth() + 1}` : endDate.getMonth() + 1;
        let startMonth = startDate.getMonth() + 1 < 10 ? `0${startDate.getMonth() + 1}` : startDate.getMonth() + 1;
        setStartDate(`${startDate.getFullYear()}-${startMonth}-${startDate.getDate()}`)
        setEndDate(`${endDate.getFullYear()}-${endMonth}-${endDate.getDate()}`)
        const timeZone = (startDate.getTimezoneOffset() / 60);
        startDate.setHours(0 - timeZone, 0, 0, 0);
        endDate.setHours(0 - timeZone + 23, 59, 59, 59);


        //Default Server Filters to receive Data
        serverFilters = {
            fieldName: [],
            values: [],
            qaRepresentative: [],
            startDate: (startDate),
            endDate: (endDate),
            label: ["weekly"]
        };

        //fetch to receive Available Filters options from server by date
        fetch('/api/analytics/modificationByFieldFilters', {
            method: 'POST',
            body: JSON.stringify({
                fieldName: serverFilters.fieldName,
                startDate: serverFilters.startDate,
                endDate: serverFilters.endDate
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setFieldNameOptions(data[0].labels);
                    setQaRepresentativeOptions(data[0].QA);
                }
                else {
                    alert("No Available Filters From The Server Check The connection / Change date")
                }
            })

        //fetch to receive Data (UiObj) from the server
        fetch('/api/analytics/modificationByField', {
            method: 'POST',
            body: JSON.stringify({ serverFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data != null) {
                    setUiObjs(data);
                }
                else { setUiObjs([]); }
            })

        //fetch to receive saved filters 
        fetch('/api/analytics/analyticsSelectFields', {
            method: 'POST',
            body: JSON.stringify({ savedFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {

                if (data.array != null) {
                    if (data.array.length > 0) {
                        setSavedFiltersArray(data.array);
                        setSelectFiltersOptions(data.array[data.array.length - 1].filterNames);
                    }

                }
            })

    }, [])

    //fetch to receive Data (UiObj) from server after every filter Change
    const render = (serverFilters) => {
        fetch('/api/analytics/modificationByField', {
            method: 'POST',
            body: JSON.stringify({ serverFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data != null) {
                    setUiObjs(data);

                }
                else {
                    setUiObjs([]);
                }
            })
    }

    //fetch to get values after picking certain fieldName 
    const renderFilters = (serverFilters) => {
        fetch('/api/analytics/modificationByFieldFilters', {
            method: 'POST',
            body: JSON.stringify({ fieldName: serverFilters.fieldName }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                if (data != null) {
                    if (data.length > 0)
                        setValueOptions(data[0].Values);
                    else {

                        setValueOptions([]);
                    }
                }
            })
    }

    //Modification By Field Variables
    const [UiObjs, setUiObjs] = useState([]); //UiObject from the server
    const [fieldNameOptions, setFieldNameOptions] = useState([]); //FieldName options for filtering
    const [valueOptions, setValueOptions] = useState([]);//Values of certain FieldName options for filtering
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [qaRepresentativeOptions, setQaRepresentativeOptions] = useState([]);//Qa Representative options for filtering
    const labelOptions = [ //Labels for Displaying the Chart 
        { value: "daily", label: "daily" },
        { value: "weekly", label: "weekly" },
        { value: "monthly", label: "monthly" },
        { value: "yearly", label: "yearly" }];





    // handleSaveFilter

    //Filters Changes Handlers
    // for each Filter we have a handler
    // to update serverFilters that we send to server to receive data according to our picks

    //Label
    const handleChangeLabel = (change => {
        serverFilters.label = [change.value];
        render(serverFilters);
    })

    //Field Name
    const handleChangeFieldName = (change => {
        serverFilters.values = [];
        serverFilters.qaRepresentative = [];
        if (change != null) { serverFilters.fieldName = [change.value]; }
        else {
            serverFilters.fieldName = [];
            valueInput.current.state.value = "";
            qaInput.current.state.value = ""
        }
        render(serverFilters);
        renderFilters(serverFilters);
    })

    //Values
    const handleChangeValues = (change => {
        serverFilters.values = [];
        if (change != null) {
            change.map((item) => {
                let value = item.value;
                if (value === "true" || value === "false") {
                    value = (value === 'true');

                }
                return (serverFilters.values.push(value))
            })     // change.map((item) => { })
        }
        else { serverFilters.values = []; }
        render(serverFilters);
    })

    //Qa Representative
    const handleChangeQaRepresentative = (change => {
        serverFilters.qaRepresentative = [];
        if (change != null) {
            change.map((item) => {
                return (serverFilters.qaRepresentative.push(item.value))
            })
        }
        else { serverFilters.qaRepresentative = []; }

        render(serverFilters);
    })

    //Start Date
    const handleChangeStartDate = (change => {
        setStartDate(change.target.value)
        serverFilters.startDate = new Date(change.target.value);
        render(serverFilters);
    })
    //End Date
    const handleChangeEndDate = (change => {
        setEndDate(change.target.value)
        let endDate = new Date(change.target.value)
        const timeZone = (endDate.getTimezoneOffset() / 60);
        endDate.setHours((0 - timeZone) + (23), 59, 59, 59);
        serverFilters.endDate = endDate;
        render(serverFilters);
    })

    //We Use UseRef to clear other filters when we pick Main Filter
    let valueInput = useRef("")
    let qaInput = useRef("")
    let FieldNameInput = useRef("")
    let periodInput = useRef("")
    let selectFilterInput = useRef("")



    //Filters Section

    //Modification By Field save filters Variables

    //Filters Variable to save the filters data
    let savedFilters = { pageName: 'ModificationByField', filters: [{ filter: 'fieldName', values: [] }, { filter: 'value', values: [] }, { filter: 'qaRepresentative', values: [] }, { filter: 'label', values: [] }], filterName: '' };

    //select filter option for the filter
    let [selectFiltersOptions, setSelectFiltersOptions] = useState([]);

    //select filter option for the filter
    let [savedFiltersArray, setSavedFiltersArray] = useState([]);

    //a Variable for the filter name
    let filterName = '';

    //a Variable for the selected filter option
    // let selectFilterCurrentOption = '';
    let [selectFilterCurrentOption, setSelectFilterCurrentOption] = useState("");

    //a var for saving the selected filter current option 
    let index = 0;

    
    const [showFilters, setShowFilters] = useState(false)

    //a function for handling the save filter button
    const handleSaveFilter = (e => {
        savedFilters.filters[0].values.push(serverFilters.fieldName);
        savedFilters.filters[1].values.push(serverFilters.values);
        savedFilters.filters[2].values.push(serverFilters.qaRepresentative);
        savedFilters.filters[3].values.push(serverFilters.label[0]);
        savedFilters.filterName = filterName;
        fetch('/api/analytics/analyticsSavedFilters', {
            method: 'POST',
            body: JSON.stringify({ savedFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === true) {
                    renderSavedFilters(savedFilters);
                    alert('Filter saved successfully')

                }

                else {
                    alert(data.error);
                }
            })
    })



    //handleFilterName
    const handleFilterName = (e => {
        filterName = e.target.value;

    })

    //a function for handling the select filter button
    const handleSelectFilter = (change => {


        serverFilters = {
            fieldName: [],
            values: [],
            qaRepresentative: [],
            startDate: (startDate),
            endDate: (endDate),
            label: []
        };
        if (change != null) {
            setSelectFilterCurrentOption(change.value);
            for (let i = 0; i < savedFiltersArray.length - 1; i++) {
                if (savedFiltersArray[savedFiltersArray.length - 1].filterNames[i].label == change.value) {
                    index = i;
                }
            }

            FieldNameInput.current.state.value = { label: savedFiltersArray[index].filters[0].values }
            valueInput.current.state.value = { label: savedFiltersArray[index].filters[1].values }
            qaInput.current.state.value = { label: savedFiltersArray[index].filters[2].values }
            periodInput.current.state.value = { label: savedFiltersArray[index].filters[3].values }


            if (savedFiltersArray[index].filters[0].values != null) {
                savedFiltersArray[index].filters[0].values.map((item) => {
                    serverFilters.fieldName.push(item);
                }
                )

            }

            if (savedFiltersArray[index].filters[1].values != null) {
                savedFiltersArray[index].filters[1].values.map((item) => {
                    serverFilters.values.push(item);
                }
                )

            }
            if (savedFiltersArray[index].filters[2].values != null) {
                savedFiltersArray[index].filters[2].values.map((item) => {
                    serverFilters.qaRepresentative.push(item);
                }
                )

            }
            if (savedFiltersArray[index].filters[3].values != null) {
                savedFiltersArray[index].filters[3].values.map((item) => {
                    serverFilters.label.push(item);
                }
                )

            }
        }
        else {
            serverFilters.fieldName = []
            serverFilters.values = []
            serverFilters.qaRepresentative = []
            serverFilters.startDate = startDate
            serverFilters.endDate = endDate
            serverFilters.label = ["weekly"]
            valueInput.current.state.value = ""
            qaInput.current.state.value = ""
            FieldNameInput.current.state.value = ""
            periodInput.current.state.value = ""
            selectFilterInput.current.state.value = ""
        }

        render(serverFilters);
    })


    //a function for handling the delete filter button
    const handleDeleteFilter = (e => {
        const pageName = 'ModificationByField';
        if (!window.confirm('Are you sure you want to delete this Filter?')) {
            alert("Not Deleted")
            return;
        }

        fetch('/api/analytics/analyticsDeleteFilters', {
            method: 'POST',
            body: JSON.stringify({ selectFilterCurrentOption, pageName }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === true) {
                    FieldNameInput.current.state.value = ""
                    valueInput.current.state.value = ""
                    qaInput.current.state.value = ""
                    periodInput.current.state.value = ""
                    selectFilterInput.current.state.value = ""

                    serverFilters = {
                        fieldName: [],
                        values: [],
                        qaRepresentative: [],
                        startDate: (startDate),
                        endDate: (endDate),
                        label: []
                    };
                    renderSavedFilters(savedFilters);
                    render(serverFilters);
                    alert('Filter deleted successfully')
                }

                else {
                    alert(data.error);
                }
            })
    })

    //a funtion to receive Data from server after every save filter Change
    const renderSavedFilters = (savedFilters) => {

        fetch('/api/analytics/analyticsSelectFields', {
            method: 'POST',
            body: JSON.stringify({ savedFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {

                if (data.array != null) {
                    if (data.array.length > 0) {
                        setSavedFiltersArray(data.array);
                        setSelectFiltersOptions(data.array[data.array.length - 1].filterNames);
                    }
                }
            })
    }


    return (
        <div className='ModificationByField__Wrapper'>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"></link>
            <div className="ModificationByField__Chart">
                {UiObjs && <Chart UiObjs={UiObjs} title="Modification By Field (All)" />}
            </div>
            <div className="ModificationByField__MainTitle">Modification By Field</div>

            <div className="ModificationByField__Filters__wrapper">

                <div className="ModificationByField__Filters__fields">

                    <div className="ModificationByField__Filters__Header">
                        <p>Field Name</p>
                        <Select
                            name="fieldName"
                            onInputChange={() => { valueInput.current.state.value = ""; qaInput.current.state.value = "" }}
                            onChange={handleChangeFieldName}
                            placeholder="All"
                            className="ModificationByField__Filter"
                            options={fieldNameOptions}
                            ref={FieldNameInput}
                            isClearable={true} />
                    </div>

                    <div className="ModificationByField__Filters__Header">
                        <p>Value</p>
                        <Select
                            name="value"
                            onChange={handleChangeValues}
                            ref={valueInput}
                            isMulti
                            placeholder="Value"
                            className="ModificationByField__Filter"
                            options={valueOptions} />
                    </div>

                    <div className="ModificationByField__Filters__Header">
                        <p>Qa Representative</p>
                        <Select
                            name="qaRepresentative"
                            ref={qaInput}
                            isMulti
                            onChange={handleChangeQaRepresentative}
                            placeholder="QA Representative"
                            className="ModificationByField__Filter"
                            options={qaRepresentativeOptions}
                            isClearable={true} />
                    </div>

                    <div className="ModificationByField__Filters__Header">
                        <p>Start Date</p>
                        <input
                            className="Filter__date"
                            type="date"
                            value={startDate}
                            onChange={handleChangeStartDate}
                        />
                    </div>

                    <div className="ModificationByField__Filters__Header">
                        <p>End Date</p>
                        <input
                            className="Filter__date"
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={handleChangeEndDate} />
                    </div>

                    <div className="ModificationByField__Filters__Header">
                        <p>Period</p>
                        <Select
                            name="label"
                            onChange={handleChangeLabel}
                            placeholder="Weekly"
                            className="ModificationByField__Filter"
                            ref={periodInput}
                            options={labelOptions} />
                             </div>

                        <button className='button' onClick={() => { setShowFilters(true) }}>Filters</button>

                        <div className="ModificationByField__Filters__Header">
                            <div className={showFilters ? 'filtersPop' : 'none'}>
                                <h5>Select Filter To View</h5>
                                <Select
                                    name="selectFilter"
                                    id="selectFilter"
                                    onChange={handleSelectFilter}
                                    placeholder="selectFilter"
                                    className="filter1-item__ModificationByField"
                                    ref={selectFilterInput}
                                    isClearable={true}
                                    options={selectFiltersOptions} />

                                <button
                                    id="deleteFilterBTN"
                                    type="button"
                                    onClick={handleDeleteFilter}
                                    className="filter1-item__ModificationByField"
                                    name="deleteFilterBTN">Delete filter
                                 </button>

                                <form >
                                    <h5 id="createFilter">Create Filter</h5>
                                    <input className="filter2-item__ModificationByField"
                                        type="text"
                                        name="filterName"
                                        id="filterName"
                                        placeholder="filterName"
                                        onKeyUp={handleFilterName}></input>
                                    <button
                                        id="saveFilterBTN"
                                        type="button"
                                        onClick={handleSaveFilter}
                                        className="filter2-item__ModificationByField"
                                        name="saveFilterBTN">Save Filter
                             </button>

                                    <button
                                        className="filter2-item__ModificationByField"
                                        id="closeFilterBTN"
                                        type="button"
                                        onClick={() => { setShowFilters(false) }}
                                        name="closeFilterBTN">Close
                                </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )

}


export default ModificationByField;



