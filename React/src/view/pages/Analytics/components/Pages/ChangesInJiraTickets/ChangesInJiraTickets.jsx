import React from 'react';
import { useState, useEffect, useRef } from 'react';
import "./ChangesInJiraTickets.css";

//Components 
import Select from 'react-select'
import Chart from "../../charts/Chart"


// Filters To Send To Server 
let serverFilters = {
  values: [],
  status: [],
  qaRepresentative: [],
  startDate: "",
  endDate: "",
  label: []
};

function ChangesInJiraTickets() {


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
      values: ["newValue"],
      status: [],
      qaRepresentative: [],
      startDate: startDate,
      endDate: endDate,
      label: ["weekly"]
    };

    //fetch to receive Available Filters options from server by date
    fetch('/api/analytics/changeOfJIRATicketsStatusFilters', {
      method: 'POST',
      body: JSON.stringify(serverFilters),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setStatusOptions(data[0].status)
          setQaRepresentativeOptions(data[0].qa)
        }
        else {
          alert("No Available Filters From The Server Check The connection / Change date")
        }
      })

    //fetch to receive Data (UiObj) from the server
    fetch('/api/analytics/changeOfJIRATicketsStatus', {
      method: 'POST',
      body: JSON.stringify(serverFilters),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        setUiObjs(data)

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
    fetch('/api/analytics/changeOfJIRATicketsStatus', {
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

  // Changes Of Jira Tickets Variables :

  // To set UiObj from the filtered Data we recieved from server 
  const [UiObjs, setUiObjs] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Options To get From Server 
  const [statusOptions, setStatusOptions] = useState([])
  const [qaRepresentativeOptions, setQaRepresentativeOptions] = useState([])

  // Old / New Value Filter
  const valueOptions = [
    { value: "newValue", label: "New Value" },
    { value: "oldValue", label: "Old Value" }
  ]

  //Labels for Displaying the Chart
  const labelOptions = [
    { name: "label", value: "daily", label: "Daily" },
    { name: "label", value: "weekly", label: "Weekly" },
    { name: "label", value: "monthly", label: "Monthly" },
    { name: "label", value: "yearly", label: "Yearly" }
  ]




  //Filters Changes Handlers
  // for each Filter we have a handler
  // to update serverFilters that we send to server to receive data according to our picks 

  // old/new 
  const HandleValuesChange = (change => {
    serverFilters.qaRepresentative = []
    serverFilters.status = []
    if (change != null) {
      serverFilters.values = [change.value]
    }
    else {
      serverFilters.values = [];
      statusInput.current.state.value = "";
      qaInput.current.state.value = ""
    }
    render(serverFilters);
  })

  // Status  => Done / BackLog / In Progress ....  
  const HandleStatusChange = (change => {

    serverFilters.status = []
    if (change != null) (
      change.map((item) => {
        return (
          serverFilters.status.push(item.value)
        )
      }))

    render(serverFilters);
  })

  // Qa Representative  
  const HandleqaRepresentativeChange = (change => {
    serverFilters.qaRepresentative = []
    if (change != null) (
      change.map((item) => {
        return (
          serverFilters.qaRepresentative.push(item.value)
        )
      }))

    render(serverFilters);
  })

  // Dates 
  const HandleStartDateChange = (date => {
    setStartDate(date.target.value)
    serverFilters.startDate = (date.target.value)
    render(serverFilters);
  })

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
    serverFilters.label = [label.value]

    render(serverFilters);
  })


  //We Use UseRef to clear other filters when we pick Main Filter
  const valuesInput = useRef("")
  const statusInput = useRef("")
  const qaInput = useRef("")
  const periodInput = useRef("")
  const selectFilterInput = useRef("")


  //Filters Section

  //Modification By Field save filters Variables



  //Filters Variable to save the filters data
  let savedFilters = { pageName: 'ChangesInJiraTickets', filters: [{ filter: 'values', values: [] }, { filter: 'status', values: [] }, { filter: 'qaRepresentative', values: [] }, { filter: 'label', values: [] }], filterName: '' };

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
    savedFilters.filters[0].values.push(serverFilters.values);
    savedFilters.filters[1].values.push(serverFilters.status);
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
      values: ["newValue"],
      status: [],
      qaRepresentative: [],
      startDate: startDate,
      endDate: endDate,
      label: ["weekly"]
    };
    if(change!=null){
    setSelectFilterCurrentOption(change.value);
    for (let i = 0; i < savedFiltersArray.length - 1; i++) {
      if (savedFiltersArray[savedFiltersArray.length - 1].filterNames[i].label == change.value) {
        index = i;
      }
    }

    valuesInput.current.state.value = { label: savedFiltersArray[index].filters[0].values }
    statusInput.current.state.value = { label: savedFiltersArray[index].filters[1].values }
    qaInput.current.state.value = { label: savedFiltersArray[index].filters[2].values }
    periodInput.current.state.value = { label: savedFiltersArray[index].filters[3].values }

    if (savedFiltersArray[index].filters[0].values != null) {
      savedFiltersArray[index].filters[0].values.map((item) => {
        serverFilters.values.push(item);
      }
      )

    }

    if (savedFiltersArray[index].filters[1].values != null) {
      savedFiltersArray[index].filters[1].values.map((item) => {
        serverFilters.status.push(item);
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
    }else{
      serverFilters.values=["newValue"]
      serverFilters.status=[]
      serverFilters.qaRepresentative=[]
      serverFilters.startDate =startDate
      serverFilters.endDate=endDate
      serverFilters.label=["weekly"]
       valuesInput.current.state.value = ""
       statusInput.current.state.value = ""
       qaInput.current.state.value = ""
     periodInput.current.state.value = ""
     selectFilterInput.current.state.value= ""
    }

    render(serverFilters);
  })


  //a function for handling the delete filter button
  const handleDeleteFilter = (e => {
    const pageName = 'ChangesInJiraTickets';
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

          valuesInput.current.state.value = ""
          statusInput.current.state.value = ""
          qaInput.current.state.value = ""
          periodInput.current.state.value = ""
          selectFilterInput.current.state.value = ""

          serverFilters = {
            values: ["newValue"],
            status: [],
            qaRepresentative: [],
            startDate: startDate,
            endDate: endDate,
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

    <div className='ChangeOfJiraTicketWrapper'>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"></link>

      {/* Here We Call the Chart Component if we have a uiObj ready */}

      <div className="ChangeOfJiraTicket__Chart">
        {UiObjs && <Chart UiObjs={UiObjs} title="Changes In Jira Ticket Status (All)" />}
      </div>

      <div className="ChangeOfJiraTicket__Title">Changes Of Jira Tickets</div>

      <div className="ChangeOfJiraTicket__Filters__wrapper">

        <div className="ChangeOfJiraTicket__Filters__fields">
        
          <div className="ChangeOfJiraTicket__Filters__Header">
            <p> Old/New  </p>
            <Select
              onInputChange={() => { statusInput.current.state.value = ""; qaInput.current.state.value = "" }}
              name="oldNew"
              options={valueOptions}
              placeholder="New value"
              className="ChangeOfJiraTicket__Filter"
              ref={valuesInput}
              onChange={HandleValuesChange}
              isClearable={true} />
          </div>

          <div className="ChangeOfJiraTicket__Filters__Header">
            <p> Status </p>
            <Select
              name="status"
              ref={statusInput}
              isMulti
              options={statusOptions}
              placeholder="Status "
              className="ChangeOfJiraTicket__Filter"
              onChange={HandleStatusChange} />
          </div>

          <div className="ChangeOfJiraTicket__Filters__Header">
            <p> Qa Representative</p>
            <Select
              name="qaRepresentative"
              isMulti
              ref={qaInput}
              options={qaRepresentativeOptions}
              placeholder="All"
              className="DelaysInDelivery__Filter"
              onChange={HandleqaRepresentativeChange} />
          </div>

          <div className="ChangeOfJiraTicket__Filters__Header">
            <p> Start Date </p>
            <input
              className="Filter__date"
              type="date"
              name="startDate"
              value={startDate}
              onChange={HandleStartDateChange} />
          </div>

          <div className="ChangeOfJiraTicket__Filters__Header">
            <p> End Date </p>
            <input
              className="Filter__date"
              type="date"
              name="endDate"
              value={endDate}
              onChange={HandleEndDateChange} />
          </div>

          <div className="ChangeOfJiraTicket__Filters__Header">
            <p> Period </p>
            <Select
              name="labels"
              options={labelOptions}
              ref={periodInput}
              placeholder="Weekly"
              className="ChangeOfJiraTicket__Filter"
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


export default ChangesInJiraTickets;