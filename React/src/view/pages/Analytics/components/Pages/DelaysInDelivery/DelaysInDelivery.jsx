import React from 'react';
import { useState, useEffect, useRef } from 'react';
import "./DelaysInDelivery.css";

//Components 
import Select from 'react-select'
import Chart from "../../charts/Chart"

// Filters To Send To Server 
let serverFilters = {
  fixVersion: [],
  jiraType: [],
  qaRepresentative: [],
  startDate: "",
  endDate: "",
  label: []
};

function DelaysInDelivery() {

  // Functions ==> Fetch :
  //On Page opening

  useEffect(() => {

    //Building Start and End date for last month (Default)
    let startDate = new Date()
    let endDate = new Date()
    startDate.setMonth(endDate.getMonth() - 1)
    let endMonth = endDate.getMonth() + 1 < 10 ? `0${endDate.getMonth() + 1}` : endDate.getMonth() + 1;
    let startMonth = startDate.getMonth() + 1 < 10 ? `0${startDate.getMonth() + 1}` : startDate.getMonth() + 1;
    setStartDate(`${startDate.getFullYear()}-${startMonth}-${startDate.getDate()}`)
    setEndDate(`${endDate.getFullYear()}-${endMonth}-${endDate.getDate()}`)
    const timeZone = startDate.getTimezoneOffset() / 60
    startDate.setHours(0 - timeZone, 0, 0, 0)
    endDate.setHours(0 - timeZone + 23, 59, 59, 59);

    //Default Server Filters to receive Data
    serverFilters = {
      fixVersion: [],
      jiraType: [],
      qaRepresentative: [],
      startDate: startDate,
      endDate: endDate,
      label: ["weekly"]
    };

    //fetch to receive Available Filters options from server by date
    fetch('api/analytics/delaysInDeliveryFilters', {
      method: 'POST',
      body: JSON.stringify(serverFilters),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setfixVersionOptions(data[0].fixVersion)
        }
        else {
          alert("no data received from the server... ")
        }

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

  // Functions ==> Fetch : 
  //fetch to receive Data (UiObj) from the server
  const render = (serverFilters) => {
    fetch('api/analytics/delaysInDelivery', {
      method: 'POST',
      body: JSON.stringify(serverFilters),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setUiObjs(data)
      })

  }

  //fetch to receive Available Filters options from server by date
  const renderFilters = (serverFilters) => {
    fetch('api/analytics/delaysInDeliveryFilters', {
      method: 'POST',
      body: JSON.stringify(serverFilters),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setQaRepresentativeOptions(data[0].qa);
        }
        else {
          alert("no data received for (Qa) from the server... ")
        }
      })

  }


  // Delays in Delivery Variables :

  // To set UiObj from the filtered Data we recieved from server 
  const [UiObjs, setUiObjs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Options To get From Server 
  const [fixVersionOptions, setfixVersionOptions] = useState([])
  const [qaRepresentativeOptions, setQaRepresentativeOptions] = useState([])

  //Jira Type Filter
  const jiraTypeOptions = [
    { value: "Create", label: "Create" },
    { value: "Delete", label: "Delete" },
    { value: "Update", label: "Update" },
  ]

  // Label Filter 
  const labelOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
  ]



  //Filters Changes Handlers
  // for each Filter we have a handler
  // to update serverFilters that we send to server to receive data according to our picks 


  //Fix Version
  const HandlefixVersionChange = (version => {
    serverFilters.jiraType = []
    serverFilters.qaRepresentative = []
    if (version != null) {
      serverFilters.fixVersion = [version.value]
    }
    else {
      serverFilters.values = []
    }
    render(serverFilters);
    renderFilters(serverFilters);
  })

  // Jira Type 
  const HandlejiraTypeChange = (type => {
    serverFilters.jiraType = []

    if (type != null) {
      type.map((item, index) => {
        return serverFilters.jiraType.push(item.value)
      })
    }

    else {
      serverFilters.jiraType = []
    }
    render(serverFilters);
  })

  // Qa Representative 
  const HandleqaRepresentativeChange = (Qa => {
    serverFilters.qaRepresentative = []
    if (Qa != null) {
      Qa.map((item, index) => {
        return serverFilters.qaRepresentative.push(item.value)
      })
    }
    else {
      serverFilters.qaRepresentative = []
    }

    render(serverFilters);
  })

  // Start Date 
  const HandleStartDateChange = (date => {
    setStartDate(date.target.value)
    serverFilters.startDate = (date.target.value);
    render(serverFilters);
  })

  // End Date 
  const HandleEndDateChange = (date => {
    setEndDate(date.target.value)
    let endDate = new Date(date.target.value)
    const timeZone = (endDate.getTimezoneOffset() / 60);
    endDate.setHours((0 - timeZone) + (23), 59, 59, 59);
    serverFilters.endDate = endDate;
    render(serverFilters);
  })

  // Label
  const HandleLabelChange = (label => {
    serverFilters.label = [label.value];
    render(serverFilters);
  })

  //We Use UseRef to clear other filters when we pick Main Filter
  const fixVersionInput = useRef("")
  const jiraTypeInput = useRef("")
  const qaInput = useRef("")
  const periodInput = useRef("")
  const selectFilterInput = useRef("")

  //Filters Section

  //Modification By Field save filters Variables

  //Filters Variable to save the filters data
  let savedFilters = { pageName: 'DelaysInDelivery', filters: [{ filter: 'fixVersion', values: [] }, { filter: 'jiraType', values: [] }, { filter: 'qaRepresentative', values: [] }, { filter: 'label', values: [] }], filterName: '' };

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


    savedFilters.filters[0].values.push(serverFilters.fixVersion);
    savedFilters.filters[1].values.push(serverFilters.jiraType);
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
      fixVersion: [],
      jiraType: [],
      qaRepresentative: [],
      startDate: (startDate),
      endDate: (endDate),
      label: ["weekly"]
    };
    if (change != null) {
      setSelectFilterCurrentOption(change.value);
      for (let i = 0; i < savedFiltersArray.length - 1; i++) {
        if (savedFiltersArray[savedFiltersArray.length - 1].filterNames[i].label == change.value) {
          index = i;
        }
      }

      fixVersionInput.current.state.value = { label: savedFiltersArray[index].filters[0].values }
      jiraTypeInput.current.state.value = { label: savedFiltersArray[index].filters[1].values }
      qaInput.current.state.value = { label: savedFiltersArray[index].filters[2].values }
      periodInput.current.state.value = { label: savedFiltersArray[index].filters[3].values }

      if (savedFiltersArray[index].filters[0].values != null) {
        savedFiltersArray[index].filters[0].values.map((item) => {
          serverFilters.fixVersion.push(item);
        }
        )

      }

      if (savedFiltersArray[index].filters[1].values != null) {
        savedFiltersArray[index].filters[1].values.map((item) => {
          serverFilters.jiraType.push(item);
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
    } else {
      serverFilters.fixVersion = []
      serverFilters.jiraType = []
      serverFilters.qaRepresentative = []
      serverFilters.setEndDate = ""
      serverFilters.endDate = ""
      serverFilters.label = ["weekly"]
      fixVersionInput.current.state.value = ""
      jiraTypeInput.current.state.value = ""
      qaInput.current.state.value = ""
      periodInput.current.state.value = ""
      selectFilterInput.current.state.value = ""
    }
    render(serverFilters);
  })


  //a function for handling the delete filter button
  const handleDeleteFilter = (e => {
    const pageName = 'DelaysInDelivery';
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
          jiraTypeInput.current.state.value = ""
          qaInput.current.state.value = ""
          periodInput.current.state.value = ""
          selectFilterInput.current.state.value = ""

          serverFilters = {
            fixVersion: [],
            jiraType: [],
            qaRepresentative: [],
            startDate: (startDate),
            endDate: (endDate),
            label: ["weekly"]
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

    <div className='DelaysInDeliveryWrapper'>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"></link>

      {/* Here We Call the Chart Component if we have a uiObj ready */}
      <div className="DelaysInDelivery__Chart">
        {UiObjs && <Chart UiObjs={UiObjs} title="Delays in Delivery (All)" />}
      </div>

      {/* Page Title */}
      <div className="DelaysInDelivery__Title">Delays in Delivery</div>


      {/* Select Filters */}

      <div className="DelaysInDelivery__Filters__wrapper">


        <div className="DelaysInDelivery__Filters__fields">
          <div className="DelaysInDelivery__Filters__Header">
            <p> Fix Version </p>
            <Select
              name="fixVersion"
              onInputChange={() => { jiraTypeInput.current.state.value = ""; qaInput.current.state.value = "" }}
              options={fixVersionOptions}
              placeholder="fix Version "
              ref={fixVersionInput}
              className="DelaysInDelivery__Filter"
              onChange={HandlefixVersionChange}
            />
          </div>

          <div className="DelaysInDelivery__Filters__Header">
            <p> Jira Type </p>
            <Select
              name="jiraType"
              isMulti
              ref={jiraTypeInput}
              options={jiraTypeOptions}
              placeholder="jira Type  "
              className="DelaysInDelivery__Filter"
              onChange={HandlejiraTypeChange}
            /></div>

          <div className="DelaysInDelivery__Filters__Header">
            <p> Qa Representative </p>
            <Select
              name="qaRepresentative"
              isMulti
              ref={qaInput}
              options={qaRepresentativeOptions}
              placeholder="All"
              className="DelaysInDelivery__Filter"
              onChange={HandleqaRepresentativeChange}
            /></div>

          <div className="DelaysInDelivery__Filters__Header">
            <p> Start Date </p>
            <input
              className="Filter__date"
              type="date"
              name="startDate"
              value={startDate}
              onChange={HandleStartDateChange}
            />
          </div>

          <div className="DelaysInDelivery__Filters__Header">
            <p> End Date</p>
            <input
              className="Filter__date"
              type="date"
              name="endDate"
              value={endDate}
              onChange={HandleEndDateChange}
            /></div>

          <div className="DelaysInDelivery__Filters__Header">
            <p> Period </p>
            <Select
              name="labels"
              ref={periodInput}
              options={labelOptions}
              placeholder="Weekly"
              className="DelaysInDelivery__Filter"
              onChange={HandleLabelChange}
            />
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


export default DelaysInDelivery;