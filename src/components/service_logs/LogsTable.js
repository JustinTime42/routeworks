import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { AgGridReact } from 'ag-grid-react'
import { getColumnDefs } from './headers'
import { deleteItem, editItem, setIsLoading } from '../../actions'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { SET_LOG_ENTRIES } from '../../constants'
import { DateTimeEditor, DateTimeRenderer } from './utils'
import ButtonWithLoading from '../buttons/ButtonWithLoading'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'

const LogsTable = (props) => {
    const [columnDefs, setColumnDefs] = useState(getColumnDefs(props.logType))
    const logs = useSelector(state => state.setLogs.entries)
    const organization = useSelector(state => state.setCurrentUser.currentUser.claims.organization)
    const isLoading = useSelector(state => state.setIsLoading.isLoading)
    const gridRef = useRef();

    const dispatch = useDispatch()

    useEffect(() => {
        setColumnDefs(getColumnDefs(props.logType, props.editable))
        console.log(props.editable)
        console.log(props.logType)
    }, [props.logType, props.editable])

    useEffect(() => {
        //preserve scroll position between renders
    })

    const defaultColDef = useMemo( ()=> ({
        sortable: true,
        resizable: true,
        editable: props.editable && ((props.logType === 'raw') || (props.logType === 'customer') || (props.logType === 'stripe')),
    }))

    const numberParser = (params) => {
        console.log(params.newValue)
        return Number(params.newValue)
    }

    const downloadListener = useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
      }, []);

    const deleteListener = useCallback(() => {
        gridRef.current.api.getSelectedRows().forEach(row => {
            dispatch(deleteItem(row.data, logs, `organizations/${organization}/service_logs`, null, SET_LOG_ENTRIES))
        })        
    }, [dispatch, logs, organization]);

    const addSelectedToInvoice = useCallback(() => {
        console.log(JSON.stringify(gridRef.current.api.getSelectedRows()))
        dispatch(setIsLoading(true))
        const createInvoiceItems = httpsCallable(functions, "createInvoiceItems")  
        createInvoiceItems({logsArray: JSON.stringify(gridRef.current.api.getSelectedRows())}) 
        .then(res => {
            console.log(res)
            setIsLoading(false)
        })
        .catch(err => {
            setIsLoading(false)
            alert(err)
        })
    },[dispatch])

    const cellValueChangedListener = useCallback(e => {
        console.log(e.data)
        dispatch(editItem(e.data, logs, `organizations/${organization}/service_logs`, null, SET_LOG_ENTRIES))
    }, [])

    const onStopped = useCallback(e => { 
        console.log(e)
    },[])

    return (
        <div className="ag-theme-alpine-dark" style={{width: '90%', height: props.height, marginRight: 'auto', marginLeft: 'auto'}}>
            <div style={{display: "flex"}}>
                <Button 
                    style={{visibility: logs.length ? 'visible' : 'hidden', marginRight: "1em"}} 
                    onClick={downloadListener}>
                    Download CSV
                </Button>
                <ButtonWithLoading
                    handleClick={addSelectedToInvoice}
                    tooltip="Add selected items to each customer's next invoice."
                    buttonText="Invoice Selected"
                    isLoading={isLoading}
                    variant="primary"
                    style={{visibility: logs.length ? 'visible' : 'hidden', marginRight: "1em"}} 
                />
                <Button 
                    style={{visibility: logs.length ? 'visible' : 'hidden', marginRight: "1em"}} 
                    onClick={deleteListener}>
                    Delete Selected
                </Button>
            </div>

            <AgGridReact
                ref={gridRef} 
                alwaysShowHorizontalScroll = {true}
                rowData={logs} 
                columnDefs={columnDefs} 
                defaultColDef={defaultColDef}
                rowSelection='multiple'                
                onCellValueChanged={cellValueChangedListener}
                onCellEditingStopped={onStopped}
                showDisabledCheckboxes={true}
                rowMultiSelectWithClick={true}
            />
        </div>
    )
}

export default LogsTable