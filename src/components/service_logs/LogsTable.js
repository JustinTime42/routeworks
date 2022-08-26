import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react'
import { render } from 'react-dom'
import { AgGridReact } from 'ag-grid-react'
import { getColumnDefs } from './headers'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const LogsTable = (props) => {
    const [columnDefs, setColumnDefs] = useState(getColumnDefs(props.logType))

    useEffect(() => {
        setColumnDefs(getColumnDefs(props.logType))
        console.log(props.logs)
        console.log(props.logType)
    }, [props.logType])
    const gridRef = useRef()
    //const [rowData, setRowData] = useState(props.logs)


    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizable: true
    }))

 // Example of consuming Grid Event
    const cellClickedListener = useCallback( event => {
        console.log('cellClicked', event);
    }, []);

//  // Example load data from sever
//  useEffect(() => {
//    fetch('https://www.ag-grid.com/example-assets/row-data.json')
//    .then(result => result.json())
//    .then(rowData => setRowData(rowData))
//  }, []);

 // Example using Grid's API
    const buttonListener = useCallback( e => {
        gridRef.current.api.deselectAll();
    }, [])

    return (
        <div>
            {/* Example using Grid's API */}
            <button onClick={buttonListener}>Push Me</button>

            {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
            <div className="ag-theme-alpine-dark" style={{width: '90%', height: '70vh', marginRight: 'auto', marginLeft: 'auto'}}>

            <AgGridReact
                ref={gridRef} // Ref for accessing Grid's API
                    alwaysShowHorizontalScroll = {true}

                rowData={props.logs} // Row Data for Rows

                columnDefs={columnDefs} // Column Defs for Columns
                defaultColDef={defaultColDef} // Default Column Properties

                animateRows={true} // Optional - set to 'true' to have rows animate when sorted
                rowSelection='multiple' // Options - allows click selection of rows

                onCellClicked={cellClickedListener} // Optional - registering for Grid Event
           />
            </div>
        </div>
    )
}

export default LogsTable