import React from 'react';
import "./DeletedJiraTickets.css";
import Chart from "../../charts/Chart"
import Select from 'react-select';
import { useState, useRef, useEffect } from 'react';

//Server Filters to receive Data
let serverFilters = { priority: [], functionalTest: [], label: [], qaRepresentative: [], startDate: "", endDate: "" };

function DeletedJiraTickets() {

  //On Page Opening
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
      priority: [],
      functionalTest: [],
      label: ["weekly"],
      qaRepresentative: [],
      startDate: startDate,
      endDate: endDate
    };
    //fetch to receive Data (UiObj) from server
    fetch('/api/analytics/deletedJiraTickets', {
      method: 'POST',
      body: JSON.stringify({ serverFilters }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data != null) { setUiObjs(data); }
        else { setUiObjs([]); }
      })

    //fetch to receive Available Filters options from server by date
    fetch('/api/analytics/deletedJiraTicketsFilters', {
      method: 'POST',
      body: JSON.stringify({ startDate: serverFilters.startDate, endDate: serverFilters.endDate, label: serverFilters.label }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setPriorityOptions(data[0].priorities)
          setQaRepresentativeOptions(data[0].QA)
        }
        else {
          alert("No Available Filters From The Server Check The connection / Change date")
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
  }
    , [])

  //fetch to receive Data (UiObj) from server after every filter Change
  const render = (serverFilters) => {
    console.log(serverFilters)
    fetch('/api/analytics/deletedJiraTickets', {
      method: 'POST',
      body: JSON.stringify({ serverFilters }),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data != null) { setUiObjs(data); }
        else { setUiObjs([]); }
      })
  }


  //Deleted Jira TicketsVariables
  const [UiObjs, setUiObjs] = useState([]); //UiObject from the server
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Options To get From Server 
  const [priorityOptions, setPriorityOptions] = useState([]);//proiority options for filters
  const [qaRepresentativeOptions, setQaRepresentativeOptions] = useState([]);//Qa Representative options for filters
  const functionalTestOptions = [//functionalTest options for filters
    { name: "functionalTest", value: true, label: "True" },
    { name: "functionalTest", value: false, label: "False" },
  ]

  const labelOptions = [//Label options for filters
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }]



  //Filters Changes Handlers
  // for each Filter we have a handler
  // to update serverFilters that we send to server to receive data according to our picks

  //priority:
  const HandlePriorityChange = (change => {
    serverFilters.functionalTest = [];
    serverFilters.qaRepresentative = [];
    serverFilters.priority = []
    if (change != null) {
      change.map((item) => {
        return (
          serverFilters.priority.push(item.value)
        )
      })
    }
    else {
      serverFilters.priority = [];
      functionalTestInput.current.state.value = "";
      qaInput.current.state.value = ""
    }
    render(serverFilters);
  })
  //functionaltest
  const HandlefunctionalTestChange = (change => {
    serverFilters.functionalTest = [];
    if (change != null) (
      change.map((item) => {
        return (
          serverFilters.functionalTest.push(item.value)
        )
      }))
    render(serverFilters);
  })
  //Qa Representative:
  const HandleqaRepresentativeChange = (change => {
    serverFilters.qaRepresentative = [];
    if (change != null) (
      change.map((item) => {
        return (
          serverFilters.qaRepresentative.push(item.value)
        )
      }))
    render(serverFilters);
  })
  ///Start Date:
  const HandleStartDateChange = (change => {
    setStartDate(change.target.value)
    serverFilters.startDate = new Date(change.target.value);
    render(serverFilters);
  })
  //End Date:
  const HandleEndDateChange = (change => {
    setEndDate(change.target.value)
    let endDate = new Date(change.target.value)
    const timeZone = (endDate.getTimezoneOffset() / 60);
    endDate.setHours((0 - timeZone) + (23), 59, 59, 59);
    serverFilters.endDate = endDate;
    render(serverFilters);
  })
  //Label:
  const HandleLabelChange = (label => {
    serverFilters.label = [label.value];
    render(serverFilters);
  })


  //We Use UseRef to clear other filters when we pick Main Filter
  const priorityInput = useRef("")
  const functionalTestInput = useRef("")
  const qaInput = useRef("")
  const periodInput = useRef("")
  const selectFilterInput = useRef("")


  //Filters Section

  //save filters Variables

  //Filters Variable to save the filters data
  let savedFilters = { pageName: 'DeletedJiraTickets', filters: [{ filter: 'priority', values: [] }, { filter: 'functionalTest', values: [] }, { filter: 'label', values: [] }, { filter: 'qaRepresentative', values: [] }], filterName: '' };

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
    savedFilters.filters[0].values.push(serverFilters.priority);
    savedFilters.filters[1].values.push(serverFilters.functionalTest);
    savedFilters.filters[2].values.push(serverFilters.label[0]);
    savedFilters.filters[3].values.push(serverFilters.qaRepresentative);
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
      priority: [],
      functionalTest: [],
      label: ["weekly"],
      qaRepresentative: [],
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

      priorityInput.current.state.value = { label: savedFiltersArray[index].filters[0].values }
      functionalTestInput.current.state.value = { label: savedFiltersArray[index].filters[1].values }
      periodInput.current.state.value = { label: savedFiltersArray[index].filters[2].values }
      qaInput.current.state.value = { label: savedFiltersArray[index].filters[3].values }

      if (savedFiltersArray[index].filters[0].values != null) {
        savedFiltersArray[index].filters[0].values.map((item) => {
          serverFilters.priority.push(item);
        }
        )

      }

      if (savedFiltersArray[index].filters[1].values != null) {
        savedFiltersArray[index].filters[1].values.map((item) => {
          serverFilters.functionalTest.push(item);
        }
        )

      }
      if (savedFiltersArray[index].filters[2].values != null) {
        savedFiltersArray[index].filters[2].values.map((item) => {
          serverFilters.label.push(item);
        }
        )

      }
      if (savedFiltersArray[index].filters[3].values != null) {
        savedFiltersArray[index].filters[3].values.map((item) => {
          serverFilters.qaRepresentative.push(item);
        }
        )

      }
    } else {




      serverFilters.priority = []
      serverFilters.functionalTest = []
      serverFilters.label = ["weekly"]
      serverFilters.startDate = startDate
      serverFilters.endDate = endDate
      serverFilters.qaRepresentative = []
      priorityInput.current.state.value = ""
      functionalTestInput.current.state.value = ""
      qaInput.current.state.value = ""
      periodInput.current.state.value = ""
      selectFilterInput.current.state.value = ""
    }

    render(serverFilters);
  })


  //a function for handling the delete filter button
  const handleDeleteFilter = (e => {
    const pageName = 'DeletedJiraTickets';
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

          priorityInput.current.state.value = ""
          functionalTestInput.current.state.value = ""
          qaInput.current.state.value = ""
          periodInput.current.state.value = ""
          selectFilterInput.current.state.value = ""

          serverFilters = {
            priority: [],
            functionalTest: [],
            label: ["weekly"],
            qaRepresentative: [],
            startDate: startDate,
            endDate: endDate
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
    <div className='DeletedJiraTicketsWrapper'>
      <div className="DeletedJiraTickets__Chart"> {UiObjs && <Chart UiObjs={UiObjs} title="Deleted Jira Tickets (All)" />}</div>
      <div className="DeletedJiraTickets__Title">Deleted Jira Tickets</div>

      <div className="DeletedJiraTickets__Filters__wrapper">


        <div className="DeletedJiraTickets__Filters__fields">
          <div className="DeletedJiraTickets__Filters__Header">
            <p>Priority</p>
            <Select
              name="priority"
              onInputChange={() => { functionalTestInput.current.state.value = ""; qaInput.current.state.value = "" }}
              ref={priorityInput}
              isMulti
              options={priorityOptions}
              placeholder="All"
              className="DeletedJiraTickets__Filter"
              onChange={HandlePriorityChange}
            />
          </div>
          <div className="DeletedJiraTickets__Filters__Header">
            <p>Functional Test </p>
            <Select
              name="functional test"
              isMulti
              ref={functionalTestInput}
              options={functionalTestOptions}
              placeholder="functional-Test "
              className="DeletedJiraTickets__Filter"
              onChange={HandlefunctionalTestChange}
            />
          </div>

          <div className="DeletedJiraTickets__Filters__Header">
            <p>Qa Representative</p>
            <Select
              name="qaRepresentative"
              isMulti
              ref={qaInput}
              options={qaRepresentativeOptions}
              placeholder="All"
              className="DeletedJiraTickets__Filter"
              onChange={HandleqaRepresentativeChange}
            /></div>

          <div className="DeletedJiraTickets__Filters__Header">
            <p>Start Date</p>
            <input
              className="Filter__date"
              type="date"
              name="startDate"
              value={startDate}
              onChange={HandleStartDateChange}
            />
          </div>


          <div className="DeletedJiraTickets__Filters__Header">
            <p>End Date</p>
            <input
              className="Filter__date"
              type="date"
              name="endDate"
              value={endDate}
              onChange={HandleEndDateChange}
            />
          </div>
          <div className="DeletedJiraTickets__Filters__Header">
            <p>Period</p>
            <Select
              name="labels"
              options={labelOptions}
              placeholder="Weekly"
              className="DeletedJiraTickets__Filter"
              ref={periodInput}
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





export default DeletedJiraTickets;