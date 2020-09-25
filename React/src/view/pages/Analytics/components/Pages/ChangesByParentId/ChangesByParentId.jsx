import React, { useState, useRef } from 'react';
import "./ChangesByParentId.css";
import Select from 'react-select'
import { useEffect } from 'react';
import PieChartAnalysis from "../../charts/PicChartAnalysis"

//Server Filters to receive Data
let serverFilters = {
    fixVersion: [],
    startDate: "",
    endDate: ""
};

function ChangesByParentId() {
    //On Page Opening
    useEffect(() => {
        //Building Start and End date for last month (Default)
        let startDate = new Date()
        let endDate = new Date()
        startDate.setMonth(endDate.getMonth() - 1)
        let endMonth = endDate.getMonth() + 1 < 10
            ? `0${endDate.getMonth() + 1}`
            : endDate.getMonth() + 1;
        let startMonth = startDate.getMonth() + 1 < 10
            ? `0${startDate.getMonth() + 1}`
            : startDate.getMonth() + 1;
        setStartDate(`${startDate.getFullYear()}-${startMonth}-${startDate.getDate()}`)
        setEndDate(`${endDate.getFullYear()}-${endMonth}-${endDate.getDate()}`)
        const timeZone = startDate.getTimezoneOffset() / 60
        startDate.setHours(0 - timeZone, 0, 0, 0)
        endDate.setHours(0 - timeZone + 23, 59, 59, 59);

        //Default Server Filters to receive Data
        serverFilters = {
            fixVersion: [],
            startDate: startDate,
            endDate: endDate
        };
        //fetch to receive Available Filters options from server
        fetch('/api/analytics/changesByParentIdFilters', {
            method: 'POST',
            body: JSON.stringify({ serverFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.json()).then((data) => {
            if (data.length > 0) {
                setfixVersionOptions(data[0].fixVersions)
            } else {
                alert("No Available Filters From The Server Check The connection")
            }

        })

        //fetch to receive saved filters
        fetch('/api/analytics/analyticsSelectFields', {
            method: 'POST',
            body: JSON.stringify({ savedFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.json()).then((data) => {

            if (data.array != null) {
                if (data.array.length > 0) {
                    setSavedFiltersArray(data.array);
                    setSelectFiltersOptions(data.array[data.array.length - 1].filterNames);
                }

            }
        })

    }, [])

    const [UiObjs,
        setUiObjs] = useState([]);
    const [fixVersionOptions,
        setfixVersionOptions] = useState([]);
    const [startDate,
        setStartDate] = useState("");
    const [endDate,
        setEndDate] = useState("");

    //fetch to receive Data (UiObj) from server after every filter Change
    const render = (serverFilters) => {
        fetch('/api/analytics/ChangesByParentIdFilters', {
            method: 'POST',
            body: JSON.stringify({ serverFilters }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.json()).then((data) => {
            console.log(data)
            if (data.length === 3) {
                setUiObjs(data)
            } else {
                setUiObjs([])
            }
        })
    }

    // Filters Changes Handlers for each Filter we have a handler to update
    // serverFilters that we send to server to receive data according to our picks
    // fixVersion
    const HandlefixVersionChange = (change => {
        serverFilters.fixVersion = [change.label];
        render(serverFilters);
    })

    //Start Date
    const HandleStartDateChange = (change => {
        setStartDate(change.target.value)
        serverFilters.startDate = change.target.value;
        if (serverFilters.fixVersion.length > 0) {
            render(serverFilters);
        }
    })

    //End Date
    const HandleEndDateChange = (change => {
        setEndDate(change.target.value)
        let endDate = new Date(change.target.value)
        const timeZone = (endDate.getTimezoneOffset() / 60);
        endDate.setHours((0 - timeZone) + (23), 59, 59, 59);
        serverFilters.endDate = endDate;
        if (serverFilters.fixVersion.length > 0) {
            render(serverFilters);
        }
    })

    // Filters Section changes By ParentID save filters Variables We Use UseRef to
    // clear other filters when we pick Main Filter
    let fixVersionInput = useRef("")
    let selectFilterInput = useRef("")

    // Filters Section save filters Variables Filters Variable to save the filters
    // data
    let savedFilters = {
        pageName: 'ChangesByParentID',
        filters: [
            {
                filter: 'fixVersion',
                values: []
            }
        ],
        filterName: ''
    };

    //select filter option for the filter
    let [selectFiltersOptions,
        setSelectFiltersOptions] = useState([]);

    //select filter option for the filter
    let [savedFiltersArray,
        setSavedFiltersArray] = useState([]);

    //a Variable for the filter name
    let filterName = '';

    // a Variable for the selected filter option let selectFilterCurrentOption = '';
    let [selectFilterCurrentOption,
        setSelectFilterCurrentOption] = useState("");

    //a var for saving the selected filter current option
    let index = 0;

    const [showFilters, setShowFilters] = useState(false)

    //a function for handling the save filter button
    const handleSaveFilter = (e => {
        savedFilters
            .filters[0]
            .values
            .push(serverFilters.fixVersion);
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

                } else {
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
            fixVersion: [],
            startDate: startDate,
            endDate: endDate
        };

        if (change != null) {
            setSelectFilterCurrentOption(change.value);
            for (let i = 0; i < savedFiltersArray.length - 1; i++) {
                if (savedFiltersArray[savedFiltersArray.length - 1].filterNames[i].label == change.value) {
                    index = i;
                }
            }

            fixVersionInput.current.state.value = {
                label: savedFiltersArray[index].filters[0].values
            }

            if (savedFiltersArray[index].filters[0].values != null) {
                savedFiltersArray[index]
                    .filters[0]
                    .values
                    .map((item) => {
                        serverFilters
                            .fixVersion
                            .push(item);
                    })

            }

        } else {
            serverFilters.fixVersion = []

            fixVersionInput.current.state.value = ""
            selectFilterInput.current.state.value = ""

        }

        render(serverFilters);
    })

    //a function for handling the delete filter button
    const handleDeleteFilter = (e => {
        const pageName = 'ChangesByParentID';
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
                    fixVersionInput.current.state.value = ""
                    selectFilterInput.current.state.value = ""

                    serverFilters = {
                        fixVersion: [],
                        startDate: startDate,
                        endDate: endDate
                    };
                    renderSavedFilters(savedFilters);
                    render(serverFilters);
                    alert('Filter deleted successfully')
                } else {
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
        }).then((res) => res.json()).then((data) => {

            if (data.array != null) {
                if (data.array.length > 0) {
                    setSavedFiltersArray(data.array);
                    setSelectFiltersOptions(data.array[data.array.length - 1].filterNames);
                }
            }
        })
    }

    return (

        <div className='ChangesByParentIdWrapper'>
            <link
                href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
                rel="stylesheet"></link>
            <div className="ChangesByParentId__Title">Changes By Parent Id</div>
            <div className="ChangesByParentId__Chart">
                {UiObjs.length > 0 && <PieChartAnalysis UiObjs={UiObjs} title="Changes By Parent ID (All)" />}
            </div>
            {/* Select Filters */}

            <div className="ChangesByParentId__Filters__wrapper">
                <div className="ChangesByParentId__Filters__fields">
                    <div className="ChangesByParentId___Filters__Header">
                        <div className="Date_header">
                            <p>Fix Version</p>
                            <Select
                                name="fixVersion"
                                ref={fixVersionInput}
                                options={fixVersionOptions}
                                placeholder="fix Version "
                                className="ChangesByParentId__Filter"
                                onChange={HandlefixVersionChange} />
                        </div>
                    </div>

                    <div className="ChangesByParentId___Filters__Header">
                        <div className="Date_header">
                            <p>Start Date</p>
                            <input
                                className="ChangesByParentId__DateFilter"
                                type="date"
                                name="startDate"
                                value={startDate}
                                onChange={HandleStartDateChange} />
                        </div>
                    </div>

                    <div className="ChangesByParentId___Filters__Header">
                        <div className="Date_header">
                            <p>End Date</p>
                            <input
                                className="ChangesByParentId__DateFilter"
                                type="date"
                                name="endDate"
                                value={endDate}
                                onChange={HandleEndDateChange} />
                        </div>
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

export default ChangesByParentId;