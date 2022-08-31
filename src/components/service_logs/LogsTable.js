import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'react-bootstrap'
import { render } from 'react-dom'
import { AgGridReact } from 'ag-grid-react'
import { getColumnDefs } from './headers'
import { deleteItem, editItem } from '../../actions'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { SET_LOG_ENTRIES } from '../../constants'
import { DateTimeEditor, DateTimeRenderer } from './DateTimePicker'

const LogsTable = (props) => {
    const [columnDefs, setColumnDefs] = useState(getColumnDefs(props.logType))
    const logs = useSelector(state => state.setLogs.entries)
    const dispatch = useDispatch()

    useEffect(() => {
        setColumnDefs(getColumnDefs(props.logType))
        console.log(props.logs)
        console.log(props.logType)
    }, [props.logType])
    const gridRef = useRef()

    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizable: true,
        editable: props.editable && (props.logType === 'raw'),
    }))

    const numberParser = (params) => {
        console.log(params.newValue)
        return Number(params.newValue) 
    }

    const buttonListener = useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
      }, []);

    const cellValueChangedListener = useCallback(e => {
        console.log(e.data)
        dispatch(editItem(e.data, logs, 'service_logs', null, SET_LOG_ENTRIES))
    }, [])

    const onStopped = useCallback(e => { 
        console.log(e)
    })

    return (
        <div className="ag-theme-alpine-dark" style={{width: '90%', height: '70vh', marginRight: 'auto', marginLeft: 'auto'}}>
            <Button style={{visibility: logs.length ? 'visible' : 'hidden'}} onClick={buttonListener}>Download CSV</Button>
            <AgGridReact
                ref={gridRef} 
                alwaysShowHorizontalScroll = {true}
                rowData={logs} 
                columnDefs={columnDefs} 
                defaultColDef={defaultColDef}
                rowSelection='multiple'                
                onCellValueChanged={cellValueChangedListener}
                onCellEditingStopped={onStopped}
            />
        </div>
    )
}

export default LogsTable